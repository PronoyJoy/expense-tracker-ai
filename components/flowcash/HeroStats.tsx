'use client';

import { ArrowUpRight, ArrowDownRight, CalendarDays, TrendingUp, Wallet, Layers } from 'lucide-react';
import { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

interface HeroStatsProps {
  expenses: Expense[];
}

export default function HeroStats({ expenses }: HeroStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = (() => {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })();

    const thisMonthTotal = expenses
      .filter((e) => e.date.startsWith(currentMonth))
      .reduce((s, e) => s + e.amount, 0);

    const lastMonthTotal = expenses
      .filter((e) => e.date.startsWith(lastMonth))
      .reduce((s, e) => s + e.amount, 0);

    const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
    const avgMonthly = expenses.length > 0 ? totalAll / 6 : 0;

    const changePercent =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : 0;

    return { thisMonthTotal, lastMonthTotal, avgMonthly, changePercent, totalAll };
  }, [expenses]);

  const isUp = stats.changePercent >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 fade-in-up">

      {/* Card 1 — This Month */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-500 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-white/20 rounded-xl p-2">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full
            ${isUp ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'}`}>
            {isUp
              ? <ArrowUpRight className="w-3 h-3" />
              : <ArrowDownRight className="w-3 h-3" />
            }
            {Math.abs(stats.changePercent).toFixed(1)}%
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight">{formatCurrency(stats.thisMonthTotal)}</p>
        <p className="text-white/70 text-xs mt-1">This Month</p>
      </div>

      {/* Card 2 — Monthly Avg */}
      <div className="bg-gradient-to-br from-cyan-500 to-sky-500 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-white/20 rounded-xl p-2">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
            6mo
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{formatCurrency(stats.avgMonthly)}</p>
        <p className="text-white/70 text-xs mt-1">Monthly Avg</p>
      </div>

      {/* Card 3 — All Time */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-white/20 rounded-xl p-2">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
            ∑
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{formatCurrency(stats.totalAll)}</p>
        <p className="text-white/70 text-xs mt-1">All Time</p>
      </div>

      {/* Card 4 — Transactions */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-400 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-white/20 rounded-xl p-2">
            <Layers className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight">{expenses.length}</p>
        <p className="text-white/70 text-xs mt-1">Total entries</p>
      </div>

    </div>
  );
}
