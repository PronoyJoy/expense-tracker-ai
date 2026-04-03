'use client';

import { useMemo } from 'react';
import { Expense, Category } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { getTotalByCategory, formatCurrency } from '@/lib/utils';

interface SpendingBreakdownProps {
  expenses: Expense[];
}

export default function SpendingBreakdown({ expenses }: SpendingBreakdownProps) {
  const { data, total } = useMemo(() => {
    const totals = getTotalByCategory(expenses);
    const total = Object.values(totals).reduce((s, v) => s + v, 0);

    const data = (Object.entries(totals) as [Category, number][])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, value]) => ({
        name: cat,
        value,
        color: CATEGORY_CONFIG[cat].color,
        icon: CATEGORY_CONFIG[cat].icon,
        percent: total > 0 ? Math.round((value / total) * 100) : 0,
      }));

    return { data, total };
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">By Category</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-sm font-medium text-slate-800">No data yet</p>
          <p className="text-xs text-slate-400 mt-1">Add expenses to see your breakdown.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <h2 className="text-base font-semibold text-slate-800">By Category</h2>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-sm font-semibold text-slate-800">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Category rows with progress bars */}
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.name}>
            {/* Row: icon + name + amount */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">{item.icon}</span>
              <span className="text-sm text-slate-700 flex-1">{item.name}</span>
              <span className="text-sm font-semibold text-slate-800 tabular-nums">
                {formatCurrency(item.value)}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${item.percent}%`, backgroundColor: item.color }}
              />
            </div>
            {/* Percentage label */}
            <p className="text-xs text-slate-400 mt-1">{item.percent}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
