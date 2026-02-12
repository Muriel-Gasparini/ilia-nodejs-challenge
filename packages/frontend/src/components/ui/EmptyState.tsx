import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon && <div className="text-[var(--text-tertiary)]">{icon}</div>}
      <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-[var(--text-secondary)]">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
