import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, prefix, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none text-[var(--text-tertiary)]">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'h-14 w-full rounded-[var(--radius-input)] border bg-[var(--bg-secondary)] px-4 text-[var(--text-primary)] transition-all duration-200 ease-in-out placeholder:text-[var(--text-tertiary)] focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 disabled:opacity-60',
              error ? 'border-error-400' : 'border-[var(--border-primary)]',
              prefix && 'pl-12',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-error-500 dark:text-error-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
