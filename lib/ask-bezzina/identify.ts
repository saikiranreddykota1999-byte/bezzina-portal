import OpenAI from 'openai';

import { buildAskBezzinaSystemPrompt } from '@/lib/ask-bezzina/system-prompt';
import type {
  AskBezzinaHistoryMessage,
  AskBezzinaIdentifyResult,
} from '@/lib/ask-bezzina/types';
import { askBezzinaIdentifySchema } from '@/lib/validators/ask-bezzina';

const DEFAULT_MODEL = 'gpt-4o-mini';
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
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getAskBezzinaModel(): string {
  return process.env.ASK_BEZZINA_MODEL?.trim() || DEFAULT_MODEL;
}

type IdentifyInput = {
  message: string;
  history?: AskBezzinaHistoryMessage[];
  imageDataUrl?: string;
};

type ChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

/**
 * Call OpenAI vision/chat and return structured identification + search queries.
 */
export async function identifyPart(input: IdentifyInput): Promise<AskBezzinaIdentifyResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const client = new OpenAI({ apiKey });
  const history = (input.history ?? []).slice(-6);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: buildAskBezzinaSystemPrompt() },
    ...history.map((entry) => ({
      role: entry.role,
      content: entry.content,
    })),
  ];

  const userParts: ChatContentPart[] = [];
  const text =
    input.message.trim() ||
    'Please identify this part from the photo and suggest catalogue search terms.';
  userParts.push({ type: 'text', text });

  if (input.imageDataUrl) {
    userParts.push({
      type: 'image_url',
      image_url: { url: input.imageDataUrl },
    });
  }

  messages.push({ role: 'user', content: userParts });

  const completion = await client.chat.completions.create({
    model: getAskBezzinaModel(),
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 600,
    messages,
  });

  const content = completion.choices[0]?.message?.content;
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
