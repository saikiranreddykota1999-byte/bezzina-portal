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
    width: 72,
    height: 72,
    imageClass:
      'h-12 w-auto object-contain sm:h-14 lg:h-[60px] xl:h-[68px] 2xl:h-[72px]',
  },
  'header-mobile': {
    width: 56,
    height: 56,
    imageClass: 'h-12 w-auto object-contain sm:h-14',
  },
  'admin-sidebar': {
    width: 60,
    height: 60,
    imageClass: 'h-[60px] w-auto object-contain',
  },
  'admin-topbar': {
    width: 40,
    height: 40,
    imageClass: 'h-9 w-auto object-contain sm:h-10',
  },
  'admin-login-hero': {
    width: 220,
    height: 220,
    imageClass: 'h-auto w-[220px] max-w-full object-contain',
  },
  'admin-login-card': {
    width: 72,
    height: 72,
    imageClass: 'h-16 w-auto object-contain sm:h-[72px]',
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
