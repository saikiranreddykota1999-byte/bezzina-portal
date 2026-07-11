import type { AvailablePickupSlot, PickupOpeningHour, PickupTimeSlot } from '@/types/pickup';
import { normalizeTimeValue } from '@/lib/pickup/code';

export function getDateRange(startDate: Date, daysAhead: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < daysAhead; i += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(formatIsoDate(date));
  }
  return dates;
}

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDateUnavailable(
  date: string,
  unavailableDates: string[],
): boolean {
  return unavailableDates.includes(date);
}

export function isLocationOpenOnDate(
  date: string,
  openingHours: PickupOpeningHour[],
): boolean {
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
  const hours = openingHours.find((entry) => entry.day_of_week === dayOfWeek);
  if (!hours) return false;
  return !hours.is_closed;
}

export function computeAvailableSlots(input: {
  slots: PickupTimeSlot[];
  bookings: Array<{ slot_time: string }>;
  date: string;
  now?: Date;
}): AvailablePickupSlot[] {
  const { slots, bookings, date } = input;
  const now = input.now ?? new Date();
  const today = formatIsoDate(now);

  return slots
    .filter((slot) => slot.is_active)
    .map((slot) => {
      const slotTime = normalizeTimeValue(slot.slot_time);
      const bookedCount = bookings.filter(
        (booking) => normalizeTimeValue(booking.slot_time) === slotTime,
      ).length;
      const remainingCapacity = Math.max(0, slot.max_capacity - bookedCount);

      if (date === today) {
        const slotDateTime = new Date(`${date}T${slotTime}`);
        if (slotDateTime <= now) {
          return null;
        }
      }

      if (remainingCapacity <= 0) {
        return null;
      }

      return {
        slotTime,
        label: slot.label,
        remainingCapacity,
        maxCapacity: slot.max_capacity,
      };
    })
    .filter((slot): slot is AvailablePickupSlot => slot !== null);
}

export function getPickupStatusLabel(status: string | null): string {
  switch (status) {
    case 'scheduled':
      return 'Scheduled for pickup';
    case 'ready_for_pickup':
      return 'Ready for pickup';
    case 'collected':
      return 'Collected';
    default:
      return 'Processing';
  }
}
