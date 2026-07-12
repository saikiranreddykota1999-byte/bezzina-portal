import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'accent' | 'ghost';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary: 'admin-btn--primary',
  secondary: 'admin-btn--secondary',
  danger: 'admin-btn--danger',
  accent: 'admin-btn--accent',
  ghost: 'admin-btn--ghost',
};

export function AdminButton({ variant = 'primary', className = '', children, ...props }: Props) {
  return (
    <button type="button" className={`admin-btn ${variantClass[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
