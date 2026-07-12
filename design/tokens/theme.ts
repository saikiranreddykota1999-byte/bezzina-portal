import { colors } from './colors';
import { radius } from './radius';
import { shadow } from './shadow';
import { spacing } from './spacing';

export const adminTheme = {
  colors,
  spacing,
  radius,
  shadow,
  fontFamily: 'var(--font-admin), Inter, system-ui, sans-serif',
  sidebarWidth: '17.5rem',
  sidebarCollapsedWidth: '5rem',
  headerHeight: '4rem',
  watermarkOpacity: 0.06,
} as const;

export type AdminTheme = typeof adminTheme;
