export type FulfillmentMethod = 'delivery' | 'store_pickup';

export type PickupStatus = 'scheduled' | 'ready_for_pickup' | 'collected';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'ready_for_pickup'
  | 'collected';

export interface PickupLocation {
  id: string;
  name: string;
  slug: string;
  line1: string;
  line2: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
  email: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PickupOpeningHour {
  id: string;
  location_id: string;
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
}

export interface PickupUnavailableDate {
  id: string;
  location_id: string;
  closed_date: string;
  reason: string | null;
}

export interface PickupTimeSlot {
  id: string;
  location_id: string;
  slot_time: string;
  label: string;
  max_capacity: number;
  is_active: boolean;
}

export interface PickupSlotBooking {
  id: string;
  order_id: string;
  location_id: string;
  slot_date: string;
  slot_time: string;
  created_at: string;
}

export interface AvailablePickupSlot {
  slotTime: string;
  label: string;
  remainingCapacity: number;
  maxCapacity: number;
}

export interface CheckoutPickupSelection {
  locationId: string;
  pickupDate: string;
  pickupTime: string;
}

export interface PickupLocationInput {
  name: string;
  slug: string;
  line1: string;
  line2?: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone?: string | null;
  email?: string | null;
  instructions?: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface PickupOpeningHourInput {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
}

export interface PickupTimeSlotInput {
  slot_time: string;
  label: string;
  max_capacity: number;
  is_active: boolean;
}

export interface PickupUnavailableDateInput {
  closed_date: string;
  reason?: string | null;
}

export interface DeliveryAddress {
  formattedAddress: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number | null;
}

export interface ReceiptCustomer {
  full_name: string | null;
  phone: string | null;
  email: string;
  address: string | null;
  company_name: string | null;
  vat_number: string | null;
}

export interface OrderWithPickup {
  id: string;
  order_number: string | null;
  user_id: string;
  status: string;
  fulfillment_method: FulfillmentMethod;
  subtotal: number;
  shipping_cost: number;
  total: number;
  pickup_location_id: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  pickup_code: string | null;
  pickup_status: PickupStatus | null;
  shipping_line1?: string | null;
  shipping_line2?: string | null;
  shipping_city?: string | null;
  shipping_postal_code?: string | null;
  shipping_country?: string | null;
  shipping_lat?: number | null;
  shipping_lng?: number | null;
  shipping_formatted_address?: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
  payment_reference?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_company_name?: string | null;
  customer_vat_number?: string | null;
  customer_address?: string | null;
  created_at: string;
  pickup_location?: PickupLocation | null;
  items?: OrderItem[];
  customer?: ReceiptCustomer | null;
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  pickupCode?: string;
  error?: string;
}

export type { ActionResult } from '@/types/action';
