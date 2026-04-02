'use client';

import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import HeroStats from './HeroStats';
import RecentTransactions from './RecentTransactions';
import QuickAdd from './QuickAdd';
import ReportsChart from './ReportsChart';
import SpendingBreakdown from './SpendingBreakdown';
import { ExpenseFormData } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Bell, Search } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function FlowCashDashboard() {
  const { expenses, isLoaded, addExpense, deleteExpense, updateExpense } = useExpenses();
  const [view, setView] = useState('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  function showToast(message: string, type: Toast['type'] = 'success') {
    const id = toastCounter + 1;
    setToastCounter(id);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }

  function handleAdd(data: ExpenseFormData) {
    addExpense(data);
    showToast('Expense added');
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[#666666] text-sm font-medium">Loading FlowCash...</p>
        </div>
      </div>
    );
  }

  const filteredExpenses = searchQuery.trim()
    ? expenses.filter(
        (e) =>
          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : expenses;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Sidebar */}
      <Sidebar activeView={view} onViewChange={setView} />

      {/* Main */}
      <div className="lg:pl-[260px] pb-24 lg:pb-0">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

          {/* Top header */}
          <header className="flex items-center justify-between mb-7">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-black leading-tight">
                Hello, Pronoy 👋
              </h1>
              <p className="text-[#666666] text-sm mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              {searchOpen ? (
                <div className="flex items-center bg-white border border-[#E5E5E5] rounded-full px-4 py-2 shadow-card scale-pop">
                  <Search className="w-3.5 h-3.5 text-[#666666] mr-2 flex-shrink-0" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                    placeholder="Search expenses..."
                    className="text-sm outline-none bg-transparent w-40 placeholder-[#AAAAAA]"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-10 h-10 bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center
                    hover:border-black transition-all duration-200 shadow-card"
                >
                  <Search className="w-4 h-4 text-[#666666]" />
                </button>
              )}

              {/* Notifications */}
              <button className="relative w-10 h-10 bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center
                hover:border-black transition-all duration-200 shadow-card">
                <Bell className="w-4 h-4 text-[#666666]" />
                {expenses.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full" />
                )}
              </button>

              {/* Add Expense CTA */}
              <button
                onClick={() => {
                  const el = document.getElementById('quick-add-section');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="hidden sm:flex items-center gap-2 bg-black text-white rounded-full px-5 py-2.5 text-sm font-semibold
                  hover:opacity-80 transition-all duration-200 active:scale-95 shadow-dark-glow"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
          </header>

          {/* Hero Stats */}
          <div className="mb-6">
            <HeroStats expenses={filteredExpenses} />
          </div>

          {/* Three-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {/* Column 1: Recent Transactions */}
            <div className="fade-in-up" style={{ animationDelay: '80ms' }}>
              <RecentTransactions
                expenses={filteredExpenses}
                onViewAll={() => setView('transactions')}
              />
            </div>

            {/* Column 2: Quick Add */}
            <div id="quick-add-section" className="fade-in-up" style={{ animationDelay: '160ms' }}>
              <QuickAdd onAdd={handleAdd} />
            </div>

            {/* Column 3: Analytics */}
            <div className="flex flex-col gap-5 md:col-span-2 xl:col-span-1 fade-in-up" style={{ animationDelay: '240ms' }}>
              <ReportsChart expenses={filteredExpenses} />
              <SpendingBreakdown expenses={filteredExpenses} />
            </div>
          </div>

          {/* Transactions view */}
          {view === 'transactions' && expenses.length > 0 && (
            <div className="mt-6 bg-white rounded-3xl p-6 shadow-card scale-pop">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-bold text-black">All Transactions</h2>
                <span className="text-xs text-[#666666] bg-[#F5F5F5] px-3 py-1 rounded-full">
                  {filteredExpenses.length} total
                </span>
              </div>
              <div className="space-y-1">
                {filteredExpenses.map((expense) => {
                  const cfg = CATEGORY_CONFIG[expense.category];
                  return (
                    <div key={expense.id}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F5F5F5] transition-all duration-200 group">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ backgroundColor: `${cfg.color}15` }}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-black truncate">{expense.description}</p>
                        <p className="text-xs text-[#666666] mt-0.5">{formatDate(expense.date)} · {expense.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-black tabular-nums">
                          -{formatCurrency(expense.amount)}
                        </span>
                        <button
                          onClick={() => { deleteExpense(expense.id); showToast('Deleted', 'error'); }}
                          className="opacity-0 group-hover:opacity-100 text-xs text-[#999] hover:text-red-500 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav activeView={view} onViewChange={setView} />

      {/* Toast notifications */}
      <div className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-2xl shadow-dark-glow text-sm font-semibold text-white pointer-events-auto scale-pop
              ${toast.type === 'success' ? 'bg-black' : toast.type === 'error' ? 'bg-red-500' : 'bg-[#333]'}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
