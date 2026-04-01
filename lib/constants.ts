import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export const CATEGORY_CONFIG: Record<
  Category,
  { color: string; bgColor: string; textColor: string; icon: string; barColor: string }
> = {
  Food: {
    color: '#f97316',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: '🍽️',
    barColor: 'bg-orange-400',
  },
  Transportation: {
    color: '#3b82f6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: '🚗',
    barColor: 'bg-blue-400',
  },
  Entertainment: {
    color: '#a855f7',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: '🎬',
    barColor: 'bg-purple-400',
  },
  Shopping: {
    color: '#ec4899',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    icon: '🛍️',
    barColor: 'bg-pink-400',
  },
  Bills: {
    color: '#ef4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: '📄',
    barColor: 'bg-red-400',
  },
  Other: {
    color: '#6b7280',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    icon: '📦',
    barColor: 'bg-gray-400',
  },
};
