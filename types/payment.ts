export interface PaymentCard {
  id: string;
  cardholderName: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'other';
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  addedAt: string;
}

export type DeliveryStatus =
  | 'order_placed'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered';

export interface TrackingEvent {
  status: DeliveryStatus;
  label: string;
  description: string;
  timestamp: string | null;
  completed: boolean;
}

export interface Shipment {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: DeliveryStatus;
  estimatedDelivery: string;
  items: { name: string; quantity: number }[];
  events: TrackingEvent[];
}
