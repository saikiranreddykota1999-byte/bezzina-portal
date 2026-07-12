/** Store hours: Monday–Friday, 7:00 AM – 4:00 PM */
export const PICKUP_OPENS_AT = '07:00:00';
export const PICKUP_CLOSES_AT = '16:00:00';

export const DEFAULT_PICKUP_TIME_SLOTS = [
  { slot_time: '07:00:00', label: '07:00 – 08:00', max_capacity: 5 },
  { slot_time: '08:00:00', label: '08:00 – 09:00', max_capacity: 5 },
  { slot_time: '09:00:00', label: '09:00 – 10:00', max_capacity: 5 },
  { slot_time: '10:00:00', label: '10:00 – 11:00', max_capacity: 5 },
  { slot_time: '11:00:00', label: '11:00 – 12:00', max_capacity: 5 },
  { slot_time: '12:00:00', label: '12:00 – 13:00', max_capacity: 3 },
  { slot_time: '13:00:00', label: '13:00 – 14:00', max_capacity: 5 },
  { slot_time: '14:00:00', label: '14:00 – 15:00', max_capacity: 5 },
  { slot_time: '15:00:00', label: '15:00 – 16:00', max_capacity: 5 },
] as const;

export function buildDefaultOpeningHours(locationId = '') {
  return [
    { id: '', location_id: locationId, day_of_week: 0, opens_at: PICKUP_OPENS_AT, closes_at: PICKUP_CLOSES_AT, is_closed: true },
    { id: '', location_id: locationId, day_of_week: 1, opens_at: PICKUP_OPENS_AT, closes_at: PICKUP_CLOSES_AT, is_closed: false },
    { id: '', location_id: locationId, day_of_week: 2, opens_at: PICKUP_OPENS_AT, closes_at: PICKUP_CLOSES_AT, is_closed: false },
    { id: '', location_id: locationId, day_of_week: 3, opens_at: PICKUP_OPENS_AT, closes_at: PICKUP_CLOSES_AT, is_closed: false },
    { id: '', location_id: locationId, day_of_week: 4, opens_at: PICKUP_OPENS_AT, closes_at: PICKUP_CLOSES_AT, is_closed: false },
    { id: '', location_id: locationId, day_of_week: 5, opens_at: PICKUP_OPENS_AT, closes_at: PICKUP_CLOSES_AT, is_closed: false },
    { id: '', location_id: locationId, day_of_week: 6, opens_at: PICKUP_OPENS_AT, closes_at: PICKUP_CLOSES_AT, is_closed: true },
  ];
}
