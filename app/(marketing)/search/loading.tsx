export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-6 h-10 w-48 animate-pulse rounded bg-slate-200" />
      <div className="h-12 w-full max-w-xl animate-pulse rounded-xl bg-slate-100" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
