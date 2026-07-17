'use client';

import { Check } from 'lucide-react';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
};

export function AdminCheckbox({ checked, onChange, label, ariaLabel, id, disabled, className = '' }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className={`admin-checkbox ${className}`} htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className="admin-checkbox__input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={!label ? ariaLabel : undefined}
      />
      <span className="admin-checkbox__box" aria-hidden="true">
        <Check strokeWidth={3} />
      </span>
      {label && <span className="text-sm font-medium text-[var(--admin-text)]">{label}</span>}
    </label>
  );
}
