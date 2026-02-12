import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[var(--bg-tertiary)]',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'card' && 'h-32 w-full rounded-[var(--radius-card)]',
        variant === 'circle' && 'h-10 w-10 rounded-full',
        className,
      )}
    />
  );
}
