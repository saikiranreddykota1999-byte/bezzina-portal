import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

export function AdminCard({ children, className = '', interactive = false }: Props) {
  return (
    <div className={`admin-card ${interactive ? 'admin-card--interactive' : ''} ${className}`}>
      {children}
    </div>
  );
}
