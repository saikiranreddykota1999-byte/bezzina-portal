export type Testimonial = {
  quote: string;
  role: string;
  industry: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Reliable sourcing and fast quotations keep our vessel maintenance programme on schedule. Their team understands marine supply urgency.',
    role: 'Fleet maintenance manager',
    industry: 'Marine operator',
  },
  {
    quote:
      'We depend on consistent stock for fasteners, abrasives, and workshop consumables. Delivery from Marsa is dependable for our fabrication jobs.',
    role: 'Workshop supervisor',
    industry: 'Metal fabrication',
  },
  {
    quote:
      'Technical guidance on specifications saves us time on complex orders. A trusted partner for industrial procurement in Malta.',
    role: 'Procurement lead',
    industry: 'Industrial contractor',
  },
];

export const CLIENT_LOGOS = [
  'Marine operators',
  'Ship repair yards',
  'Fabrication workshops',
  'Industrial contractors',
  'Engineering firms',
  'Commercial fleets',
] as const;
