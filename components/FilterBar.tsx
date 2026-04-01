'use client';

import { ExpenseFilters } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
  resultCount: number;
  totalCount: number;
}

export const DEFAULT_FILTERS: ExpenseFilters = {
  startDate: '',
  endDate: '',
  category: '',
  search: '',
};

export default function FilterBar({
  filters,
  onChange,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const hasFilters =
    filters.startDate || filters.endDate || filters.category || filters.search;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">Filter & Search</span>
        {hasFilters && (
          <span className="ml-auto text-xs text-gray-400">
            {resultCount} of {totalCount} shown
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by description or category..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-300"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) =>
            onChange({ ...filters, category: e.target.value as ExpenseFilters['category'] })
          }
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-600 min-w-[150px]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Date Range */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-600"
          />
          <span className="text-gray-300 text-sm font-medium">→</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-600"
          />
        </div>

        {/* Clear all filters */}
        {hasFilters && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
