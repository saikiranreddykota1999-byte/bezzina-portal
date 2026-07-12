-- Align store pickup hours with business hours: Mon–Fri 7:00 AM – 4:00 PM

UPDATE pickup_opening_hours
SET opens_at = '07:00'::TIME, closes_at = '16:00'::TIME, is_closed = false
WHERE day_of_week BETWEEN 1 AND 5;

UPDATE pickup_opening_hours
SET is_closed = true
WHERE day_of_week IN (0, 6);

UPDATE pickup_time_slots
SET is_active = false
WHERE slot_time >= '16:00'::TIME;

INSERT INTO pickup_time_slots (location_id, slot_time, label, max_capacity)
SELECT pl.id, slot.slot_time, slot.label, slot.max_capacity
FROM pickup_locations pl
CROSS JOIN (
  VALUES
    ('07:00'::TIME, '07:00 – 08:00', 5),
    ('08:00'::TIME, '08:00 – 09:00', 5),
    ('09:00'::TIME, '09:00 – 10:00', 5),
    ('10:00'::TIME, '10:00 – 11:00', 5),
    ('11:00'::TIME, '11:00 – 12:00', 5),
    ('12:00'::TIME, '12:00 – 13:00', 3),
    ('13:00'::TIME, '13:00 – 14:00', 5),
    ('14:00'::TIME, '14:00 – 15:00', 5),
    ('15:00'::TIME, '15:00 – 16:00', 5)
) AS slot(slot_time, label, max_capacity)
ON CONFLICT (location_id, slot_time) DO UPDATE
SET
  label = EXCLUDED.label,
  max_capacity = EXCLUDED.max_capacity,
  is_active = true;

UPDATE site_settings
SET value = '{"monday":"07:00-16:00","tuesday":"07:00-16:00","wednesday":"07:00-16:00","thursday":"07:00-16:00","friday":"07:00-16:00","saturday":"Closed","sunday":"Closed"}'::jsonb
WHERE key = 'business_hours';
