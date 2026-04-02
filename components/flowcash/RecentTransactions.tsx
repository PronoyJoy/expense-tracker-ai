'use client';

import { useMemo } from 'react';
import { Expense } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { formatCurrency, formatDate, getTotalByCategory } from '@/lib/utils';
import ProgressRing from './ProgressRing';
import { ArrowUpRight } from 'lucide-react';

interface RecentTransactionsProps {
  expenses: Expense[];
  onViewAll: () => void;
}

export default function RecentTransactions({ expenses, onViewAll }: RecentTransactionsProps) {
  const recent = expenses.slice(0, 6);

  const budgets = useMemo(() => {
    const totals = getTotalByCategory(expenses);
    const max = Math.max(...Object.values(totals), 1);
    return totals;
  }, [expenses]);

  const globalMax = useMemo(() => {
    const totals = getTotalByCategory(expenses);
    return Math.max(...Object.values(totals), 1);
  }, [expenses]);

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-card h-full flex flex-col">
        <SectionHeader title="Recent Transactions" count={0} onViewAll={onViewAll} />
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-14 h-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mb-3">
            <span className="text-2xl">💳</span>
          </div>
          <p className="text-sm font-medium text-black mb-1">No transactions yet</p>
          <p className="text-xs text-[#666666]">Add your first expense to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card flex flex-col">
      <SectionHeader title="Recent Transactions" count={expenses.length} onViewAll={onViewAll} />

      <div className="mt-4 space-y-1">
        {recent.map((expense, i) => {
          const config = CATEGORY_CONFIG[expense.category];
          const catTotal = budgets[expense.category] || 0;
          const progress = Math.round((catTotal / globalMax) * 100);

          return (
            <div
              key={expense.id}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F5F5F5] transition-all duration-200 cursor-default group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Progress ring with icon */}
              <div className="relative flex-shrink-0">
                <ProgressRing
                  radius={22}
                  stroke={2.5}
                  progress={progress}
                  color={config.color}
                  trackColor="#F0F0F0"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[11px]">
                  {config.icon}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate leading-tight">
                  {expense.description}
                </p>
                <p className="text-xs text-[#666666] mt-0.5">
                  {formatDate(expense.date)} · {expense.category}
                </p>
              </div>

              {/* Amount */}
              <span className="text-sm font-bold text-black flex-shrink-0 tabular-nums">
                -{formatCurrency(expense.amount)}
              </span>
            </div>
          );
        })}
      </div>

      {expenses.length > 6 && (
        <button
          onClick={onViewAll}
          className="mt-4 w-full py-2.5 rounded-2xl border border-[#E5E5E5] text-xs font-semibold text-[#666666]
            hover:border-black hover:text-black transition-all duration-200"
        >
          View all {expenses.length} transactions
        </button>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  count,
  onViewAll,
}: {
  title: string;
  count: number;
  onViewAll: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-[17px] font-bold text-black">{title}</h2>
        {count > 0 && (
          <p className="text-xs text-[#666666] mt-0.5">{count} total</p>
        )}
      </div>
      {count > 0 && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-[#666666] hover:text-black transition-colors duration-200"
        >
          See all <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
