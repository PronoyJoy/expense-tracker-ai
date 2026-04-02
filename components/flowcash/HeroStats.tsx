'use client';

import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
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
    <div className="relative bg-black rounded-3xl p-6 overflow-hidden fade-in-up">
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/[0.04] rounded-full translate-y-1/2 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">

        {/* Left: User profile */}
        <div className="flex items-center gap-4 sm:border-r sm:border-white/10 sm:pr-8">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-white">
              P
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-black" />
          </div>
          <div>
            <p className="text-white/50 text-xs font-medium mb-0.5">Welcome back</p>
            <p className="text-white font-bold text-lg leading-tight">Pronoy</p>
            <p className="text-white/40 text-xs mt-0.5">Personal Finance</p>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex flex-1 flex-col sm:flex-row gap-4 sm:gap-6">

          {/* This month spending */}
          <div className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-white/50 text-xs font-medium">This Month</p>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
                ${isUp ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {isUp
                  ? <ArrowUpRight className="w-3 h-3" />
                  : <ArrowDownRight className="w-3 h-3" />
                }
                {Math.abs(stats.changePercent).toFixed(1)}%
              </div>
            </div>
            <p className="text-white font-bold text-2xl tracking-tight">
              {formatCurrency(stats.thisMonthTotal)}
            </p>
            <p className="text-white/30 text-xs mt-1">
              vs {formatCurrency(stats.lastMonthTotal)} last month
            </p>
          </div>

          {/* Avg Monthly */}
          <div className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-white/50 text-xs font-medium">Avg / Month</p>
              <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                <TrendingUp className="w-3 h-3" />
                6mo
              </div>
            </div>
            <p className="text-white font-bold text-2xl tracking-tight">
              {formatCurrency(stats.avgMonthly)}
            </p>
            <p className="text-white/30 text-xs mt-1">
              {expenses.length} total transactions
            </p>
          </div>

          {/* Total all time */}
          <div className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-white/50 text-xs font-medium">All Time</p>
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-white/60 text-[10px]">∑</span>
              </div>
            </div>
            <p className="text-white font-bold text-2xl tracking-tight">
              {formatCurrency(stats.totalAll)}
            </p>
            <p className="text-white/30 text-xs mt-1">
              Tracked expenses total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
