export function ProductSliderSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="aspect-square bg-slate-200" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-2/3 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
