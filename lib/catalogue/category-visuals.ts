export type CategoryIllustrationId =
  | 'hex-bolt'
  | 'carriage-bolt'
  | 'machine-bolt'
  | 'stainless-bolt'
  | 'nut'
  | 'stainless-nut'
  | 'washer'
  | 'stainless-washer'
  | 'stud'
  | 'rivet'
  | 'anchor-bolt'
  | 'fastener-kit'
  | 'fasteners'
  | 'anchor'
  | 'pump'
  | 'bearing'
  | 'abrasive'
  | 'electrical'
  | 'safety'
  | 'tools'
  | 'welding'
  | 'marine'
  | 'industrial'
  | 'navigation'
  | 'chemicals'
  | 'lifting'
  | 'general';

export type CategoryVisualTheme =
  | 'marine'
  | 'industrial'
  | 'tools'
  | 'fasteners'
  | 'electrical'
  | 'safety'
  | 'pumps'
  | 'lifting'
  | 'welding'
  | 'navigation'
  | 'chemicals'
  | 'general';

export interface CategoryVisual {
  illustrationId: CategoryIllustrationId;
  theme: CategoryVisualTheme;
  gradientFrom: string;
  gradientTo: string;
  accent: string;
  glow: string;
}

type VisualPreset = Omit<CategoryVisual, 'illustrationId'>;

const BRAND = {
  navy: '#0B3D91',
  gold: '#D8A106',
};

const ILLUSTRATION_PRESETS: Record<CategoryIllustrationId, VisualPreset> = {
  'hex-bolt': {
    theme: 'fasteners',
    gradientFrom: '#1E3A5F',
    gradientTo: '#2563EB',
    accent: '#93C5FD',
    glow: 'rgba(147, 197, 253, 0.4)',
  },
  'carriage-bolt': {
    theme: 'fasteners',
    gradientFrom: '#334155',
    gradientTo: '#0F766E',
    accent: '#5EEAD4',
    glow: 'rgba(94, 234, 212, 0.35)',
  },
  'machine-bolt': {
    theme: 'fasteners',
    gradientFrom: '#374151',
    gradientTo: '#1D4ED8',
    accent: BRAND.gold,
    glow: 'rgba(216, 161, 6, 0.35)',
  },
  'stainless-bolt': {
    theme: 'marine',
    gradientFrom: '#0C4A6E',
    gradientTo: '#0369A1',
    accent: '#E0F2FE',
    glow: 'rgba(224, 242, 254, 0.45)',
  },
  nut: {
    theme: 'fasteners',
    gradientFrom: '#4B5563',
    gradientTo: '#7C3AED',
    accent: '#C4B5FD',
    glow: 'rgba(196, 181, 253, 0.35)',
  },
  'stainless-nut': {
    theme: 'marine',
    gradientFrom: '#155E75',
    gradientTo: '#0B3D91',
    accent: '#67E8F9',
    glow: 'rgba(103, 232, 249, 0.4)',
  },
  washer: {
    theme: 'fasteners',
    gradientFrom: '#52525B',
    gradientTo: '#0B3D91',
    accent: '#FDE68A',
    glow: 'rgba(253, 230, 138, 0.35)',
  },
  'stainless-washer': {
    theme: 'marine',
    gradientFrom: '#164E63',
    gradientTo: '#1E40AF',
    accent: '#BAE6FD',
    glow: 'rgba(186, 230, 253, 0.4)',
  },
  stud: {
    theme: 'fasteners',
    gradientFrom: '#3F3F46',
    gradientTo: '#B45309',
    accent: '#FCD34D',
    glow: 'rgba(252, 211, 77, 0.35)',
  },
  rivet: {
    theme: 'fasteners',
    gradientFrom: '#57534E',
    gradientTo: '#DC2626',
    accent: '#FCA5A5',
    glow: 'rgba(252, 165, 165, 0.35)',
  },
  'anchor-bolt': {
    theme: 'fasteners',
    gradientFrom: '#44403C',
    gradientTo: '#78350F',
    accent: '#FDBA74',
    glow: 'rgba(253, 186, 116, 0.35)',
  },
  'fastener-kit': {
    theme: 'marine',
    gradientFrom: '#0B3D91',
    gradientTo: '#0E7490',
    accent: BRAND.gold,
    glow: 'rgba(216, 161, 6, 0.4)',
  },
  fasteners: {
    theme: 'fasteners',
    gradientFrom: '#334155',
    gradientTo: '#0B3D91',
    accent: BRAND.gold,
    glow: 'rgba(216, 161, 6, 0.3)',
  },
  anchor: {
    theme: 'marine',
    gradientFrom: '#0B3D91',
    gradientTo: '#0E7490',
    accent: '#38BDF8',
    glow: 'rgba(56, 189, 248, 0.35)',
  },
  pump: {
    theme: 'pumps',
    gradientFrom: '#0369A1',
    gradientTo: '#0B3D91',
    accent: '#67E8F9',
    glow: 'rgba(103, 232, 249, 0.35)',
  },
  bearing: {
    theme: 'industrial',
    gradientFrom: '#1E3A5F',
    gradientTo: '#C2410C',
    accent: BRAND.gold,
    glow: 'rgba(216, 161, 6, 0.35)',
  },
  abrasive: {
    theme: 'welding',
    gradientFrom: '#7C2D12',
    gradientTo: '#EA580C',
    accent: '#FDBA74',
    glow: 'rgba(253, 186, 116, 0.35)',
  },
  electrical: {
    theme: 'electrical',
    gradientFrom: '#1D4ED8',
    gradientTo: '#7C3AED',
    accent: '#FDE047',
    glow: 'rgba(253, 224, 71, 0.35)',
  },
  safety: {
    theme: 'safety',
    gradientFrom: '#B45309',
    gradientTo: '#DC2626',
    accent: '#FEF08A',
    glow: 'rgba(254, 240, 138, 0.35)',
  },
  tools: {
    theme: 'tools',
    gradientFrom: '#1E40AF',
    gradientTo: '#3730A3',
    accent: '#93C5FD',
    glow: 'rgba(147, 197, 253, 0.35)',
  },
  welding: {
    theme: 'welding',
    gradientFrom: '#9A3412',
    gradientTo: '#F97316',
    accent: '#FED7AA',
    glow: 'rgba(254, 215, 170, 0.35)',
  },
  marine: {
    theme: 'marine',
    gradientFrom: '#0B3D91',
    gradientTo: '#0E7490',
    accent: '#38BDF8',
    glow: 'rgba(56, 189, 248, 0.35)',
  },
  industrial: {
    theme: 'industrial',
    gradientFrom: '#1E3A5F',
    gradientTo: '#C2410C',
    accent: BRAND.gold,
    glow: 'rgba(216, 161, 6, 0.35)',
  },
  navigation: {
    theme: 'navigation',
    gradientFrom: '#0B3D91',
    gradientTo: '#1E3A8A',
    accent: '#A5F3FC',
    glow: 'rgba(165, 243, 252, 0.35)',
  },
  chemicals: {
    theme: 'chemicals',
    gradientFrom: '#047857',
    gradientTo: '#0B3D91',
    accent: '#6EE7B7',
    glow: 'rgba(110, 231, 183, 0.35)',
  },
  lifting: {
    theme: 'lifting',
    gradientFrom: '#475569',
    gradientTo: '#0B3D91',
    accent: BRAND.gold,
    glow: 'rgba(216, 161, 6, 0.3)',
  },
  general: {
    theme: 'general',
    gradientFrom: '#0B3D91',
    gradientTo: '#1E40AF',
    accent: BRAND.gold,
    glow: 'rgba(216, 161, 6, 0.3)',
  },
};

type IllustrationRule = {
  keywords: string[];
  id: CategoryIllustrationId;
};

/** Most specific rules first — avoids every fastener mapping to the same graphic. */
const ILLUSTRATION_RULES: IllustrationRule[] = [
  { keywords: ['hex-bolt', 'hex bolt'], id: 'hex-bolt' },
  { keywords: ['carriage-bolt', 'carriage bolt'], id: 'carriage-bolt' },
  { keywords: ['machine-bolt', 'machine bolt'], id: 'machine-bolt' },
  { keywords: ['stainless-bolt', 'stainless bolt'], id: 'stainless-bolt' },
  { keywords: ['stainless-nut', 'stainless nut'], id: 'stainless-nut' },
  { keywords: ['stainless-washer', 'stainless washer'], id: 'stainless-washer' },
  { keywords: ['fastener-kit', 'fastener kit'], id: 'fastener-kit' },
  { keywords: ['bolts-fasteners', 'bolts fasteners'], id: 'fasteners' },
  { keywords: ['anchor-bolt', 'anchor bolt', 'wall anchor', 'concrete anchor'], id: 'anchor-bolt' },
  { keywords: ['anti-fouling', 'paint', 'coating'], id: 'chemicals' },
  { keywords: ['binocular', 'compass', 'navigation', 'radar', 'gps'], id: 'navigation' },
  { keywords: ['life', 'fire', 'safety', 'ppe', 'helmet'], id: 'safety' },
  { keywords: ['battery', 'electrical', 'cable', 'motor', 'inverter', 'lighting'], id: 'electrical' },
  { keywords: ['bearing', 'gearbox'], id: 'bearing' },
  { keywords: ['abrasive', 'grind', 'sandpaper', 'flap disc', 'cutting disc'], id: 'abrasive' },
  { keywords: ['weld', 'welding'], id: 'welding' },
  { keywords: ['pump', 'bilge', 'valve', 'hose'], id: 'pump' },
  { keywords: ['anchor', 'mooring'], id: 'anchor' },
  { keywords: ['washer'], id: 'washer' },
  { keywords: ['rivet'], id: 'rivet' },
  { keywords: ['stud'], id: 'stud' },
  { keywords: ['nut'], id: 'nut' },
  { keywords: ['bolt'], id: 'hex-bolt' },
  { keywords: ['fastener'], id: 'fasteners' },
  { keywords: ['hydraulic', 'pneumatic', 'compressor', 'factory', 'machine'], id: 'industrial' },
  { keywords: ['lift', 'hoist', 'crane', 'sling', 'shackle'], id: 'lifting' },
  { keywords: ['tool', 'wrench', 'hammer', 'drill', 'plier'], id: 'tools' },
  { keywords: ['chemical', 'lubricant', 'adhesive', 'sealant', 'oil'], id: 'chemicals' },
  { keywords: ['marine', 'vessel', 'deck', 'chandlery', 'ship'], id: 'marine' },
  { keywords: ['industrial'], id: 'industrial' },
];

const FALLBACK_BY_LETTER: Record<string, CategoryIllustrationId> = {
  a: 'anchor',
  b: 'bearing',
  c: 'tools',
  d: 'tools',
  e: 'electrical',
  f: 'fasteners',
  g: 'bearing',
  h: 'tools',
  i: 'industrial',
  j: 'lifting',
  k: 'fastener-kit',
  l: 'lifting',
  m: 'tools',
  n: 'nut',
  o: 'pump',
  p: 'pump',
  q: 'general',
  r: 'rivet',
  s: 'safety',
  t: 'tools',
  u: 'general',
  v: 'pump',
  w: 'washer',
  x: 'general',
  y: 'general',
  z: 'general',
};

function normalizeKey(slug: string, name: string): string {
  return `${slug} ${name}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function resolveIllustrationId(slug: string, name: string, division?: string | null): CategoryIllustrationId {
  const key = normalizeKey(slug, name);

  for (const rule of ILLUSTRATION_RULES) {
    if (rule.keywords.some((word) => key.includes(word))) {
      return rule.id;
    }
  }

  if (division === 'marine') return 'marine';
  if (division === 'industrial') return 'industrial';

  const letter = name.trim().charAt(0).toLowerCase();
  return FALLBACK_BY_LETTER[letter] ?? 'general';
}

export function resolveCategoryVisual(
  slug: string,
  name: string,
  division?: string | null,
): CategoryVisual {
  const illustrationId = resolveIllustrationId(slug, name, division);
  return { illustrationId, ...ILLUSTRATION_PRESETS[illustrationId] };
}
