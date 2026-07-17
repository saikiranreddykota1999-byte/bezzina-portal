'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthenticatedUser } from '@/lib/auth/server-session';
import { placeOrderSchema } from '@/lib/validators/pickup';
import { calculateOrderTotals } from '@/lib/checkout';
import { DEFAULT_PRODUCT_PRICE, resolveQuoteLinePrice } from '@/lib/pricing';
import { isStripeEnabled } from '@/lib/stripe/config';
import { isDemoPaymentAllowed } from '@/lib/payment';
import {
  computeAvailableSlots,
  getDateRange,
  isDateUnavailable,
  isLocationOpenOnDate,
} from '@/lib/pickup/slots';
import { generateOrderNumber, generatePickupCode, normalizeTimeValue } from '@/lib/pickup/code';
import { verifyStripePaymentIntent } from '@/actions/stripe-payment';
import { sendPickupConfirmationEmail } from '@/services/pickup-email.service';
import { resolveContactEmail, resolveReceiptCustomer } from '@/lib/receipt';
import type {
  ActionResult,
  AvailablePickupSlot,
  OrderWithPickup,
  PickupLocation,
  PlaceOrderResult,
} from '@/types/pickup';
import type { CartItem } from '@/types/user';
export async function getActivePickupLocations(): Promise<ActionResult<PickupLocation[]>> {
  try {
    const { supabase } = await requireAuthenticatedUser();
    const { data, error } = await supabase
      .from('pickup_locations')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to load branches' };
  }
}

export async function getPickupAvailableDates(
  locationId: string,
): Promise<ActionResult<string[]>> {
  try {
    const { supabase } = await requireAuthenticatedUser();

    const [{ data: hours }, { data: unavailable }] = await Promise.all([
      supabase.from('pickup_opening_hours').select('*').eq('location_id', locationId),
      supabase.from('pickup_unavailable_dates').select('closed_date').eq('location_id', locationId),
    ]);

    const unavailableDates = (unavailable ?? []).map((entry) => entry.closed_date);
    const dates = getDateRange(new Date(), 14).filter(
      (date) =>
        isLocationOpenOnDate(date, hours ?? []) &&
        !isDateUnavailable(date, unavailableDates),
    );

    return { success: true, data: dates };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load pickup dates',
    };
  }
}

export async function getPickupAvailableSlots(
  locationId: string,
  date: string,
): Promise<ActionResult<AvailablePickupSlot[]>> {
  try {
    const { supabase } = await requireAuthenticatedUser();

    const [{ data: slots }, { data: bookings }] = await Promise.all([
      supabase
        .from('pickup_time_slots')
        .select('*')
        .eq('location_id', locationId)
        .eq('is_active', true)
        .order('slot_time', { ascending: true }),
      supabase
        .from('pickup_slot_bookings')
        .select('slot_time')
        .eq('location_id', locationId)
        .eq('slot_date', date),
    ]);

    const available = computeAvailableSlots({
      slots: slots ?? [],
      bookings: bookings ?? [],
      date,
    });

    return { success: true, data: available };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load pickup slots',
    };
  }
}

export async function placeOrderAction(input: unknown): Promise<PlaceOrderResult> {
  try {
    const parsed = placeOrderSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid order data' };
    }

    const { supabase, user, profile } = await requireAuthenticatedUser();
    const payload = parsed.data;

    const productIds = payload.items.map((item) => item.productId);
    const { data: dbProducts, error: priceError } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds)
      .is('deleted_at', null);

    if (priceError) {
      return { success: false, error: priceError.message };
    }

    if ((dbProducts ?? []).length !== productIds.length) {
      return { success: false, error: 'One or more products are no longer available' };
    }

    const priceMap = new Map(
      (dbProducts ?? []).map((product) => [product.id, resolveQuoteLinePrice(product.price)]),
    );

    const validatedItems = payload.items.map((item) => ({
      ...item,
      price: priceMap.get(item.productId) ?? DEFAULT_PRODUCT_PRICE,
    }));

    const subtotal = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const totals = calculateOrderTotals(subtotal, payload.fulfillmentMethod, validatedItems.length);
    const orderNumber = generateOrderNumber();
    const pickupCode =
      payload.fulfillmentMethod === 'store_pickup' ? generatePickupCode() : null;

    if (payload.fulfillmentMethod === 'store_pickup') {
      const slotTime = normalizeTimeValue(payload.pickup.pickupTime);
      const { data: slotConfig } = await supabase
        .from('pickup_time_slots')
        .select('*')
        .eq('location_id', payload.pickup.locationId)
        .eq('slot_time', slotTime)
        .maybeSingle();

      if (!slotConfig?.is_active) {
        return { success: false, error: 'Selected pickup time is not available' };
      }

      const { count } = await supabase
        .from('pickup_slot_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', payload.pickup.locationId)
        .eq('slot_date', payload.pickup.pickupDate)
        .eq('slot_time', slotTime);

      if ((count ?? 0) >= slotConfig.max_capacity) {
        return { success: false, error: 'Selected pickup slot is fully booked' };
      }
    }

    let paymentMethod = 'card';
    let paymentReference = '';
    let paymentStatus: 'paid' | 'pending' = 'paid';

    if (payload.payment.method === 'stripe') {
      if (!isStripeEnabled) {
        return { success: false, error: 'Stripe payments are not enabled' };
      }

      const verification = await verifyStripePaymentIntent(
        payload.payment.paymentIntentId,
        totals.total,
        user!.id,
      );

      if (!verification.ok) {
        return { success: false, error: verification.error };
      }

      paymentMethod = 'stripe';
      paymentReference = verification.reference;
      paymentStatus = 'paid';
    } else if (payload.payment.method === 'cash_on_pickup') {
      if (payload.fulfillmentMethod !== 'store_pickup') {
        return { success: false, error: 'Cash on pickup is only available for store pickup orders' };
      }

      paymentMethod = 'cash_on_pickup';
      paymentReference = `COD-${orderNumber}`;
      paymentStatus = 'pending';
    } else if (payload.payment.method === 'demo') {
      if (!isDemoPaymentAllowed(isStripeEnabled)) {
        return {
          success: false,
          error: 'Demo payments are not available when live payments are enabled.',
        };
      }
      paymentReference = `PAY-${orderNumber}-${payload.payment.cardLast4}`;
    } else {
      return { success: false, error: 'Unsupported payment method' };
    }

    if (paymentReference) {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, order_number, pickup_code')
        .eq('payment_reference', paymentReference)
        .maybeSingle();

      if (existingOrder) {
        return {
          success: true,
          orderId: existingOrder.id,
          orderNumber: existingOrder.order_number ?? undefined,
          pickupCode: existingOrder.pickup_code ?? undefined,
        };
      }
    }

    const orderInsert: Record<string, unknown> = {
      user_id: user!.id,
      order_number: orderNumber,
      status:
        payload.fulfillmentMethod === 'store_pickup' ? 'confirmed' : 'confirmed',
      order_source: 'online',
      oms_status:
        payload.fulfillmentMethod === 'store_pickup'
          ? 'approved'
          : 'waiting_for_approval',
      timeline: [],
      fulfillment_method: payload.fulfillmentMethod,
      subtotal: totals.subtotal,
      shipping_cost: totals.shipping,
      total: totals.total,
      pickup_location_id:
        payload.fulfillmentMethod === 'store_pickup' ? payload.pickup.locationId : null,
      pickup_date:
        payload.fulfillmentMethod === 'store_pickup' ? payload.pickup.pickupDate : null,
      pickup_time:
        payload.fulfillmentMethod === 'store_pickup'
          ? normalizeTimeValue(payload.pickup.pickupTime)
          : null,
      pickup_code: pickupCode,
      pickup_status: payload.fulfillmentMethod === 'store_pickup' ? 'scheduled' : null,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      customer_name: profile?.full_name ?? user!.user_metadata?.full_name ?? null,
      customer_phone: profile?.phone ?? user!.phone ?? user!.user_metadata?.phone ?? null,
      customer_email: resolveContactEmail(profile?.contact_email, profile?.email) || null,
      customer_company_name: profile?.company_name ?? null,
      customer_vat_number: profile?.vat_number ?? null,
      customer_address: profile?.billing_address ?? null,
    };

    if (payload.fulfillmentMethod === 'delivery') {
      orderInsert.shipping_line1 = payload.deliveryAddress.line1;
      orderInsert.shipping_line2 = payload.deliveryAddress.line2 ?? null;
      orderInsert.shipping_city = payload.deliveryAddress.city;
      orderInsert.shipping_postal_code = payload.deliveryAddress.postalCode;
      orderInsert.shipping_country = payload.deliveryAddress.country;
      orderInsert.shipping_lat = payload.deliveryAddress.lat;
      orderInsert.shipping_lng = payload.deliveryAddress.lng;
      orderInsert.shipping_formatted_address = payload.deliveryAddress.formattedAddress;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select('id, order_number, pickup_code')
      .single();

    if (orderError || !order) {
      return { success: false, error: orderError?.message ?? 'Failed to create order' };
    }

    const orderItems = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    if (payload.fulfillmentMethod === 'store_pickup') {
      const slotTime = normalizeTimeValue(payload.pickup.pickupTime);
      const { error: bookingError } = await supabase.from('pickup_slot_bookings').insert({
        order_id: order.id,
        location_id: payload.pickup.locationId,
        slot_date: payload.pickup.pickupDate,
        slot_time: slotTime,
      });

      if (bookingError) {
        return { success: false, error: bookingError.message };
      }

      const { data: location } = await supabase
        .from('pickup_locations')
        .select('*')
        .eq('id', payload.pickup.locationId)
        .single();

      if (location && profile?.email) {
        const emailResult = await sendPickupConfirmationEmail({
          orderNumber: order.order_number ?? orderNumber,
          pickupCode: order.pickup_code ?? pickupCode!,
          recipientEmail: profile.email,
          recipientName: profile.full_name,
          location,
          pickupDate: payload.pickup.pickupDate,
          pickupTime: slotTime,
        });

        await supabase.from('order_notification_logs').insert({
          order_id: order.id,
          channel: 'email',
          recipient: profile.email,
          subject: `Pickup confirmed â€” ${order.order_number ?? orderNumber}`,
          status: emailResult.status,
          payload: {
            pickupCode: order.pickup_code ?? pickupCode,
            pickupDate: payload.pickup.pickupDate,
            pickupTime: slotTime,
          },
        });
      }
    }

    revalidatePath('/account/orders');
    revalidatePath('/admin/pickup-orders');
    revalidatePath('/admin/orders');

    const { notifyOmsRoles } = await import('@/services/oms-notification.service');
    const { recordStatusHistory } = await import('@/services/oms-order.service');
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    const initialOmsStatus =
      payload.fulfillmentMethod === 'store_pickup' ? 'approved' : 'waiting_for_approval';

    await Promise.all([
      recordStatusHistory(admin, {
        orderId: order.id,
        fromStatus: null,
        toStatus: initialOmsStatus,
        actorId: user!.id,
        note: 'Online order placed',
      }),
      notifyOmsRoles(['sales_manager', 'admin', 'super_admin', 'warehouse_manager'], {
        type: 'order_update',
        title: `New online order ${order.order_number ?? orderNumber}`,
        body: `${payload.fulfillmentMethod === 'store_pickup' ? 'Store pickup' : 'Delivery'} order received`,
        link: `/admin/orders/${order.id}`,
        metadata: { order_id: order.id },
      }),
    ]);

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number ?? orderNumber,
      pickupCode: order.pickup_code ?? pickupCode ?? undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to place order',
    };
  }
}

export async function getCustomerOrders(): Promise<ActionResult<OrderWithPickup[]>> {
  try {
    const { supabase, user } = await requireAuthenticatedUser();
    const { data, error } = await supabase
      .from('orders')
      .select('*, pickup_location:pickup_locations(*)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as OrderWithPickup[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load orders',
    };
  }
}

export async function getCustomerOrderByNumber(
  orderNumber: string,
): Promise<ActionResult<OrderWithPickup>> {
  try {
    const { supabase, user, profile } = await requireAuthenticatedUser();
    const { data, error } = await supabase
      .from('orders')
      .select('*, pickup_location:pickup_locations(*), items:order_items(*)')
      .eq('user_id', user!.id)
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Order not found' };

    const { data: freshProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone, contact_email, email, billing_address, company_name, vat_number')
      .eq('id', user!.id)
      .maybeSingle();

    if (profileError) return { success: false, error: profileError.message };

    const customer = resolveReceiptCustomer(data, freshProfile ?? profile, user);
    return { success: true, data: { ...data, customer } as OrderWithPickup };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load order',
    };
  }
}

export async function serializeCartItems(items: CartItem[]) {
  return items.map((item) => ({
    productId: item.productId,
    slug: item.slug,
    name: item.name,
    sku: item.sku,
    price: item.price,
    unit: item.unit,
    quantity: item.quantity,
  }));
}
