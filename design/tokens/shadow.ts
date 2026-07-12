export const shadow = {
  sm: '0 1px 2px 0 rgba(7, 27, 53, 0.05)',
  md: '0 4px 12px -2px rgba(7, 27, 53, 0.08)',
  lg: '0 10px 24px -4px rgba(7, 27, 53, 0.12)',
  xl: '0 20px 40px -8px rgba(7, 27, 53, 0.16)',
  card: '0 2px 8px rgba(7, 27, 53, 0.06), 0 1px 2px rgba(7, 27, 53, 0.04)',
  cardHover: '0 8px 24px rgba(7, 27, 53, 0.1), 0 2px 6px rgba(7, 27, 53, 0.06)',
  header: '0 1px 0 rgba(7, 27, 53, 0.06), 0 4px 12px rgba(7, 27, 53, 0.04)',
} as const;

export type ShadowToken = keyof typeof shadow;
