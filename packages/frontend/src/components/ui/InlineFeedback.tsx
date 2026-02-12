import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FeedbackVariant = 'success' | 'error' | 'warning';

interface InlineFeedbackProps {
  variant: FeedbackVariant;
  message: string | ReactNode;
  className?: string;
  autoDismissMs?: number;
  onDismiss?: () => void;
}

const variantStyles: Record<FeedbackVariant, string> = {
  success: 'bg-primary-50 text-primary-700 dark:bg-primary-400/10 dark:text-primary-400',
  error: 'bg-error-50 text-error-500 dark:bg-error-400/10 dark:text-error-400',
  warning: 'bg-warning-50 text-warning-500 dark:bg-warning-400/10 dark:text-warning-400',
};

const icons: Record<FeedbackVariant, ReactNode> = {
  success: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
    </svg>
  ),
  error: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.5M8 10.5v.5" />
    </svg>
  ),
  warning: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M8 2L1.5 13h13L8 2z" />
      <path d="M8 6.5V9M8 11v.5" />
    </svg>
  ),
};

export function InlineFeedback({
  variant,
  message,
  className,
  autoDismissMs = 0,
  onDismiss,
}: InlineFeedbackProps) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(() => {
        setLeaving(true);
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs]);

  const handleAnimationEnd = () => {
    if (leaving) {
      setVisible(false);
      onDismiss?.();
    }
  };

  if (!visible) return null;

  return (
    <div
      role="status"
      onAnimationEnd={handleAnimationEnd}
      className={cn(
        'flex items-center gap-2.5 rounded-[var(--radius-input)] px-4 py-3 text-sm font-medium',
        leaving ? 'animate-fade-out-down' : 'animate-fade-in-up',
        variantStyles[variant],
        className,
      )}
    >
      <span className="shrink-0">{icons[variant]}</span>
      <span>{message}</span>
    </div>
  );
}
