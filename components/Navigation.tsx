'use client';

import { LayoutDashboard, List, Plus } from 'lucide-react';

export type View = 'dashboard' | 'expenses';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onAddExpense: () => void;
}

export default function Navigation({
  currentView,
  onViewChange,
  onAddExpense,
}: NavigationProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-base leading-none">$</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base tracking-tight">
                ExpenseTracker
              </span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-2 font-normal">
                Personal Finance
              </span>
            </div>
          </div>

          {/* Desktop nav tabs */}
          <nav className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentView === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => onViewChange('expenses')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentView === 'expenses'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
              Expenses
            </button>
          </nav>

          {/* Add button */}
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Mobile tabs */}
        <nav className="flex sm:hidden items-center gap-1 pb-2.5">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === 'dashboard'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => onViewChange('expenses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === 'expenses'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
            Expenses
          </button>
        </nav>
      </div>
    </header>
  );
}
