import { ProductGridSkeleton } from '@/components/ui/skeleton';

export function CatalogueSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading catalogue">
      <div className="mb-6 space-y-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.8fr))]">
          <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden space-y-5 lg:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
            </div>
          ))}
        </aside>
        <div>
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-slate-200" />
          <ProductGridSkeleton count={12} />
        </div>
      </div>
    </div>
  );
}
