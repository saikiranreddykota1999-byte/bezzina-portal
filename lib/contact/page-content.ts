import type { LucideIcon } from 'lucide-react';
import { Boxes, MapPin, Package, Users } from 'lucide-react';

export const CONTACT_MAPS = {
  location: 'https://maps.app.goo.gl/Pzm81wcCUTisDbbU6',
  streetView: 'https://maps.app.goo.gl/FuU6UmP9WC1z3XbA9',
  storePhoto: 'https://maps.app.goo.gl/3YMZ2PAUaZmFBJicA',
  embedUrl:
    'https://maps.google.com/maps?q=35.8757591,14.4958324&hl=en&z=17&output=embed',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=35.8757591,14.4958324&destination_place_id=ChIJ',
} as const;

export const CONTACT_IMAGES = {
  storefront: '/images/contact/bezzina-storefront.jpg',
} as const;

export const DEFAULT_BUSINESS_HOURS = `Monday – Friday: 7:00 AM – 4:00 PM
Saturday: Closed
Sunday: Closed`;

export type WhyVisitFeature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const WHY_VISIT_FEATURES: WhyVisitFeature[] = [
  {
    id: 'stock',
    title: 'Immediate Stock Availability',
    description:
      'Walk in and collect essential marine and industrial supplies without waiting for delivery.',
    icon: Package,
  },
  {
    id: 'warehouse',
    title: 'Large Warehouse Inventory',
    description:
      'Thousands of SKUs on site — fasteners, tools, safety gear, and specialist equipment.',
    icon: Boxes,
  },
  {
    id: 'specialists',
    title: 'Marine & Industrial Specialists',
    description:
      'Experienced staff help you choose the right products for vessel, workshop, and site work.',
    icon: Users,
  },
  {
    id: 'collection',
    title: 'Easy Collection Point',
    description:
      'Convenient Marsa location with straightforward access for trade pickups and bulk orders.',
    icon: MapPin,
  },
];

export const TRUST_STATS = [
  { id: 'years', label: 'Years Experience', value: 55, suffix: '+' },
  { id: 'family', label: 'Family Business', value: null, text: 'Since 1969' },
  { id: 'location', label: 'Located in Marsa', value: null, text: 'Il-Marsa, Malta' },
  { id: 'trusted', label: 'Trusted Across Malta', value: null, text: 'Nationwide' },
] as const;
