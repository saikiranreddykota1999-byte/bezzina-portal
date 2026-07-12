/** Marketing site brand tokens — blue + gold */
export const brand = {
  blue: '#0B3D91',
  blueHover: '#09407a',
  gold: '#D8A106',
  navy: '#071B35',
  surface: '#F8FAFC',
} as const;

export const brandClasses = {
  eyebrow: 'text-sm font-semibold uppercase tracking-[0.2em] text-[#D8A106]',
  btnPrimary:
    'inline-flex items-center justify-center rounded-full bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2',
  btnSecondary:
    'inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2',
  link: 'font-medium text-[#0B3D91] transition hover:text-[#09407a] hover:underline',
  input:
    'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]',
  card: 'rounded-[20px] border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(7,27,53,0.06)]',
} as const;
