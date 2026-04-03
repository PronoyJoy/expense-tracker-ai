'use client';

import { Expense } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';

interface RecentTransactionsProps {
  expenses: Expense[];
  onViewAll: () => void;
}

export default function RecentTransactions({ expenses, onViewAll }: RecentTransactionsProps) {
  const recent = expenses.slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Transactions</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
            <span className="text-2xl">💳</span>
          </div>
          <p className="text-sm font-medium text-slate-800 mb-1">No transactions yet</p>
          <p className="text-xs text-slate-400">Add your first expense to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-800">Transactions</h2>
        <button
          onClick={onViewAll}
          className="text-violet-600 text-xs font-medium hover:text-violet-700 transition-colors duration-200"
        >
          View all
        </button>
      </div>

      {/* Transaction rows */}
      <div className="divide-y divide-slate-50">
        {recent.map((expense, i) => {
          const config = CATEGORY_CONFIG[expense.category];
          return (
            <div
              key={expense.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Icon badge */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: config.color + '20' }}
              >
                {config.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate leading-tight">
                  {expense.description}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDate(expense.date)} · {expense.category}
                </p>
              </div>

              {/* Amount */}
              <span className="text-sm font-semibold text-slate-800 flex-shrink-0 tabular-nums">
                -{formatCurrency(expense.amount)}
              </span>
            </div>
          );
        })}
      </div>

      {/* View all button */}
      {expenses.length > 6 && (
        <button
          onClick={onViewAll}
          className="mt-4 w-full border border-violet-200 text-violet-600 hover:bg-violet-50 rounded-xl py-2 text-xs font-medium transition-all duration-200"
        >
          View all {expenses.length} transactions
        </button>
      )}
    </div>
  );
}
