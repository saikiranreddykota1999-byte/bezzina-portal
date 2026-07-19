import { GoogleGenAI, type Content, type Part } from '@google/genai';

import { buildAskBezzinaSystemPrompt } from '@/lib/ask-bezzina/system-prompt';
import type {
  AskBezzinaHistoryMessage,
  AskBezzinaIdentifyResult,
} from '@/lib/ask-bezzina/types';
import { askBezzinaIdentifySchema } from '@/lib/validators/ask-bezzina';

const DEFAULT_MODEL = 'gemini-3.5-flash';
const MAX_SEARCH_QUERIES = 5;

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

/**
 * Call Gemini vision/chat and return structured identification + search queries.
 */
export async function identifyPart(input: IdentifyInput): Promise<AskBezzinaIdentifyResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey });
  const history = (input.history ?? []).slice(-6);

  const contents: Content[] = history.map((entry) => ({
    role: entry.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: entry.content }],
  }));

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

  contents.push({ role: 'user', parts: userParts });

  const response = await ai.models.generateContent({
    model: getAskBezzinaModel(),
    contents,
    config: {
      systemInstruction: buildAskBezzinaSystemPrompt(),
      temperature: 0.2,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  });

  const content = response.text?.trim();
  if (!content) {
    throw new Error('Ask Bezzina returned an empty response');
  }

  return parseIdentifyContent(content);
}

export async function fileToImageDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || 'image/jpeg';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}
