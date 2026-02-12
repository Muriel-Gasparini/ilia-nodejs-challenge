import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogContent({
  children,
  className,
  title,
  titleClassName,
}: {
  children: ReactNode;
  className?: string;
  title: ReactNode;
  titleClassName?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-[var(--radius-card)] border border-[var(--border-secondary)] bg-[var(--bg-secondary)] p-6 shadow-xl',
          'data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out',
          className,
        )}
      >
        <DialogPrimitive.Title
          className={cn('mb-4 text-lg font-semibold text-[var(--text-primary)]', titleClassName)}
        >
          {title}
        </DialogPrimitive.Title>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
