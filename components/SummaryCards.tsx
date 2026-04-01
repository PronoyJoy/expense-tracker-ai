'use client';

import { Expense } from '@/lib/types';
import { formatCurrency, getCurrentMonthRange, getTopCategory } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { TrendingUp, Calendar, Receipt, Award } from 'lucide-react';

interface SummaryCardsProps {
  expenses: Expense[];
}

export default function SummaryCards({ expenses }: SummaryCardsProps) {
  const { start, end } = getCurrentMonthRange();
  const monthlyExpenses = expenses.filter((e) => e.date >= start && e.date <= end);
  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const topCategory = getTopCategory(expenses);

  const topCategoryConfig = topCategory ? CATEGORY_CONFIG[topCategory.category] : null;

  const cards = [
    {
      title: 'Total Spending',
      value: formatCurrency(totalAll),
      subtitle: `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} recorded`,
      Icon: TrendingUp,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
    {
      title: 'This Month',
      value: formatCurrency(totalMonthly),
      subtitle: `${monthlyExpenses.length} expense${monthlyExpenses.length !== 1 ? 's' : ''} this month`,
      Icon: Calendar,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      title: 'Total Entries',
      value: expenses.length.toString(),
      subtitle: `${monthlyExpenses.length} added this month`,
      Icon: Receipt,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50',
    },
    {
      title: 'Top Category',
      value: topCategory ? topCategory.category : '—',
      subtitle: topCategory ? formatCurrency(topCategory.amount) + ' total' : 'No expenses yet',
      Icon: Award,
      iconColor: topCategoryConfig ? topCategoryConfig.textColor : 'text-gray-400',
      iconBg: topCategoryConfig ? topCategoryConfig.bgColor : 'bg-gray-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <div className={`p-2 rounded-lg ${card.iconBg}`}>
              <card.Icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1 truncate">{card.value}</p>
          <p className="text-xs text-gray-400">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
