import { createClient } from '@/lib/supabase/server';
import { company } from '@/config/company';
import type { HeroContent, HomepageSectionKey } from '@/types/cms';

const DEFAULT_HERO: HeroContent = {
  eyebrow: 'Industrial & Marine Supplies',
  subtitle: company.tagline,
  primaryButtonLabel: 'Browse Products',
  primaryButtonHref: '/products',
  secondaryButtonLabel: 'Request a Quote',
  secondaryButtonHref: '/quote',
  features: [
    {
      title: 'Marine Supplies',
      description:
        'Trusted products and dependable sourcing for vessels, ports, and maritime operations across Malta.',
    },
    {
      title: 'Industrial Equipment',
      description:
        'Reliable industrial solutions for engineering teams, workshops, and commercial facilities.',
    },
    {
      title: 'Hardware & Fasteners',
      description:
        'Essential hardware, fittings, and fastening products to support day-to-day trade and maintenance work.',
    },
  ],
};

export async function getHomepageSection<K extends HomepageSectionKey>(
  key: K,
): Promise<Record<string, unknown>> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('homepage_sections')
      .select('content, is_enabled')
      .eq('section_key', key)
      .maybeSingle();

    if (!data?.is_enabled) {
      if (key === 'hero') return DEFAULT_HERO as unknown as Record<string, unknown>;
      return {};
    }

    if (key === 'hero') {
      return { ...DEFAULT_HERO, ...(data.content as Record<string, unknown>) };
    }

    return (data.content as Record<string, unknown>) ?? {};
  } catch {
    if (key === 'hero') return DEFAULT_HERO as unknown as Record<string, unknown>;
    return {};
  }
}

export async function getSiteSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (!data?.value) return fallback;
    return { ...fallback, ...(data.value as T) };
  } catch {
    return fallback;
  }
}

export async function getSeoForPath(path: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('seo_pages')
      .select('*')
      .eq('path', path)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}
