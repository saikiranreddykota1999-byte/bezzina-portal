export type HeroFeature = {
  title: string;
  description: string;
};

export type HeroContent = {
  eyebrow: string;
  title?: string;
  subtitle: string;
  body?: string;
  heroImageUrl?: string;
  primaryButtonLabel: string;
  primaryButtonHref: string;
  secondaryButtonLabel: string;
  secondaryButtonHref: string;
  features: HeroFeature[];
};

export type ServiceItem = {
  title: string;
  description: string;
  href?: string;
};

export type WhyChooseItem = {
  title: string;
  description: string;
};

export type WhyChooseContent = {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: WhyChooseItem[];
};

export type ServicesContent = {
  eyebrow?: string;
  title?: string;
  items?: ServiceItem[];
};

export type CtaContent = {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export type FooterContent = {
  tagline?: string;
  about?: string;
  copyright?: string;
};

export type HomepageSectionKey =
  | 'hero'
  | 'about'
  | 'services'
  | 'why_choose'
  | 'contact'
  | 'footer';

export type HomepageSection = {
  section_key: HomepageSectionKey;
  content: Record<string, unknown>;
  is_enabled: boolean;
  updated_at: string;
};

export type CompanySettings = {
  name: string;
  tagline?: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  logoUrl?: string;
  faviconUrl?: string;
  mapEmbedUrl?: string;
};

export type SocialSettings = {
  facebook: string;
  instagram: string;
  linkedin: string;
};

export type BusinessHours = Record<string, string>;
