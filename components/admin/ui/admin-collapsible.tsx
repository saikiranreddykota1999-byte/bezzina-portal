import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function AdminCollapsible({ title, children, defaultOpen = true }: Props) {
  return (
    <details className="admin-collapsible" open={defaultOpen}>
      <summary className="admin-collapsible__summary">
        {title}
        <ChevronDown className="h-4 w-4 text-[var(--admin-text-muted)]" />
      </summary>
      <div className="admin-collapsible__body">{children}</div>
    </details>
  );
}
