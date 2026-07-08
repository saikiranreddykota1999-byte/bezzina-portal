export const PRODUCT_CATEGORIES = [
  { name: 'Marine Hand Tools', slug: 'marine-hand-tools', description: 'Professional hand tools for marine maintenance and repair.' },
  { name: 'Hydraulic Tools', slug: 'hydraulic-tools', description: 'Hydraulic equipment for heavy-duty industrial and marine applications.' },
  { name: 'Pneumatic Tools', slug: 'pneumatic-tools', description: 'Air-powered tools for workshop and vessel operations.' },
  { name: 'Cutting Tools', slug: 'cutting-tools', description: 'Precision cutting tools for metal, pipe, and fabrication work.' },
  { name: 'Grinding Tools', slug: 'grinding-tools', description: 'Grinding discs, wheels, and surface preparation equipment.' },
  { name: 'Welding Equipment', slug: 'welding-equipment', description: 'Welding machines, consumables, and protective gear.' },
  { name: 'Safety Equipment', slug: 'safety-equipment', description: 'PPE and safety products for industrial and marine environments.' },
  { name: 'Marine Electrical', slug: 'marine-electrical', description: 'Electrical components rated for marine use.' },
  { name: 'Engine Room Equipment', slug: 'engine-room-equipment', description: 'Equipment and spares for engine room operations.' },
  { name: 'Deck Equipment', slug: 'deck-equipment', description: 'Deck machinery accessories and rigging supplies.' },
  { name: 'Lifting Equipment', slug: 'lifting-equipment', description: 'Slings, shackles, hoists, and lifting accessories.' },
  { name: 'Measuring Instruments', slug: 'measuring-instruments', description: 'Calipers, gauges, and precision measuring tools.' },
  { name: 'Fasteners', slug: 'fasteners', description: 'Bolts, nuts, washers, and threaded fixings.' },
  { name: 'Hardware', slug: 'hardware', description: 'General hardware, fittings, and consumables.' },
  { name: 'Pumps', slug: 'pumps', description: 'Industrial and marine pumps for fluid transfer.' },
  { name: 'Valves', slug: 'valves', description: 'Gate, ball, check, and control valves.' },
  { name: 'Marine Chemicals', slug: 'marine-chemicals', description: 'Cleaning, treatment, and maintenance chemicals.' },
  { name: 'Cleaning Equipment', slug: 'cleaning-equipment', description: 'Pressure washers, scrubbers, and cleaning systems.' },
  { name: 'Navigation Accessories', slug: 'navigation-accessories', description: 'Navigation aids and bridge equipment accessories.' },
  { name: 'Custom Equipment', slug: 'custom-equipment', description: 'Bespoke and specialist equipment on request.' },
] as const;

export const SAMPLE_BRANDS = [
  'Bosch', 'Makita', 'Stanley', 'DeWalt', 'Milwaukee', '3M', 'Honeywell',
  'Parker', 'Grundfos', 'Karcher', 'ABB', 'Siemens', 'Würth', 'Facom',
  'Beta', 'Bahco', 'Knipex', 'Hilti', 'Lincoln Electric', 'ESAB',
] as const;

export type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]['slug'];
export type BrandName = (typeof SAMPLE_BRANDS)[number];
