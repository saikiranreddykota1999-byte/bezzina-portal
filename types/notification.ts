export type NotificationType =
  | 'quote_new'
  | 'quote_updated'
  | 'customer_new'
  | 'career_application'
  | 'account_created'
  | 'order_update'
  | 'system';

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
};
