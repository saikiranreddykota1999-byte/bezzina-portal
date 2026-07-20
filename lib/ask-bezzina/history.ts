import type { AskBezzinaHistoryMessage } from '@/lib/ask-bezzina/types';

/**
 * Never trust client-supplied assistant turns — they enable prompt injection.
 * Only forward recent user messages as conversational context.
 */
export function sanitizeAskBezzinaHistory(
  history: AskBezzinaHistoryMessage[] | undefined,
  maxUserTurns = 6,
): AskBezzinaHistoryMessage[] {
  if (!history?.length) return [];

  return history
    .filter((entry) => entry.role === 'user')
    .map((entry) => ({
      role: 'user' as const,
      content: entry.content.trim().slice(0, 1000),
    }))
    .filter((entry) => entry.content.length > 0)
    .slice(-maxUserTurns);
}
