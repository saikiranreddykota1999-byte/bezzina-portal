import { describe, expect, it } from 'vitest';

import { tryLocalFaqReply } from '@/lib/ask-bezzina/local-faq';

describe('tryLocalFaqReply', () => {
  it('answers hours / timings without Gemini', () => {
    const result = tryLocalFaqReply('What are your timings?');
    expect(result?.confidence).toBe('high');
    expect(result?.summary).toMatch(/7:00 AM/i);
    expect(result?.searchQueries).toEqual([]);
  });

  it('handles common typos like limints', () => {
    const result = tryLocalFaqReply("What's your limints");
    expect(result?.summary).toMatch(/Monday/i);
  });

  it('answers contact questions', () => {
    const result = tryLocalFaqReply('What is your phone number?');
    expect(result?.summary).toMatch(/\+356/i);
  });

  it('returns null for product questions', () => {
    expect(tryLocalFaqReply('Do you stock stainless hex bolts M8?')).toBeNull();
  });
});
