'use server';

import { headers } from 'next/headers';

import {
  fileToImageDataUrl,
  identifyPart,
  isAskBezzinaConfigured,
  toAskBezzinaUserError,
} from '@/lib/ask-bezzina/identify';
import { tryLocalFaqReply } from '@/lib/ask-bezzina/local-faq';
import type { AskBezzinaHistoryMessage, AskBezzinaReply } from '@/lib/ask-bezzina/types';
import { checkPublicRateLimit } from '@/lib/auth/login-security';
import { captureException } from '@/lib/monitoring/capture';
import { toProductSearchHit, type ProductSearchHit } from '@/lib/product-search';
import { logServerError } from '@/lib/security/sanitize-error';
import { validateUploadFile } from '@/lib/security/upload-validation';
import {
  ASK_BEZZINA_MAX_HISTORY,
  askBezzinaHistoryMessageSchema,
  askBezzinaRequestSchema,
} from '@/lib/validators/ask-bezzina';
import { searchProductsForQuery } from '@/services/product.service';
import type { ActionResultWithData } from '@/types/action';

const MAX_MATCHES = 6;
const RATE_LIMIT_MAX = 15;

const NOT_CONFIGURED_REPLY =
  'Ask Bezzina is not configured on this server yet. Please contact us via WhatsApp or the Contact page, or request a quote — our team can identify the part for you.';

function parseHistory(raw: FormDataEntryValue | null): AskBezzinaHistoryMessage[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const messages: AskBezzinaHistoryMessage[] = [];
    for (const entry of parsed.slice(-ASK_BEZZINA_MAX_HISTORY)) {
      const result = askBezzinaHistoryMessageSchema.safeParse(entry);
      if (result.success) {
        messages.push(result.data);
      }
    }
    return messages;
  } catch {
    return [];
  }
}

async function collectCatalogueMatches(queries: string[]): Promise<ProductSearchHit[]> {
  const byId = new Map<string, ProductSearchHit>();

  for (const query of queries) {
    if (byId.size >= MAX_MATCHES) break;
    const { products, error } = await searchProductsForQuery(query, 12);
    if (error) {
      logServerError('askBezzinaAction.searchProductsForQuery', error);
      continue;
    }
    for (const product of products) {
      if (byId.has(product.id)) continue;
      byId.set(product.id, toProductSearchHit(product));
      if (byId.size >= MAX_MATCHES) break;
    }
  }

  return Array.from(byId.values());
}

function buildCustomerReply(
  summary: string,
  matchCount: number,
  confidence: 'high' | 'medium' | 'low',
  searchedCatalogue: boolean,
): string {
  const parts = [summary.trim()];

  if (!searchedCatalogue) {
    return parts.join('\n\n');
  }

  if (matchCount === 0) {
    parts.push(
      confidence === 'low'
        ? 'I could not confidently match this to our catalogue. Try a clearer photo, a SKU if you have one, or contact us / WhatsApp / request a quote.'
        : 'No close catalogue matches turned up. You can refine the description, or contact us / WhatsApp / request a quote and we will help.',
    );
  } else {
    parts.push(
      `Here ${matchCount === 1 ? 'is a possible match' : `are ${matchCount} possible matches`} from our catalogue. Open a product for details, or add it to your quote.`,
    );
  }

  return parts.join('\n\n');
}

export async function askBezzinaAction(
  formData: FormData,
): Promise<ActionResultWithData<AskBezzinaReply>> {
  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const allowed = await checkPublicRateLimit('ask_bezzina', ip, RATE_LIMIT_MAX);
    if (!allowed) {
      return { success: false, error: 'Too many requests. Please try again later.' };
    }

    const messageRaw = formData.get('message');
    const message = typeof messageRaw === 'string' ? messageRaw : '';
    const history = parseHistory(formData.get('history'));
    const imageEntry = formData.get('image');
    const imageFile = imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;

    const requestParsed = askBezzinaRequestSchema.safeParse({
      message,
      history,
      hasImage: Boolean(imageFile),
    });
    if (!requestParsed.success) {
      return {
        success: false,
        error: requestParsed.error.issues[0]?.message ?? 'Invalid request',
      };
    }

    if (imageFile) {
      const uploadCheck = validateUploadFile(imageFile, 'image');
      if (!uploadCheck.valid) {
        return { success: false, error: uploadCheck.error };
      }
    }

    // Hours / contact / address — answer locally (works even when Gemini is busy).
    if (!imageFile) {
      const localFaq = tryLocalFaqReply(requestParsed.data.message);
      if (localFaq) {
        return {
          success: true,
          data: {
            reply: buildCustomerReply(localFaq.summary, 0, localFaq.confidence, false),
            matches: [],
            configured: true,
          },
        };
      }
    }

    if (!isAskBezzinaConfigured()) {
      return {
        success: true,
        data: {
          reply: NOT_CONFIGURED_REPLY,
          matches: [],
          configured: false,
        },
      };
    }

    const imageDataUrl = imageFile ? await fileToImageDataUrl(imageFile) : undefined;

    const identified = await identifyPart({
      message: requestParsed.data.message,
      history: requestParsed.data.history,
      imageDataUrl,
    });

    const searchedCatalogue = identified.searchQueries.length > 0;
    const matches = searchedCatalogue
      ? await collectCatalogueMatches(identified.searchQueries)
      : [];
    const reply = buildCustomerReply(
      identified.summary,
      matches.length,
      identified.confidence,
      searchedCatalogue,
    );

    return {
      success: true,
      data: {
        reply,
        matches,
        configured: true,
      },
    };
  } catch (error) {
    logServerError('askBezzinaAction', error);
    captureException(error, { operation: 'askBezzinaAction' });
    return { success: false, error: toAskBezzinaUserError(error) };
  }
}
