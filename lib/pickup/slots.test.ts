import { describe, expect, it } from 'vitest';
import {
  computeAvailableSlots,
  getDateRange,
  isDateUnavailable,
  isLocationOpenOnDate,
} from '@/lib/pickup/slots';

describe('pickup slot availability', () => {
  const openingHours = [
    {
      id: '1',
      location_id: 'loc',
      day_of_week: 1,
      opens_at: '07:00:00',
      closes_at: '16:00:00',
      is_closed: false,
    },
  ];

  it('builds upcoming date ranges', () => {
    const dates = getDateRange(new Date('2026-07-11T10:00:00'), 3);
    expect(dates).toHaveLength(3);
    expect(dates[0]).toBe('2026-07-11');
  });

  it('detects unavailable dates', () => {
    expect(isDateUnavailable('2026-07-12', ['2026-07-12'])).toBe(true);
    expect(isDateUnavailable('2026-07-13', ['2026-07-12'])).toBe(false);
  });

  it('checks opening hours by weekday', () => {
    expect(isLocationOpenOnDate('2026-07-13', openingHours)).toBe(true);
  });

  it('returns only slots with remaining capacity', () => {
    const slots = computeAvailableSlots({
      slots: [
        {
          id: 'slot-1',
          location_id: 'loc',
          slot_time: '10:00:00',
          label: '10:00 – 11:00',
          max_capacity: 2,
          is_active: true,
        },
      ],
      bookings: [{ slot_time: '10:00:00' }, { slot_time: '10:00:00' }],
      date: '2026-07-14',
      now: new Date('2026-07-11T10:00:00'),
    });

    expect(slots).toHaveLength(0);
  });
});
