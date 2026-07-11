type Props = {
  filtered?: boolean;
};

export function CatalogueEmptyState({ filtered = false }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
      <p className="text-lg font-semibold text-slate-900">
        {filtered ? 'No products match your filters' : 'No products found'}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        {filtered
          ? 'Try clearing your search or adjusting the filters.'
          : 'The catalogue is empty right now. Please check back later or contact us for availability.'}
      </p>
    </div>
  );
}
