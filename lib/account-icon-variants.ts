import {
  Bell,
  Bookmark,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Headphones,
  Heart,
  KeyRound,
  Lightbulb,
  MapPin,
  Package,
  ShoppingCart,
  Truck,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export type AccountIconVariant =
  | 'profile'
  | 'addresses'
  | 'payment-cards'
  | 'orders'
  | 'quote-history'
  | 'quote-drafts'
  | 'recently-viewed'
  | 'downloads'
  | 'favourites'
  | 'tracking'
  | 'cart'
  | 'checkout'
  | 'payment'
  | 'notifications'
  | 'support-tickets'
  | 'suggestions'
  | 'password';

export type AccountIconTheme = {
  icon: LucideIcon;
  containerClass: string;
  glowClass: string;
  iconClass: string;
  hoverIconClass?: string;
};

export const ACCOUNT_ICON_THEMES: Record<AccountIconVariant, AccountIconTheme> = {
  profile: {
    icon: User,
    containerClass: 'bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE]',
    glowClass: 'bg-[#3B82F6]/25',
    iconClass: 'text-[#1D4ED8]',
  },
  addresses: {
    icon: MapPin,
    containerClass: 'bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0]',
    glowClass: 'bg-[#10B981]/25',
    iconClass: 'text-[#047857]',
  },
  'payment-cards': {
    icon: CreditCard,
    containerClass: 'bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE]',
    glowClass: 'bg-[#6366F1]/25',
    iconClass: 'text-[#4338CA]',
  },
  orders: {
    icon: Package,
    containerClass: 'bg-gradient-to-br from-[#FFEDD5] to-[#FED7AA]',
    glowClass: 'bg-[#F97316]/25',
    iconClass: 'text-[#C2410C]',
  },
  'quote-history': {
    icon: FileText,
    containerClass: 'bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1]',
    glowClass: 'bg-[#475569]/20',
    iconClass: 'text-[#334155]',
  },
  'quote-drafts': {
    icon: Bookmark,
    containerClass: 'bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A]',
    glowClass: 'bg-[#F59E0B]/25',
    iconClass: 'text-[#B45309]',
  },
  'recently-viewed': {
    icon: Clock3,
    containerClass: 'bg-gradient-to-br from-[#CFFAFE] to-[#A5F3FC]',
    glowClass: 'bg-[#06B6D4]/25',
    iconClass: 'text-[#0E7490]',
  },
  downloads: {
    icon: Download,
    containerClass: 'bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE]',
    glowClass: 'bg-[#8B5CF6]/25',
    iconClass: 'text-[#6D28D9]',
  },
  favourites: {
    icon: Heart,
    containerClass: 'bg-gradient-to-br from-[#FFE4E6] to-[#FECDD3]',
    glowClass: 'bg-[#F43F5E]/25',
    iconClass: 'text-[#E11D48]',
    hoverIconClass: 'fill-[#E11D48] text-[#E11D48]',
  },
  tracking: {
    icon: Truck,
    containerClass: 'bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD]',
    glowClass: 'bg-[#0EA5E9]/25',
    iconClass: 'text-[#0369A1]',
  },
  cart: {
    icon: ShoppingCart,
    containerClass: 'bg-gradient-to-br from-[#FFEDD5] to-[#FDBA74]',
    glowClass: 'bg-[#EA580C]/25',
    iconClass: 'text-[#9A3412]',
  },
  checkout: {
    icon: ClipboardCheck,
    containerClass: 'bg-gradient-to-br from-[#CCFBF1] to-[#99F6E4]',
    glowClass: 'bg-[#14B8A6]/25',
    iconClass: 'text-[#0F766E]',
  },
  payment: {
    icon: Wallet,
    containerClass: 'bg-gradient-to-br from-[#DCFCE7] to-[#BBF7D0]',
    glowClass: 'bg-[#22C55E]/25',
    iconClass: 'text-[#15803D]',
  },
  notifications: {
    icon: Bell,
    containerClass: 'bg-gradient-to-br from-[#FEF9C3] to-[#FEF08A]',
    glowClass: 'bg-[#EAB308]/25',
    iconClass: 'text-[#A16207]',
  },
  'support-tickets': {
    icon: Headphones,
    containerClass: 'bg-gradient-to-br from-[#F3E8FF] to-[#E9D5FF]',
    glowClass: 'bg-[#A855F7]/25',
    iconClass: 'text-[#7E22CE]',
  },
  suggestions: {
    icon: Lightbulb,
    containerClass: 'bg-gradient-to-br from-[#FCE7F3] to-[#FBCFE8]',
    glowClass: 'bg-[#EC4899]/25',
    iconClass: 'text-[#BE185D]',
  },
  password: {
    icon: KeyRound,
    containerClass: 'bg-gradient-to-br from-[#FEE2E2] to-[#FECACA]',
    glowClass: 'bg-[#EF4444]/25',
    iconClass: 'text-[#B91C1C]',
  },
};
