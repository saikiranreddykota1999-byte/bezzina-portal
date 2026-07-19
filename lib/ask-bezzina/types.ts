import type { ProductSearchHit } from '@/lib/product-search';

export type AskBezzinaRole = 'user' | 'assistant';

export type AskBezzinaHistoryMessage = {
  role: AskBezzinaRole;
  content: string;
};

export type AskBezzinaIdentifyResult = {
  summary: string;
  searchQueries: string[];
  confidence: 'high' | 'medium' | 'low';
};

export type AskBezzinaMatch = ProductSearchHit;

export type AskBezzinaReply = {
  reply: string;
  matches: AskBezzinaMatch[];
  configured: boolean;
};
