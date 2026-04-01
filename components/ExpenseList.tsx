'use client';

import { useState, useMemo } from 'react';
import { Expense, ExpenseFilters, ExpenseFormData } from '@/lib/types';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';
import FilterBar, { DEFAULT_FILTERS } from './FilterBar';
import ExpenseModal from './ExpenseModal';
import ExpenseForm from './ExpenseForm';
import { Download, Trash2, Pencil, Receipt, ChevronDown, ChevronUp } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onUpdate: (id: string, data: ExpenseFormData) => void;
  onDelete: (id: string) => void;
}

type SortField = 'date' | 'amount' | 'category' | 'description';
type SortDir = 'asc' | 'desc';

export default function ExpenseList({ expenses, onUpdate, onDelete }: ExpenseListProps) {
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const filtered = useMemo(() => {
    let result = expenses.filter((expense) => {
      if (filters.startDate && expense.date < filters.startDate) return false;
      if (filters.endDate && expense.date > filters.endDate) return false;
      if (filters.category && expense.category !== filters.category) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !expense.description.toLowerCase().includes(q) &&
          !expense.category.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else if (sortField === 'category') cmp = a.category.localeCompare(b.category);
      else if (sortField === 'description') cmp = a.description.localeCompare(b.description);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [expenses, filters, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-indigo-500" />
    ) : (
      <ChevronDown className="w-3 h-3 text-indigo-500" />
    );
  }

  function handleUpdate(data: ExpenseFormData) {
    if (editingExpense) {
      onUpdate(editingExpense.id, data);
      setEditingExpense(null);
    }
  }

  function confirmDelete() {
    if (deletingExpense) {
      onDelete(deletingExpense.id);
      setDeletingExpense(null);
    }
  }

  const filteredTotal = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Expenses</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length !== expenses.length
              ? `${filtered.length} of ${expenses.length} expenses`
              : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button
          onClick={() => exportToCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={expenses.length}
      />

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-14 shadow-sm border border-gray-100 text-center">
          <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            {expenses.length === 0 ? 'No expenses yet' : 'No results found'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {expenses.length === 0
              ? 'Click "Add Expense" to record your first expense'
              : 'Try adjusting your filters or search term'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[130px_1fr_170px_110px_76px] gap-4 px-5 py-3 bg-gray-50/80 border-b border-gray-100">
            {(
              [
                { label: 'Date', field: 'date' as SortField },
                { label: 'Description', field: 'description' as SortField },
                { label: 'Category', field: 'category' as SortField },
                { label: 'Amount', field: 'amount' as SortField, right: true },
              ] as { label: string; field: SortField; right?: boolean }[]
            ).map(({ label, field, right }) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={`flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors ${
                  right ? 'justify-end' : ''
                }`}
              >
                {label}
                <SortIcon field={field} />
              </button>
            ))}
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
              Actions
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {filtered.map((expense) => (
              <div
                key={expense.id}
                className="hover:bg-slate-50/60 transition-colors"
              >
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-[130px_1fr_170px_110px_76px] gap-4 px-5 py-3.5 items-center">
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(expense.date)}
                  </span>
                  <span className="text-sm font-medium text-gray-800 truncate pr-2" title={expense.description}>
                    {expense.description}
                  </span>
                  <div>
                    <CategoryBadge category={expense.category} size="sm" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 text-right tabular-nums">
                    {formatCurrency(expense.amount)}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit expense"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingExpense(expense)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mobile row */}
                <div className="md:hidden px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {expense.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
                        <CategoryBadge category={expense.category} size="sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {formatCurrency(expense.amount)}
                      </span>
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingExpense(expense)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer totals */}
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50/80 border-t border-gray-100">
            <span className="text-sm text-gray-500 font-medium">
              Total{filtered.length !== expenses.length ? ' (filtered)' : ''}
            </span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              {formatCurrency(filteredTotal)}
            </span>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <ExpenseModal
        title="Edit Expense"
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
      >
        {editingExpense && (
          <ExpenseForm
            initialData={{
              amount: editingExpense.amount,
              category: editingExpense.category,
              description: editingExpense.description,
              date: editingExpense.date,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingExpense(null)}
            isEditing
          />
        )}
      </ExpenseModal>

      {/* Delete Confirm Modal */}
      <ExpenseModal
        title="Delete Expense"
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
      >
        {deletingExpense && (
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-gray-800 font-semibold mb-1">Delete this expense?</p>
            <p className="text-gray-400 text-sm mb-1 truncate px-4">
              &ldquo;{deletingExpense.description}&rdquo;
            </p>
            <p className="text-gray-400 text-sm mb-6 font-medium">
              {formatCurrency(deletingExpense.amount)}
            </p>
            <p className="text-xs text-gray-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingExpense(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </ExpenseModal>
    </div>
  );
}
