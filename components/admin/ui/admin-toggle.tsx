'use client';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
};

export function AdminToggle({ checked, onChange, label, id, disabled }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="admin-toggle inline-flex items-center gap-2.5" htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        className="admin-toggle__input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="admin-toggle__track" aria-hidden="true">
        <span className="admin-toggle__thumb" />
      </span>
      {label && <span className="text-sm font-medium text-[var(--admin-text)]">{label}</span>}
    </label>
  );
}
