export function CatalogueFilterGroup({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  /** Associates the group title with a control when there is a single select/input. */
  htmlFor?: string;
}) {
  return (
    <div role="group" aria-label={htmlFor ? undefined : label}>
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          {label}
        </label>
      ) : (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

export function CatalogueFilterToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
      />
      {label}
    </label>
  );
}
