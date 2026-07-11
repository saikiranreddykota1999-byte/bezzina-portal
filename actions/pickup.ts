'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthenticatedUser, requireStaffUser } from '@/lib/auth/server-session';
import {
  pickupLocationSchema,
  pickupOpeningHourSchema,
  pickupTimeSlotSchema,
  pickupUnavailableDateSchema,
  placeOrderSchema,
  updatePickupStatusSchema,
} from '@/lib/validators/pickup';
import { calculateOrderTotals } from '@/lib/checkout';
import {
  computeAvailableSlots,
  formatIsoDate,
  getDateRange,
  isDateUnavailable,
  isLocationOpenOnDate,
} from '@/lib/pickup/slots';
import { generateOrderNumber, generatePickupCode, normalizeTimeValue } from '@/lib/pickup/code';
import { sendPickupConfirmationEmail } from '@/services/pickup-email.service';
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
    const subtotal = payload.items.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0,
    );
    const totals = calculateOrderTotals(subtotal, payload.fulfillmentMethod, payload.items.length);
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

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user!.id,
        order_number: orderNumber,
        status: payload.fulfillmentMethod === 'store_pickup' ? 'confirmed' : 'pending',
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
      })
      .select('id, order_number, pickup_code')
      .single();

    if (orderError || !order) {
      return { success: false, error: orderError?.message ?? 'Failed to create order' };
    }

    const orderItems = payload.items.map((item) => ({
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
    const { supabase, user } = await requireAuthenticatedUser();
    const { data, error } = await supabase
      .from('orders')
      .select('*, pickup_location:pickup_locations(*)')
      .eq('user_id', user!.id)
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Order not found' };
    return { success: true, data: data as OrderWithPickup };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load order',
    };
  }
}

export async function updatePickupOrderStatusAction(
  input: unknown,
): Promise<ActionResult<OrderWithPickup>> {
  try {
    await requireStaffUser();
    const parsed = updatePickupStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid status update' };
    }

    const { supabase } = await requireStaffUser();
    const orderStatus =
      parsed.data.pickupStatus === 'ready_for_pickup' ? 'ready_for_pickup' : 'collected';

    const { data, error } = await supabase
      .from('orders')
      .update({
        pickup_status: parsed.data.pickupStatus,
        status: orderStatus,
      })
      .eq('id', parsed.data.orderId)
      .select('*, pickup_location:pickup_locations(*)')
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/pickup-orders');
    revalidatePath('/account/orders');

    return { success: true, data: data as OrderWithPickup };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update pickup status',
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

export async function getStaffPickupLocations(): Promise<ActionResult<PickupLocation[]>> {
  try {
    const { supabase } = await requireStaffUser();
    const { data, error } = await supabase
      .from('pickup_locations')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load pickup locations',
    };
  }
}

export async function upsertPickupLocationAction(input: unknown): Promise<ActionResult<PickupLocation>> {
  try {
    const { supabase } = await requireStaffUser();
    const body = input as { id?: string; location: unknown };
    const parsed = pickupLocationSchema.safeParse(body.location);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid location' };
    }

    const payload = {
      ...parsed.data,
      email: parsed.data.email || null,
      updated_at: new Date().toISOString(),
    };

    const query = body.id
      ? supabase.from('pickup_locations').update(payload).eq('id', body.id)
      : supabase.from('pickup_locations').insert(payload);

    const { data, error } = await query.select('*').single();
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/pickup-locations');
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save pickup location',
    };
  }
}

export async function deletePickupLocationAction(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaffUser();
    const { error } = await supabase.from('pickup_locations').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/pickup-locations');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete pickup location',
    };
  }
}

export async function savePickupOpeningHoursAction(input: {
  locationId: string;
  hours: unknown[];
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaffUser();
    const parsedHours = input.hours.map((hour) => pickupOpeningHourSchema.parse(hour));

    await supabase.from('pickup_opening_hours').delete().eq('location_id', input.locationId);

    const { error } = await supabase.from('pickup_opening_hours').insert(
      parsedHours.map((hour) => ({
        location_id: input.locationId,
        ...hour,
      })),
    );

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/pickup-locations');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save opening hours',
    };
  }
}

export async function savePickupTimeSlotsAction(input: {
  locationId: string;
  slots: unknown[];
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaffUser();
    const parsedSlots = input.slots.map((slot) => pickupTimeSlotSchema.parse(slot));

    await supabase.from('pickup_time_slots').delete().eq('location_id', input.locationId);

    const { error } = await supabase.from('pickup_time_slots').insert(
      parsedSlots.map((slot) => ({
        location_id: input.locationId,
        ...slot,
      })),
    );

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/pickup-locations');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save time slots',
    };
  }
}

export async function addPickupUnavailableDateAction(input: {
  locationId: string;
  entry: unknown;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaffUser();
    const parsed = pickupUnavailableDateSchema.parse(input.entry);
    const { error } = await supabase.from('pickup_unavailable_dates').insert({
      location_id: input.locationId,
      ...parsed,
    });
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/pickup-locations');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add unavailable date',
    };
  }
}

export async function removePickupUnavailableDateAction(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaffUser();
    const { error } = await supabase.from('pickup_unavailable_dates').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/pickup-locations');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove unavailable date',
    };
  }
}

export async function getStaffPickupOrders(): Promise<ActionResult<OrderWithPickup[]>> {
  try {
    const { supabase } = await requireStaffUser();
    const { data, error } = await supabase
      .from('orders')
      .select('*, pickup_location:pickup_locations(*)')
      .eq('fulfillment_method', 'store_pickup')
      .order('pickup_date', { ascending: true })
      .order('pickup_time', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as OrderWithPickup[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load pickup orders',
    };
  }
}

export async function getPickupLocationDetails(locationId: string) {
  try {
    const { supabase } = await requireStaffUser();
    const [{ data: location }, { data: hours }, { data: slots }, { data: unavailable }] =
      await Promise.all([
        supabase.from('pickup_locations').select('*').eq('id', locationId).single(),
        supabase.from('pickup_opening_hours').select('*').eq('location_id', locationId),
        supabase.from('pickup_time_slots').select('*').eq('location_id', locationId).order('slot_time'),
        supabase
          .from('pickup_unavailable_dates')
          .select('*')
          .eq('location_id', locationId)
          .order('closed_date'),
      ]);

    if (!location) return { success: false, error: 'Location not found' };
    return {
      success: true,
      data: { location, hours: hours ?? [], slots: slots ?? [], unavailable: unavailable ?? [] },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load location details',
    };
  }
}

export { formatIsoDate };
