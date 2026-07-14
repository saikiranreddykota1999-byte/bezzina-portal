# Enterprise Order Management System (OMS)

Joseph Bezzina & Co. Ltd — integrated with the existing admin portal, Supabase Auth, and checkout flows.

## Roles

| Role | Portal | Key permissions |
|------|--------|-----------------|
| Super Admin | `/admin` | Full access + users + settings |
| Admin | `/admin` | Products, orders, warehouse, inventory, reports |
| Sales Manager | `/admin` | Orders, approvals, customers, quotes, reports |
| Salesman | `/admin/sales` | Walk-in orders, barcode scan, customers (view) |
| Warehouse Manager | `/admin/warehouse` | Warehouse queue, inventory management |
| Warehouse Staff | `/admin/warehouse` | Accept/prepare/pack orders |
| Delivery Driver | `/admin/delivery` | Delivery queue |
| Customer | `/account` | Own orders + notifications |

Assign roles in **Admin → Users & Roles** (Super Admin only).

## Order types

### Online orders
`waiting_for_approval → approved → sent_to_warehouse → warehouse_accepted → preparing → packed → ready_for_delivery → out_for_delivery → delivered → completed`

### Walk-in store orders
`draft → approved → warehouse_accepted → preparing → ready_for_collection → collected → completed`

## Database migration

Apply `supabase/migrations/020_oms_enterprise.sql`:

- Extended `profiles.role` constraint
- `warehouses`, `product_locations`, `inventory_levels`, `inventory_transactions`
- `order_status_history`, `oms_report_snapshots`
- OMS columns on `orders` (`oms_status`, `order_source`, `timeline`, assignments)
- RLS policies + Realtime publications

```bash
supabase db push
```

## Admin routes

| Route | Purpose |
|-------|---------|
| `/admin/orders` | Unified order list + workflow |
| `/admin/orders/[id]` | Order detail + timeline |
| `/admin/sales` | Salesman portal |
| `/admin/warehouse` | Warehouse portal |
| `/admin/delivery` | Delivery driver portal |
| `/admin/inventory` | Stock levels + low-stock alerts |
| `/admin/reports` | Daily/weekly/monthly OMS reports |

Existing **Pickup Orders** (`/admin/pickup-orders`) remains for backward compatibility.

## Inventory

- **Reserve** on order approval
- **Deduct** on completion
- **Release** on rejection/cancellation
- Product location: Warehouse → Zone → Rack → Shelf → Bin (`product_locations`)

## Notifications

Realtime via Supabase on `order_status_history` and `notifications`. Roles receive updates for queue changes, ready states, and delivery milestones.

## Barcode

Salesman portal supports camera scan (BarcodeDetector API) and keyboard wedge scanners. Lookup matches `products.barcode` or `product_variants.barcode`.

## Architecture

```
config/oms.ts              — Status flows, reject reasons
types/oms.ts               — OMS TypeScript types
lib/auth/oms-permissions.ts — Role → permission map
services/oms-order.service.ts
services/inventory.service.ts
services/oms-notification.service.ts
services/oms-report.service.ts
actions/oms-orders.ts
actions/oms-warehouse.ts
actions/oms-salesman.ts
actions/oms-reports.ts
hooks/use-oms-realtime.ts
```

## Incremental rollout

1. Apply migration `020`
2. Assign OMS roles to staff accounts
3. Seed warehouse + product barcodes/locations via admin
4. Online checkout auto-creates orders with `oms_status = waiting_for_approval`
5. Walk-in orders created from `/admin/sales`
