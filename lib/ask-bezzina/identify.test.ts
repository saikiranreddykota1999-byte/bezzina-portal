import { afterEach, describe, expect, it } from 'vitest';

import {
  isAskBezzinaConfigured,
  normalizeSearchQueries,
  parseIdentifyContent,
} from '@/lib/ask-bezzina/identify';

describe('parseIdentifyContent', () => {
  it('parses valid JSON identify payloads', () => {
    const result = parseIdentifyContent(
      JSON.stringify({
        summary: 'Looks like a stainless hex bolt, roughly M8.',
        searchQueries: ['stainless hex bolt M8', 'hex bolt A2'],
        confidence: 'high',
      }),
    );

    expect(result.summary).toContain('hex bolt');
    expect(result.searchQueries).toEqual(['stainless hex bolt M8', 'hex bolt A2']);
    expect(result.confidence).toBe('high');
  });

  it('strips markdown code fences before parsing', () => {
    const result = parseIdentifyContent(`\`\`\`json
{"summary":"Marine shackle","searchQueries":["bow shackle"],"confidence":"medium"}
\`\`\``);

    expect(result.summary).toBe('Marine shackle');
    expect(result.searchQueries).toEqual(['bow shackle']);
    expect(result.confidence).toBe('medium');
  });

  it('defaults confidence and trims/dedupes search queries', () => {
    const result = parseIdentifyContent(
      JSON.stringify({
        summary: 'Possible washer',
        searchQueries: ['  Flat washer  ', 'flat washer', 'x', 'Spring washer'],
      }),
    );

    expect(result.confidence).toBe('medium');
    expect(result.searchQueries).toEqual(['Flat washer', 'Spring washer']);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseIdentifyContent('not-json')).toThrow(/invalid JSON/i);
  });

  it('throws when summary is missing', () => {
    expect(() =>
      parseIdentifyContent(JSON.stringify({ searchQueries: ['bolt'], confidence: 'low' })),
    ).toThrow();
  });
});

describe('normalizeSearchQueries', () => {
  it('caps at five unique queries', () => {
    const queries = normalizeSearchQueries([
      'a1',
      'a2',
      'a3',
      'a4',
      'a5',
      'a6',
      'A1',
    ]);
    expect(queries).toHaveLength(5);
    expect(queries[0]).toBe('a1');
  });
});

describe('isAskBezzinaConfigured', () => {
  const previousKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    if (previousKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = previousKey;
    }
  });

  it('is false when GEMINI_API_KEY is missing (graceful degrade path)', () => {
    delete process.env.GEMINI_API_KEY;
    expect(isAskBezzinaConfigured()).toBe(false);
  });

  it('is true when GEMINI_API_KEY is set', () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    expect(isAskBezzinaConfigured()).toBe(true);
  });
});

describe('toAskBezzinaUserError', () => {
  it('maps high-demand / unavailable errors clearly', async () => {
    const { toAskBezzinaUserError } = await import('@/lib/ask-bezzina/identify');
    const err = Object.assign(new Error('high demand'), { status: 503 });
    expect(toAskBezzinaUserError(err)).toMatch(/temporarily unavailable/i);
  });
});
