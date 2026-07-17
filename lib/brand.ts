/** Marketing site brand tokens — blue + gold */
export const brand = {
  blue: '#0B3D91',
  blueHover: '#09407a',
  /** Decorative gold (use on dark backgrounds or large UI chrome). */
  gold: '#D8A106',
  /** WCAG AA text gold on white (≥4.5:1). */
  goldText: '#7A5C00',
  /** WCAG AA accent orange for links/text on white (≥4.5:1). */
  orangeText: '#9A3412',
  navy: '#071B35',
  surface: '#F8FAFC',
} as const;

export const brandClasses = {
  eyebrow: 'text-sm font-semibold uppercase tracking-[0.2em] text-[#7A5C00]',
  btnPrimary:
    'inline-flex items-center justify-center rounded-full bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2',
  btnSecondary:
    'inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2',
  link: 'font-medium text-[#0B3D91] underline underline-offset-2 transition hover:text-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2 rounded-sm',
  accentLink:
    'font-semibold text-[#9A3412] underline underline-offset-2 transition hover:text-[#7C2D12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2',
  input:
    'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]',
  card: 'rounded-[20px] border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(7,27,53,0.06)]',
} as const;
