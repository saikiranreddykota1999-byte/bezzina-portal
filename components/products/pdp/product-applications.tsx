'use client';

type Props = {
  applications: string | null | undefined;
};

export function ProductApplications({ applications }: Props) {
  if (!applications?.trim()) return null;

  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-slate-900">Applications</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{applications}</p>
    </div>
  );
}
