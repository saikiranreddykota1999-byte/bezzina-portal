import { z } from 'zod';

export const ASK_BEZZINA_MAX_MESSAGE_LENGTH = 1000;
export const ASK_BEZZINA_MAX_HISTORY = 8;

export const askBezzinaHistoryMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(ASK_BEZZINA_MAX_MESSAGE_LENGTH),
});

export const askBezzinaRequestSchema = z
  .object({
    message: z
      .string()
      .trim()
      .max(ASK_BEZZINA_MAX_MESSAGE_LENGTH)
      .optional()
      .default(''),
    history: z.array(askBezzinaHistoryMessageSchema).max(ASK_BEZZINA_MAX_HISTORY).optional(),
    hasImage: z.boolean().optional().default(false),
  })
  .superRefine((value, ctx) => {
    const hasText = value.message.trim().length > 0;
    if (!hasText && !value.hasImage) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter a message or attach a photo of the part.',
        path: ['message'],
      });
    }
  });

export type AskBezzinaRequestInput = z.infer<typeof askBezzinaRequestSchema>;

export const askBezzinaIdentifySchema = z.object({
  summary: z.string().trim().min(1).max(1200),
  searchQueries: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
  confidence: z.enum(['high', 'medium', 'low']).default('medium'),
});
