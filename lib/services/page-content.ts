import type { LucideIcon } from 'lucide-react';
import {
  Calculator,
  ClipboardList,
  Container,
  Forklift,
  HardHat,
  MapPin,
  Ruler,
  Truck,
  Warehouse,
  Wrench,
} from 'lucide-react';

export type ServiceDefinition = {
  id: string;
  title: string;
  description: string;
  highlight: string;
  ctaLabel: string;
  ctaHref: string;
  icons: LucideIcon[];
  illustration: 'quotations' | 'sourcing' | 'technical' | 'delivery';
  /** Original bullet text preserved for accessibility / SEO */
  summary: string;
};

export const SERVICES_PAGE_CONTENT = {
  eyebrow: 'Joseph Bezzina & Co. Ltd',
  title: 'Services',
  description:
    'Beyond product supply, we support customers with quotations, sourcing, and practical technical assistance for marine and industrial requirements.',
};

export const SERVICE_ITEMS: ServiceDefinition[] = [
  {
    id: 'quotations',
    title: 'Fast Quotations',
    summary: 'Fast quotations for trade and commercial customers',
    description:
      'Receive accurate and competitive quotations quickly for trade, commercial, marine, and industrial requirements.',
    highlight: 'Same-day quote assistance for most enquiries.',
    ctaLabel: 'Ask for quote',
    ctaHref: '/quote',
    icons: [ClipboardList, Calculator, ClipboardList],
    illustration: 'quotations',
  },
  {
    id: 'sourcing',
    title: 'Product Sourcing',
    summary: 'Product sourcing across marine and industrial categories',
    description:
      'If a product is not currently in stock, our experienced sourcing team will locate it through trusted international and local suppliers.',
    highlight: 'Access to thousands of industrial and marine products.',
    ctaLabel: 'Find Products',
    ctaHref: '/products',
    icons: [Container, Warehouse, Forklift],
    illustration: 'sourcing',
  },
  {
    id: 'technical',
    title: 'Technical Assistance',
    summary: 'Technical guidance for fasteners, hardware, and equipment',
    description:
      'Our experienced team helps customers choose the correct fasteners, marine equipment, hardware, coatings, and industrial products.',
    highlight: 'Professional advice backed by decades of experience.',
    ctaLabel: 'Talk to an Expert',
    ctaHref: '/contact',
    icons: [HardHat, Ruler, Wrench],
    illustration: 'technical',
  },
  {
    id: 'delivery',
    title: 'Delivery & Collection',
    summary: 'Reliable delivery and collection from our Marsa premises',
    description:
      'Collect directly from our Marsa warehouse or arrange reliable delivery across Malta for commercial and industrial orders.',
    highlight: 'Fast local collection and delivery.',
    ctaLabel: 'Contact Us',
    ctaHref: '/contact',
    icons: [Truck, Warehouse, MapPin],
    illustration: 'delivery',
  },
];

export const HOW_IT_WORKS_STEPS = [
  { id: 'inquiry', title: 'Send Inquiry', icon: 'message' as const },
  { id: 'quote', title: 'Receive Quote', icon: 'clipboard' as const },
  { id: 'confirm', title: 'Confirm Order', icon: 'check' as const },
  { id: 'delivery', title: 'Collect or Delivery', icon: 'truck' as const },
];
