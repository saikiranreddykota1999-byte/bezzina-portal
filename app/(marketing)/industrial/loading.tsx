export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8 h-10 w-64 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="hidden h-96 animate-pulse rounded-xl bg-slate-100 lg:block" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
