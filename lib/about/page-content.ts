import { company } from '@/config/company';

export const ABOUT_PAGE_CONTENT = {
  eyebrow: company.name,
  title: 'About Us',
  intro:
    'Joseph Bezzina & Co. Ltd has been serving Malta with industrial, marine, and engineering supplies since 1969. We combine dependable sourcing with practical expertise to support vessels, workshops, plants, and trade professionals across the island.',
  mission:
    'Our mission is to keep Malta\'s marine and industrial sectors supplied with the right products, backed by responsive quotations, technical guidance, and reliable local service.',
};

export const ABOUT_TIMELINE = [
  {
    year: '1969',
    title: 'Company founded',
    description:
      'Joseph Bezzina & Co. Ltd begins supplying marine and industrial products to trade customers in Malta.',
  },
  {
    year: '1980s',
    title: 'Warehouse expansion',
    description:
      'Growing stockholding and sourcing capability to support workshops, shipyards, and commercial operators.',
  },
  {
    year: '2000s',
    title: 'Broader industrial range',
    description:
      'Expanded fasteners, hardware, engineering supplies, and equipment for industrial maintenance teams.',
  },
  {
    year: 'Today',
    title: 'Digital + local service',
    description:
      'Online catalogue and quote tools alongside Marsa warehouse collection, delivery, and expert support.',
  },
];

export const ABOUT_VALUES = [
  {
    title: 'Dependable supply',
    description: 'Practical stock and sourcing to keep projects moving without unnecessary delays.',
  },
  {
    title: 'Technical knowledge',
    description: 'Guidance on fasteners, marine equipment, coatings, and industrial products.',
  },
  {
    title: 'Responsive service',
    description: 'Fast quotations and direct communication for trade and commercial buyers.',
  },
  {
    title: 'Local commitment',
    description: 'Malta-based team with long-term customer relationships since 1969.',
  },
];

export const INDUSTRIES_SERVED = [
  {
    title: 'Maritime & shipping',
    description: 'Chandlery, vessel maintenance, ports, and marine operators.',
  },
  {
    title: 'Industrial maintenance',
    description: 'Workshops, fabrication, plant upkeep, and engineering teams.',
  },
  {
    title: 'Construction & contractors',
    description: 'Hardware, fasteners, tools, and site consumables.',
  },
  {
    title: 'Public & commercial facilities',
    description: 'Equipment and supplies for operational and facilities teams.',
  },
];

export const ABOUT_STATS = [
  { label: 'Established', value: String(company.founded) },
  { label: 'Registration', value: company.registrationNumber },
  { label: 'Location', value: `${company.address.city}, Malta` },
  { label: 'Warehouse', value: company.address.line1 },
];
