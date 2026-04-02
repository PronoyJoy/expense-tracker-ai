'use client';

import { useState, useEffect } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import Navigation, { View } from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import ExpenseList from '@/components/ExpenseList';
import ExpenseModal from '@/components/ExpenseModal';
import ExpenseForm from '@/components/ExpenseForm';
import ExportHub from '@/components/ExportHub';
import { ExpenseFormData } from '@/lib/types';
import { generateSampleData } from '@/lib/utils';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function HomePage() {
  const { expenses, isLoaded, addExpense, addMultipleExpenses, updateExpense, deleteExpense } =
    useExpenses();
  const [view, setView] = useState<View>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportHubOpen, setIsExportHubOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  function showToast(message: string, type: Toast['type'] = 'success') {
    const id = toastCounter + 1;
    setToastCounter(id);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  function handleAddExpense(data: ExpenseFormData) {
    addExpense(data);
    setIsAddModalOpen(false);
    showToast('Expense added successfully');
  }

  function handleUpdateExpense(id: string, data: ExpenseFormData) {
    updateExpense(id, data);
    showToast('Expense updated');
  }

  function handleDeleteExpense(id: string) {
    deleteExpense(id);
    showToast('Expense deleted', 'error');
  }

  function handleLoadSampleData() {
    const samples = generateSampleData();
    addMultipleExpenses(samples);
    showToast(`Loaded ${samples.length} sample expenses`, 'info');
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation
        currentView={view}
        onViewChange={setView}
        onAddExpense={() => setIsAddModalOpen(true)}
      />

      <main className="max-w-5xl mx-auto px-4 py-6 pb-12">
        {view === 'dashboard' ? (
          <Dashboard
            expenses={expenses}
            onAddExpense={() => setIsAddModalOpen(true)}
            onLoadSampleData={handleLoadSampleData}
            onViewAll={() => setView('expenses')}
            onOpenExportHub={() => setIsExportHubOpen(true)}
          />
        ) : (
          <ExpenseList
            expenses={expenses}
            onUpdate={handleUpdateExpense}
            onDelete={handleDeleteExpense}
          />
        )}
      </main>

      {/* Add Expense Modal */}
      <ExpenseModal
        title="Add New Expense"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      >
        <ExpenseForm
          onSubmit={handleAddExpense}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </ExpenseModal>

      {/* Export Hub */}
      <ExportHub
        isOpen={isExportHubOpen}
        onClose={() => setIsExportHubOpen(false)}
        expenses={expenses}
        onToast={showToast}
      />

      {/* Toast notifications */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto transition-all duration-300 max-w-xs ${
              toast.type === 'success'
                ? 'bg-emerald-500'
                : toast.type === 'error'
                ? 'bg-red-500'
                : 'bg-indigo-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
