'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Expense } from '@/lib/types';
import { getMonthlyTrend } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ReportsChartProps {
  expenses: Expense[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2">
      <p className="text-slate-400 text-xs mb-0.5">{label}</p>
      <p className="font-bold text-slate-800 text-base">${payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export default function ReportsChart({ expenses }: ReportsChartProps) {
  const data = useMemo(() => getMonthlyTrend(expenses, 6), [expenses]);

  const trend = useMemo(() => {
    if (data.length < 2) return null;
    const last = data[data.length - 1].total;
    const prev = data[data.length - 2].total;
    if (prev === 0) return null;
    return ((last - prev) / prev) * 100;
  }, [data]);

  const isUp = trend !== null && trend >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Spending Trend</h2>
          <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
        </div>
        {trend !== null && (
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full
            ${isUp ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
            {isUp
              ? <TrendingUp className="w-3.5 h-3.5" />
              : <TrendingDown className="w-3.5 h-3.5" />
            }
            {Math.abs(trend).toFixed(1)}% MoM
          </div>
        )}
      </div>

      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="nexusAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#7C3AED" stopOpacity={0.10} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.split(' ')[0]}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#7C3AED', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#7C3AED"
              strokeWidth={2}
              fill="url(#nexusAreaGrad)"
              dot={{ r: 3, fill: '#7C3AED', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#7C3AED', strokeWidth: 2, stroke: '#fff' }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
