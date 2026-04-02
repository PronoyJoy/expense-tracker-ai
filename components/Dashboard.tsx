'use client';

import { Expense } from '@/lib/types';
import SummaryCards from './SummaryCards';
import SpendingChart from './SpendingChart';
import CategoryBadge from './CategoryBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, Cloud, Receipt, Sparkles } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  onAddExpense: () => void;
  onLoadSampleData: () => void;
  onViewAll: () => void;
  onOpenExportHub: () => void;
}

export default function Dashboard({
  expenses,
  onAddExpense,
  onLoadSampleData,
  onViewAll,
  onOpenExportHub,
}: DashboardProps) {
  const recentExpenses = expenses.slice(0, 5);
  const isEmpty = expenses.length === 0;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <SummaryCards expenses={expenses} />

      {/* Charts — only when there's data */}
      {expenses.length > 0 && <SpendingChart expenses={expenses} />}

      {/* Recent Expenses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-800 text-sm">Recent Expenses</h3>
          <div className="flex items-center gap-2">
            {expenses.length > 0 && (
              <button
                onClick={onOpenExportHub}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-colors"
              >
                <Cloud className="w-3.5 h-3.5" />
                Export Hub
              </button>
            )}
            {expenses.length > 5 && (
              <button
                onClick={onViewAll}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {isEmpty ? (
          <div className="px-5 py-14 text-center">
            <Receipt className="w-12 h-12 text-gray-150 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-gray-600 font-semibold mb-1">No expenses yet</p>
            <p className="text-gray-400 text-sm mb-6">
              Start tracking your spending to see insights here
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onAddExpense}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Add First Expense
              </button>
              <button
                onClick={onLoadSampleData}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Load Sample Data
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {expense.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(expense.date)}</p>
                </div>
                <CategoryBadge category={expense.category} size="sm" />
                <span className="text-sm font-semibold text-gray-900 ml-1 tabular-nums shrink-0">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
            {expenses.length > 5 && (
              <div className="px-5 py-3 text-center">
                <button
                  onClick={onViewAll}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View all {expenses.length} expenses →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
