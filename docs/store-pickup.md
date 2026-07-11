# Store Pickup (Click & Collect)

Enterprise store pickup for the Bezzina B2B portal. Customers can choose delivery or branch pickup during checkout. Admins manage branches, hours, slot capacity, and pickup order status.

## Database schema

Migration: `supabase/migrations/003_store_pickup.sql`

### Tables

| Table | Purpose |
| --- | --- |
| `pickup_locations` | Branch master data, address, instructions, active flag |
| `pickup_opening_hours` | Weekly opening hours per branch (`day_of_week` 0–6) |
| `pickup_unavailable_dates` | Branch closures / holidays |
| `pickup_time_slots` | Configurable pickup windows and per-slot capacity |
| `pickup_slot_bookings` | One booking per pickup order for capacity enforcement |
| `order_notification_logs` | Email confirmation audit trail |

### Orders extensions

| Column | Type | Notes |
| --- | --- | --- |
| `order_number` | `TEXT` | Human-readable order reference |
| `fulfillment_method` | `TEXT` | `delivery` or `store_pickup` |
| `subtotal` | `NUMERIC` | Item subtotal |
| `shipping_cost` | `NUMERIC` | `0` for pickup, `12.50` for delivery |
| `pickup_location_id` | `UUID` | FK to branch |
| `pickup_date` | `DATE` | Scheduled pickup date |
| `pickup_time` | `TIME` | Scheduled slot start |
| `pickup_code` | `TEXT` | Unique customer collection code |
| `pickup_status` | `TEXT` | `scheduled`, `ready_for_pickup`, `collected` |

## Server Actions API

All actions live in `actions/pickup.ts`.

### Customer actions

| Action | Input | Output |
| --- | --- | --- |
| `getActivePickupLocations()` | — | Active branches |
| `getPickupAvailableDates(locationId)` | Branch ID | ISO dates open for pickup |
| `getPickupAvailableSlots(locationId, date)` | Branch + date | Slots with remaining capacity |
| `placeOrderAction(input)` | Zod-validated order payload | Order number + pickup code |
| `getCustomerOrders()` | — | Authenticated customer orders |
| `getCustomerOrderByNumber(orderNumber)` | Order number | Single order |

### Admin actions

| Action | Input | Output |
| --- | --- | --- |
| `getStaffPickupLocations()` | — | All branches |
| `getPickupLocationDetails(locationId)` | Branch ID | Branch + hours + slots + closures |
| `upsertPickupLocationAction({ id?, location })` | Branch form | Saved branch |
| `deletePickupLocationAction(id)` | Branch ID | — |
| `savePickupOpeningHoursAction({ locationId, hours })` | Hours array | — |
| `savePickupTimeSlotsAction({ locationId, slots })` | Slot array | — |
| `addPickupUnavailableDateAction({ locationId, entry })` | Closed date | — |
| `removePickupUnavailableDateAction(id)` | Closure ID | — |
| `getStaffPickupOrders()` | — | Store pickup orders |
| `updatePickupOrderStatusAction({ orderId, pickupStatus })` | Status update | Updated order |

## Validation

Zod schemas in `lib/validators/pickup.ts`.

## Customer flow

1. `/account/checkout` — choose Delivery or Store Pickup
2. For pickup: select branch, date, and time slot
3. `/account/payment` — review summary, pay, create order
4. Success screen shows pickup code
5. `/account/orders` — pickup status, code, branch instructions

## Admin flow

- `/admin/pickup-locations`
- `/admin/pickup-orders`

## Email confirmation

Uses `services/pickup-email.service.ts`. Sends via Resend when `RESEND_API_KEY` is configured; otherwise logs as `queued`.

## Checkout compatibility

Delivery remains the default with €12.50 shipping. Store pickup shipping is free. Cart behaviour is unchanged.
