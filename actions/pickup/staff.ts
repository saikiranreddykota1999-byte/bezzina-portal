'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import {
  pickupLocationSchema,
  pickupOpeningHourSchema,
  pickupTimeSlotSchema,
  pickupUnavailableDateSchema,
  updatePickupStatusSchema,
} from '@/lib/validators/pickup';
import type {
  ActionResult,
  OrderWithPickup,
  PickupLocation,
} from '@/types/pickup';

export async function updatePickupOrderStatusAction(
  input: unknown,
): Promise<ActionResult<OrderWithPickup>> {
  try {
    await requirePermission('pickup:manage');
    const parsed = updatePickupStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid status update' };
    }

    const { supabase } = await requirePermission('pickup:manage');
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

export async function getStaffPickupLocations(): Promise<ActionResult<PickupLocation[]>> {
  try {
    const { supabase } = await requirePermission('pickup:manage');
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
    const { supabase } = await requirePermission('pickup:manage');
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
    const { supabase } = await requirePermission('pickup:manage');
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
    const { supabase } = await requirePermission('pickup:manage');
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
    const { supabase } = await requirePermission('pickup:manage');
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
    const { supabase } = await requirePermission('pickup:manage');
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
    const { supabase } = await requirePermission('pickup:manage');
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
    const { supabase } = await requirePermission('pickup:manage');
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
    const { supabase } = await requirePermission('pickup:manage');
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
