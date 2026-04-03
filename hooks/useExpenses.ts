'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Expense, ExpenseFormData, Category } from '@/lib/types';

// Shape returned by the Supabase DB (snake_case)
interface ApiExpenseRow {
  id: string
  user_id: string
  amount: number
  category: string
  description: string
  date: string
  created_at: string
}

function toExpense(e: ApiExpenseRow): Expense {
  return {
    id: e.id,
    amount: e.amount,
    category: e.category as Category,
    description: e.description,
    date: e.date,
    createdAt: e.created_at,
  }
}

/**
 * useExpenses — fetches and manages expenses via the server API routes.
 * Keeps the same interface as before so no component changes are needed.
 * Uses optimistic updates: UI updates immediately, rolls back on error.
 */
export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all expenses from the server on mount
  useEffect(() => {
    fetch('/api/expenses')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load expenses');
        return res.json();
      })
      .then((data: ApiExpenseRow[]) => {
        setExpenses(data.map(toExpense));
      })
      .catch(() => {
        // If the fetch fails (e.g. not logged in), stay with empty array
        setExpenses([]);
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const addExpense = useCallback((data: ExpenseFormData): Expense => {
    // Optimistic update — insert a placeholder with a temp id
    const tempId = `temp_${Date.now()}`;
    const optimistic: Expense = { ...data, id: tempId, createdAt: new Date().toISOString() };
    setExpenses((prev) => [optimistic, ...prev]);

    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save expense');
        return res.json();
      })
      .then((saved: ApiExpenseRow) => {
        // Replace the optimistic entry with the real one from the server
        setExpenses((prev) =>
          prev.map((e) => (e.id === tempId ? toExpense(saved) : e))
        );
      })
      .catch(() => {
        // Roll back on failure
        setExpenses((prev) => prev.filter((e) => e.id !== tempId));
      });

    return optimistic;
  }, []);

  const addMultipleExpenses = useCallback((dataList: ExpenseFormData[]): void => {
    dataList.forEach((data) => addExpense(data));
  }, [addExpense]);

  const updateExpense = useCallback((id: string, data: ExpenseFormData): void => {
    // Optimistic update
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));

    fetch(`/api/expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update expense');
      })
      .catch(() => {
        // Roll back: reload from server
        fetch('/api/expenses')
          .then((r) => r.json())
          .then((fresh: ApiExpenseRow[]) => setExpenses(fresh.map(toExpense)));
      });
  }, []);

  const deleteExpense = useCallback((id: string): void => {
    // Optimistic update
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok && res.status !== 404) throw new Error('Failed to delete expense');
      })
      .catch(() => {
        // On failure reload from server to restore correct state
        fetch('/api/expenses')
          .then((r) => r.json())
          .then((fresh: ApiExpenseRow[]) => setExpenses(fresh.map(toExpense)));
      });
  }, []);

  const clearAllExpenses = useCallback((): void => {
    // Delete each expense individually via the API
    expenses.forEach((e) => {
      fetch(`/api/expenses/${e.id}`, { method: 'DELETE' });
    });
    setExpenses([]);
  }, [expenses]);

  const sortedExpenses = useMemo(
    () =>
      [...expenses].sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
      ),
    [expenses]
  );

  return {
    expenses: sortedExpenses,
    isLoaded,
    addExpense,
    addMultipleExpenses,
    updateExpense,
    deleteExpense,
    clearAllExpenses,
  };
}
