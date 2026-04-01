'use client';

import { Expense } from '@/lib/types';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/constants';
import { formatCurrency, getTotalByCategory, getMonthlyTrend } from '@/lib/utils';

interface SpendingChartProps {
  expenses: Expense[];
}

export default function SpendingChart({ expenses }: SpendingChartProps) {
  const byCategory = getTotalByCategory(expenses);
  const monthlyTrend = getMonthlyTrend(expenses, 6);
  const maxMonthly = Math.max(...monthlyTrend.map((m) => m.total), 1);
  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentMonth = new Date().toISOString().substring(0, 7);

  const categoriesWithData = CATEGORIES.filter((cat) => (byCategory[cat] || 0) > 0).sort(
    (a, b) => (byCategory[b] || 0) - (byCategory[a] || 0)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Category Breakdown */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h3>
        {categoriesWithData.length === 0 ? (
          <div className="flex items-center justify-center h-36 text-gray-300 text-sm">
            No data to display
          </div>
        ) : (
          <div className="space-y-3.5">
            {categoriesWithData.map((cat) => {
              const amount = byCategory[cat] || 0;
              const pct = totalAll > 0 ? (amount / totalAll) * 100 : 0;
              const config = CATEGORY_CONFIG[cat];
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <span>{config.icon}</span>
                      <span>{cat}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{pct.toFixed(1)}%</span>
                      <span className="text-sm font-semibold text-gray-800 min-w-[70px] text-right">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: config.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">6-Month Trend</h3>
        {monthlyTrend.every((m) => m.total === 0) ? (
          <div className="flex items-center justify-center h-36 text-gray-300 text-sm">
            No data to display
          </div>
        ) : (
          <div className="flex items-end gap-2 h-36 pt-2">
            {monthlyTrend.map((m) => {
              const heightPct = maxMonthly > 0 ? (m.total / maxMonthly) * 100 : 0;
              const isCurrent = m.month === currentMonth;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div
                    className="w-full flex flex-col justify-end"
                    style={{ height: '112px' }}
                  >
                    {m.total > 0 && (
                      <div className="relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                          {m.label}
                          <br />
                          <span className="font-semibold">{formatCurrency(m.total)}</span>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>
                        <div
                          className={`w-full rounded-t-md transition-all duration-700 ease-out cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-500 group-hover:bg-indigo-400'
                              : 'bg-indigo-200 group-hover:bg-indigo-300'
                          }`}
                          style={{ height: `${Math.max(heightPct * 1.12, 6)}px` }}
                        />
                      </div>
                    )}
                    {m.total === 0 && (
                      <div className="w-full h-1 bg-gray-100 rounded" />
                    )}
                  </div>
                  <span
                    className={`text-xs text-center leading-tight ${
                      isCurrent ? 'text-indigo-600 font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {m.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
