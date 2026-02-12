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

  return (
    <Tabs.Root value={value} onValueChange={onChange}>
      <Tabs.List className="flex gap-1 rounded-[var(--radius-input)] bg-[var(--bg-tertiary)] p-1">
        {filters.map((filter) => (
          <Tabs.Trigger
            key={filter.value}
            value={filter.value}
            className={cn(
              'flex-1 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors',
              'data-[state=active]:bg-primary-400 data-[state=active]:text-white',
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
