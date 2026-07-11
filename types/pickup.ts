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
  created_at: string;
  pickup_location?: PickupLocation | null;
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  pickupCode?: string;
  error?: string;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
