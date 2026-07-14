export const LOGO_ASSET = '/bezzina-logo.png';

export type LogoVariant =
  | 'header-desktop'
  | 'header-mobile'
  | 'admin-sidebar'
  | 'admin-topbar'
  | 'admin-login-hero'
  | 'admin-login-card'
  | 'footer'
  | 'contact'
  | 'splash';

type LogoSize = {
  width: number;
  height: number;
  imageClass: string;
};

export const logoSizes: Record<LogoVariant, LogoSize> = {
  'header-desktop': {
    width: 280,
    height: 72,
    imageClass: 'h-10 w-auto max-w-[220px] sm:h-11 lg:h-12 xl:max-w-[240px]',
  },
  'header-mobile': {
    width: 200,
    height: 56,
    imageClass: 'h-9 w-auto max-w-[180px] sm:h-10',
  },
  'admin-sidebar': {
    width: 220,
    height: 60,
    imageClass: 'h-10 w-auto max-w-[200px] object-contain',
  },
  'admin-topbar': {
    width: 180,
    height: 40,
    imageClass: 'h-8 w-auto max-w-[160px] object-contain sm:h-9',
  },
  'admin-login-hero': {
    width: 220,
    height: 220,
    imageClass: 'h-auto w-[220px] max-w-full object-contain',
  },
  'admin-login-card': {
    width: 280,
    height: 72,
    imageClass: 'h-14 w-auto max-w-[260px] object-contain sm:h-16',
  },
  footer: {
    width: 80,
    height: 80,
    imageClass: 'h-20 w-20 object-contain',
  },
  contact: {
    width: 72,
    height: 72,
    imageClass: 'h-16 w-16 object-contain sm:h-[72px] sm:w-[72px]',
  },
  splash: {
    width: 120,
    height: 120,
    imageClass: 'h-24 w-24 object-contain sm:h-[120px] sm:w-[120px]',
  },
};
