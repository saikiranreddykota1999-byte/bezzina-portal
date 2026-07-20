import { GoogleGenAI, type Content, type Part } from '@google/genai';

import { buildAskBezzinaSystemPrompt } from '@/lib/ask-bezzina/system-prompt';
import type {
  AskBezzinaHistoryMessage,
  AskBezzinaIdentifyResult,
} from '@/lib/ask-bezzina/types';
import { askBezzinaIdentifySchema } from '@/lib/validators/ask-bezzina';

const DEFAULT_MODEL = 'gemini-3.5-flash';
const FALLBACK_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-2.0-flash',
] as const;
const MAX_SEARCH_QUERIES = 5;
const MAX_ATTEMPTS_PER_MODEL = 2;

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

/**
 * Parse and normalize the model JSON payload into search-ready identify result.
 * Exported for unit tests (no network).
 */
export function parseIdentifyContent(raw: string): AskBezzinaIdentifyResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(raw));
  } catch {
    throw new Error('Ask Bezzina returned invalid JSON');
  }

  const result = askBezzinaIdentifySchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? 'Ask Bezzina response invalid');
  }

  const searchQueries = normalizeSearchQueries(result.data.searchQueries);
  return {
    summary: result.data.summary,
    searchQueries,
    confidence: result.data.confidence,
  };
}

export function normalizeSearchQueries(queries: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const query of queries) {
    const cleaned = query.replace(/\s+/g, ' ').trim();
    if (cleaned.length < 2) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(cleaned.slice(0, 80));
    if (out.length >= MAX_SEARCH_QUERIES) break;
  }

  return out;
}

export function isAskBezzinaConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getAskBezzinaModel(): string {
  return process.env.ASK_BEZZINA_MODEL?.trim() || DEFAULT_MODEL;
}

export function getAskBezzinaModels(): string[] {
  const preferred = getAskBezzinaModel();
  return [preferred, ...FALLBACK_MODELS.filter((model) => model !== preferred)];
}

type IdentifyInput = {
  message: string;
  history?: AskBezzinaHistoryMessage[];
  imageDataUrl?: string;
};

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const prefix = 'data:';
  const marker = ';base64,';
  if (!dataUrl.startsWith(prefix)) return null;
  const markerIndex = dataUrl.indexOf(marker);
  if (markerIndex < 0) return null;
  const mimeType = dataUrl.slice(prefix.length, markerIndex).trim();
  const data = dataUrl.slice(markerIndex + marker.length);
  if (!mimeType || !data) return null;
  return { mimeType, data };
}

function extractResponseText(response: {
  text?: string;
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}): string {
  const direct = response.text?.trim();
  if (direct) return direct;

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text?.trim() ?? '')
    .filter(Boolean)
    .join('\n')
    .trim();
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}

function isRetryableStatus(status: number | undefined): boolean {
  return status === 429 || status === 503 || status === 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildContents(input: IdentifyInput): Content[] {
  const history = (input.history ?? []).slice(-6);
  const contents: Content[] = [];

  for (const entry of history) {
    const role = entry.role === 'assistant' ? 'model' : 'user';
    const last = contents[contents.length - 1];
    if (last?.role === role) {
      // Gemini requires alternating roles — merge consecutive same-role turns.
      const prevText = last.parts?.[0] && 'text' in last.parts[0] ? last.parts[0].text : '';
      last.parts = [{ text: `${prevText}\n${entry.content}`.trim() }];
      continue;
    }
    contents.push({
      role,
      parts: [{ text: entry.content }],
    });
  }

  const text =
    input.message.trim() ||
    'Please identify this part from the photo and suggest catalogue search terms.';

  const userParts: Part[] = [{ text }];
  if (input.imageDataUrl) {
    const image = parseDataUrl(input.imageDataUrl);
    if (image) {
      userParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }
  }

  const last = contents[contents.length - 1];
  if (last?.role === 'user') {
    const prevText = last.parts?.[0] && 'text' in last.parts[0] ? String(last.parts[0].text) : '';
    last.parts = [{ text: `${prevText}\n${text}`.trim() }, ...userParts.slice(1)];
  } else {
    contents.push({ role: 'user', parts: userParts });
  }

  return contents;
}

/**
 * Call Gemini vision/chat and return structured identification + search queries.
 * Retries and falls back across models when the API is busy.
 */
export async function identifyPart(input: IdentifyInput): Promise<AskBezzinaIdentifyResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey });
  const contents = buildContents(input);
  const models = getAskBezzinaModels();
  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt += 1) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: buildAskBezzinaSystemPrompt(),
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        });

        const content = extractResponseText(response);
        if (!content) {
          throw new Error('Ask Bezzina returned an empty response');
        }

        return parseIdentifyContent(content);
      } catch (error) {
        lastError = error;
        const status = getErrorStatus(error);
        if (isRetryableStatus(status) && attempt < MAX_ATTEMPTS_PER_MODEL) {
          await sleep(400 * attempt);
          continue;
        }
        if (isRetryableStatus(status)) {
          break; // try next model
        }
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Ask Bezzina is temporarily unavailable. Please try again shortly.');
}

export async function fileToImageDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || 'image/jpeg';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

/** Map Gemini/API failures to clear customer-facing copy. */
export function toAskBezzinaUserError(error: unknown): string {
  const status = getErrorStatus(error);
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (status === 429 || message.includes('quota') || message.includes('rate')) {
    return 'Ask Bezzina is busy right now. Please wait a moment and try again, or contact us / WhatsApp.';
  }
  if (status === 503 || message.includes('high demand') || message.includes('unavailable')) {
    return 'Ask Bezzina is temporarily unavailable. Please try again in a minute, or contact us / WhatsApp.';
  }
  if (message.includes('not configured') || message.includes('api_key')) {
    return 'Ask Bezzina is not configured on this server yet. Please contact us via WhatsApp or the Contact page.';
  }
  return 'Something went wrong while reaching Ask Bezzina. Please try again, or contact us / WhatsApp.';
}
