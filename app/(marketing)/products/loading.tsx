import { ProductGridSkeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-96 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <ProductGridSkeleton count={12} />
    </main>
  );
}
