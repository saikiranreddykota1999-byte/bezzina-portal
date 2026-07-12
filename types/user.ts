export type UserRole = 'customer' | 'admin' | 'super_admin' | 'staff';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  contact_email: string | null;
  billing_address: string | null;
  company_name: string | null;
  vat_number: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_disabled?: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  price: number | null;
  unit: string;
  image_url: string | null;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  price: number | null;
  image_url: string | null;
  addedAt: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  created_at: string;
  tracking_number: string | null;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

export interface Suggestion {
  id: string;
  user_id: string | null;
  message: string;
  created_at: string;
}
