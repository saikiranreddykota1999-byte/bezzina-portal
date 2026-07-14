import { OMS_STATUS_LABELS } from '@/config/oms';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  waiting_for_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  sent_to_warehouse: 'bg-indigo-100 text-indigo-800',
  warehouse_accepted: 'bg-violet-100 text-violet-800',
  preparing: 'bg-orange-100 text-orange-800',
  packed: 'bg-cyan-100 text-cyan-800',
  ready_for_delivery: 'bg-teal-100 text-teal-800',
  out_for_delivery: 'bg-sky-100 text-sky-800',
  delivered: 'bg-green-100 text-green-800',
  ready_for_collection: 'bg-teal-100 text-teal-800',
  collected: 'bg-green-100 text-green-800',
  completed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-700',
};

type Props = {
  status: string | null | undefined;
};

export function OrderStatusBadge({ status }: Props) {
  if (!status) return null;
  const label = OMS_STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
  const color = STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${color}`}>
      {label}
    </span>
  );
}
