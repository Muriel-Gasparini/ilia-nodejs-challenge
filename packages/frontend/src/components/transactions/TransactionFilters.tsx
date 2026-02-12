import { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { TransactionType } from '@/types/api';

interface TransactionFiltersProps {
  value: string;
  onChange: (value: string) => void;
}

const filters: { value: string; labelKey: string }[] = [
  { value: 'ALL', labelKey: 'transactions:all' },
  { value: 'CREDIT', labelKey: 'transactions:credit' },
  { value: 'DEBIT', labelKey: 'transactions:debit' },
];

export function TransactionFilters({ value, onChange }: TransactionFiltersProps) {
  const { t } = useTranslation();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  const updateIndicator = useCallback(() => {
    const idx = filters.findIndex((f) => f.value === value);
    const el = tabRefs.current[idx];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
      if (!ready) setReady(true);
    }
  }, [value, ready]);

  useLayoutEffect(updateIndicator, [updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <Tabs.Root value={value} onValueChange={onChange}>
      <Tabs.List className="relative flex gap-1 rounded-[var(--radius-input)] bg-[var(--bg-tertiary)] p-1">
        <div
          className={cn(
            'absolute top-1 bottom-1 rounded-[var(--radius-sm)] bg-primary-600 shadow-sm dark:bg-primary-400',
            ready ? 'transition-all duration-150 ease-out' : '',
          )}
          style={{ left: indicator.left, width: indicator.width }}
        />
        {filters.map((filter, idx) => (
          <Tabs.Trigger
            key={filter.value}
            value={filter.value}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            className={cn(
              'relative z-10 flex-1 rounded-[var(--radius-sm)] bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-300 ease-in-out',
              'data-[state=active]:text-white dark:data-[state=active]:text-neutral-950',
              'data-[state=inactive]:text-[var(--text-secondary)] data-[state=inactive]:hover:text-[var(--text-primary)]',
            )}
          >
            {t(filter.labelKey)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}

export type FilterValue = 'ALL' | TransactionType;
