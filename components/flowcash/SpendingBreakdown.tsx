'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Expense, Category } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { getTotalByCategory, formatCurrency } from '@/lib/utils';

interface SpendingBreakdownProps {
  expenses: Expense[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-black text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-white/10">
      <p className="text-white/50 mb-0.5">{item.name}</p>
      <p className="font-bold">{formatCurrency(item.value)}</p>
      <p className="text-white/40">{item.payload.percent}%</p>
    </div>
  );
}

export default function SpendingBreakdown({ expenses }: SpendingBreakdownProps) {
  const { data, total, topCategory } = useMemo(() => {
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

    const topCategory = data[0] ?? null;
    return { data, total, topCategory };
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-card">
        <h2 className="text-[17px] font-bold text-black mb-4">Spending Breakdown</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-sm font-medium text-black">No data yet</p>
          <p className="text-xs text-[#666666] mt-1">Add expenses to see your breakdown.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[17px] font-bold text-black">Breakdown</h2>
          <p className="text-xs text-[#666666] mt-0.5">By category</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#666666]">Total</p>
          <p className="text-sm font-bold text-black">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Donut chart */}
      <div className="relative h-[160px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        {topCategory && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl">{topCategory.icon}</span>
            <p className="text-xs font-bold text-black mt-0.5">{topCategory.percent}%</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.slice(0, 4).map((item) => (
          <div key={item.name} className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-[#666666] flex-1">{item.name}</span>
            <span className="text-xs font-semibold text-black tabular-nums">
              {formatCurrency(item.value)}
            </span>
            <span className="text-xs text-[#999] w-8 text-right tabular-nums">
              {item.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
