'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthenticatedUser } from '@/lib/auth/server-session';
import { placeOrderSchema } from '@/lib/validators/pickup';
import { calculateOrderTotals } from '@/lib/checkout';
import { buildCartFingerprint } from '@/lib/checkout/cart-fingerprint';
import { compensateFailedOrder } from '@/lib/checkout/compensate-order';
import { validateOrderItems } from '@/lib/checkout/validate-order-items';
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
import { logServerError, toUserError } from '@/lib/security/sanitize-error';
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

    if (error) {
      logServerError('getActivePickupLocations', error);
      return { success: false, error: toUserError(error) };
    }
    return { success: true, data: data ?? [] };
  } catch (error) {
    logServerError('getActivePickupLocations', error);
    return { success: false, error: toUserError(error) };
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
    logServerError('getPickupAvailableDates', error);
    return { success: false, error: toUserError(error) };
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
    logServerError('getPickupAvailableSlots', error);
    return { success: false, error: toUserError(error) };
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
    const uniqueIds = [...new Set(payload.items.map((item) => item.productId))];

    const { data: dbProducts, error: priceError } = await supabase
      .from('products')
      .select('id, price, in_stock, stock_quantity, name')
      .in('id', uniqueIds)
      .is('deleted_at', null)
      .eq('is_active', true);

    if (priceError) {
      logServerError('placeOrderAction.prices', priceError);
      return { success: false, error: toUserError(priceError) };
    }

    const validated = validateOrderItems(payload.items, dbProducts ?? []);
    if (!validated.ok) {
      return { success: false, error: validated.error };
    }

    const { checkCatalogueStock, decrementCatalogueStock, restoreCatalogueStock } =
      await import('@/lib/checkout/stock');
    const stockCheck = checkCatalogueStock(
      validated.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        name: item.name,
      })),
      (dbProducts ?? []).map((product) => ({
        id: product.id,
        name: product.name,
        in_stock: product.in_stock,
        stock_quantity: product.stock_quantity,
      })),
    );
    if (!stockCheck.ok) {
      return { success: false, error: stockCheck.error };
    }

    const validatedItems = validated.items;
    const totals = calculateOrderTotals(
      validated.subtotal,
      payload.fulfillmentMethod,
      validatedItems.length,
    );
    const cartFingerprint = buildCartFingerprint(validatedItems, payload.fulfillmentMethod);
    const orderNumber = generateOrderNumber();
    const pickupCode =
      payload.fulfillmentMethod === 'store_pickup' ? generatePickupCode() : null;

    let slotMaxCapacity = 0;
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

      slotMaxCapacity = slotConfig.max_capacity;

      const { count } = await supabase
        .from('pickup_slot_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', payload.pickup.locationId)
        .eq('slot_date', payload.pickup.pickupDate)
        .eq('slot_time', slotTime);

      if ((count ?? 0) >= slotMaxCapacity) {
        return { success: false, error: 'Selected pickup slot is fully booked' };
      }
    }

    let paymentMethod = 'card';
    let paymentReference = '';
    let paymentStatus: 'paid' | 'pending' | 'processing' = 'paid';

    if (payload.payment.method === 'stripe') {
      if (!isStripeEnabled) {
        return { success: false, error: 'Stripe payments are not enabled' };
      }

      const verification = await verifyStripePaymentIntent(
        payload.payment.paymentIntentId,
        totals.total,
        user!.id,
        cartFingerprint,
      );

      if (!verification.ok) {
        return { success: false, error: verification.error };
      }

      paymentMethod = 'stripe';
      paymentReference = verification.reference;
      paymentStatus = verification.paymentStatus;
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

    // Stripe `processing` is not paid and not fulfillable. COD remains fulfillable while pending.
    const isStripeProcessing = paymentStatus === 'processing';
    const isFulfillable =
      !isStripeProcessing &&
      (paymentStatus === 'paid' || payload.payment.method === 'cash_on_pickup');
    const orderStatus = isFulfillable ? 'confirmed' : 'pending';
    const omsStatus =
      isFulfillable && payload.fulfillmentMethod === 'store_pickup'
        ? 'approved'
        : 'waiting_for_approval';

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
      status: orderStatus,
      order_source: 'online',
      oms_status: omsStatus,
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
      pickup_status:
        payload.fulfillmentMethod === 'store_pickup' && isFulfillable
          ? 'scheduled'
          : null,
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
      logServerError('placeOrderAction.insert', orderError);
      return { success: false, error: toUserError(orderError) };
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
      logServerError('placeOrderAction.items', itemsError);
      await compensateFailedOrder(supabase, order.id);
      return { success: false, error: toUserError(itemsError) };
    }

    const stockLines = validatedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      name: item.name,
    }));

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    let stockDecremented = false;

    try {
      await decrementCatalogueStock(admin, stockLines);
      stockDecremented = true;

      const { tryReserveInventoryForOrder } = await import('@/services/inventory.service');
      await tryReserveInventoryForOrder(
        admin,
        order.id,
        stockLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        user!.id,
      );
    } catch (stockError) {
      logServerError('placeOrderAction.stock', stockError);
      if (stockDecremented) {
        await restoreCatalogueStock(admin, stockLines);
      }
      await compensateFailedOrder(admin, order.id);
      return {
        success: false,
        error:
          stockError instanceof Error && stockError.message.toLowerCase().includes('stock')
            ? stockError.message
            : 'Unable to reserve stock for this order. Please try again.',
      };
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
        logServerError('placeOrderAction.booking', bookingError);
        const { releaseInventoryForOrder } = await import('@/services/inventory.service');
        await releaseInventoryForOrder(admin, order.id, user!.id).catch(() => undefined);
        await restoreCatalogueStock(admin, stockLines);
        await compensateFailedOrder(admin, order.id);
        return { success: false, error: toUserError(bookingError) };
      }

      const { count: bookedCount } = await supabase
        .from('pickup_slot_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', payload.pickup.locationId)
        .eq('slot_date', payload.pickup.pickupDate)
        .eq('slot_time', slotTime);

      if ((bookedCount ?? 0) > slotMaxCapacity) {
        logServerError('placeOrderAction.overbook', {
          message: `Slot over capacity: ${bookedCount}/${slotMaxCapacity}`,
        });
        const { releaseInventoryForOrder } = await import('@/services/inventory.service');
        await releaseInventoryForOrder(admin, order.id, user!.id).catch(() => undefined);
        await restoreCatalogueStock(admin, stockLines);
        await compensateFailedOrder(admin, order.id);
        return { success: false, error: 'Selected pickup slot is fully booked' };
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
          subject: `Pickup confirmed — ${order.order_number ?? orderNumber}`,
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
    logServerError('placeOrderAction', error);
    return { success: false, error: toUserError(error) };
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

    if (error) {
      logServerError('getCustomerOrders', error);
      return { success: false, error: toUserError(error) };
    }
    return { success: true, data: (data ?? []) as OrderWithPickup[] };
  } catch (error) {
    logServerError('getCustomerOrders', error);
    return { success: false, error: toUserError(error) };
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

    if (error) {
      logServerError('getCustomerOrderByNumber', error);
      return { success: false, error: toUserError(error) };
    }
    if (!data) return { success: false, error: 'Order not found' };

    const { data: freshProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone, contact_email, email, billing_address, company_name, vat_number')
      .eq('id', user!.id)
      .maybeSingle();

    if (profileError) {
      logServerError('getCustomerOrderByNumber.profile', profileError);
      return { success: false, error: toUserError(profileError) };
    }

    const customer = resolveReceiptCustomer(data, freshProfile ?? profile, user);
    return { success: true, data: { ...data, customer } as OrderWithPickup };
  } catch (error) {
    logServerError('getCustomerOrderByNumber', error);
    return { success: false, error: toUserError(error) };
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
