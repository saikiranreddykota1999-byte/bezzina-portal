import type { UserRole } from '@/types/user';

export type AdminPermission =
  | 'dashboard:view'
  | 'products:manage'
  | 'categories:manage'
  | 'quotes:manage'
  | 'customers:manage'
  | 'careers:manage'
  | 'homepage:manage'
  | 'media:manage'
  | 'newsletter:manage'
  | 'seo:manage'
  | 'settings:manage'
  | 'users:manage'
  | 'pickup:manage';

export type AdminNavItem = {
  title: string;
  href: string;
  icon: string;
  permission?: AdminPermission;
  superAdminOnly?: boolean;
};

export type QuoteStatus =
  | 'pending'
  | 'in_review'
  | 'waiting_customer'
  | 'quoted'
  | 'approved'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type QuoteTimelineEntry = {
  status: QuoteStatus;
  note?: string;
  actor_id?: string;
  actor_name?: string;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profile?: { email: string; full_name: string | null } | null;
};

export type PublishStatus = 'draft' | 'published';

export type ProductDocument = {
  id: string;
  product_id: string;
  label: string;
  doc_type: 'pdf' | 'datasheet' | 'sds' | 'manual' | 'catalogue' | 'other';
  url: string;
  file_name: string;
  file_size: number | null;
  sort_order: number;
};

export type MediaAsset = {
  id: string;
  folder: string;
  file_name: string;
  url: string;
  mime_type: string;
  file_size: number | null;
  alt_text: string | null;
  tags: string[] | null;
  created_at: string;
};

export type SeoPage = {
  id: string;
  path: string;
  page_title: string;
  meta_description: string | null;
  keywords: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  schema_json: Record<string, unknown> | null;
  robots: string | null;
  updated_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
};

export type AdminCustomer = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  role: UserRole;
  is_disabled: boolean;
  created_at: string;
};

export type DashboardStats = {
  products: number;
  categories: number;
  quotes: number;
  customers: number;
  orders: number;
  vacancies: number;
  subscribers: number;
  todaysQuotes: number;
  newCustomers: number;
  pendingCareers: number;
  lowInventory: number;
  mostViewedProducts: { id: string; name: string; view_count: number }[];
  recentActivity: ActivityLog[];
};
