export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO timestamp
}

export type ExpenseFormData = Omit<Expense, 'id' | 'createdAt'>;

export interface ExpenseFilters {
  startDate: string;
  endDate: string;
  category: Category | '';
  search: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  label: string; // "Jan 2024"
  total: number;
}
