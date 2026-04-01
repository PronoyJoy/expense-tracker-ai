'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Expense, ExpenseFormData } from '@/lib/types';
import { loadExpenses, saveExpenses } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadExpenses();
    setExpenses(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveExpenses(expenses);
    }
  }, [expenses, isLoaded]);

  const addExpense = useCallback((data: ExpenseFormData): Expense => {
    const expense: Expense = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const addMultipleExpenses = useCallback((dataList: ExpenseFormData[]): void => {
    const newExpenses: Expense[] = dataList.map((data) => ({
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }));
    setExpenses((prev) => [...newExpenses, ...prev]);
  }, []);

  const updateExpense = useCallback((id: string, data: ExpenseFormData): void => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  }, []);

  const deleteExpense = useCallback((id: string): void => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAllExpenses = useCallback((): void => {
    setExpenses([]);
  }, []);

  const sortedExpenses = useMemo(
    () =>
      [...expenses].sort(
        (a, b) =>
          b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
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
