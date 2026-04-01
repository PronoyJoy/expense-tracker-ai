import { Expense, MonthlySummary, Category } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function getTotalByCategory(expenses: Expense[]): Record<Category, number> {
  const result = {} as Record<Category, number>;
  for (const expense of expenses) {
    result[expense.category] = (result[expense.category] || 0) + expense.amount;
  }
  return result;
}

export function getMonthlyTrend(expenses: Expense[], monthsBack = 6): MonthlySummary[] {
  const months: MonthlySummary[] = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.toISOString().substring(0, 7);
    const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const total = expenses
      .filter((e) => e.date.startsWith(month))
      .reduce((sum, e) => sum + e.amount, 0);
    months.push({ month, label, total });
  }

  return months;
}

export function getTopCategory(
  expenses: Expense[]
): { category: Category; amount: number } | null {
  const byCategory = getTotalByCategory(expenses);
  const entries = Object.entries(byCategory) as [Category, number][];
  if (entries.length === 0) return null;
  const [category, amount] = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max));
  return { category, amount };
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateSampleData(): Array<Omit<Expense, 'id' | 'createdAt'>> {
  const today = new Date();
  const d = (daysAgo: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  return [
    { date: d(0), category: 'Food', description: 'Grocery shopping at Whole Foods', amount: 87.5 },
    { date: d(1), category: 'Transportation', description: 'Monthly transit pass', amount: 95.0 },
    { date: d(2), category: 'Food', description: 'Lunch with colleagues', amount: 24.75 },
    { date: d(3), category: 'Entertainment', description: 'Netflix subscription', amount: 15.99 },
    { date: d(4), category: 'Shopping', description: 'New running shoes', amount: 129.99 },
    { date: d(5), category: 'Bills', description: 'Electricity bill', amount: 112.3 },
    { date: d(7), category: 'Food', description: 'Coffee & pastries', amount: 18.5 },
    { date: d(8), category: 'Entertainment', description: 'Movie tickets (2x)', amount: 32.0 },
    { date: d(10), category: 'Shopping', description: 'Amazon order — books', amount: 45.99 },
    { date: d(12), category: 'Food', description: 'Dinner at Italian restaurant', amount: 68.0 },
    { date: d(14), category: 'Bills', description: 'Internet bill', amount: 79.99 },
    { date: d(15), category: 'Transportation', description: 'Uber rides this week', amount: 42.5 },
    { date: d(18), category: 'Food', description: 'Weekly groceries', amount: 93.2 },
    { date: d(20), category: 'Entertainment', description: 'Spotify premium', amount: 9.99 },
    { date: d(22), category: 'Shopping', description: 'Home office supplies', amount: 156.4 },
    { date: d(25), category: 'Food', description: 'Weekend brunch', amount: 41.0 },
    { date: d(30), category: 'Bills', description: 'Phone bill', amount: 65.0 },
    { date: d(32), category: 'Transportation', description: 'Gas fill-up', amount: 55.8 },
    { date: d(35), category: 'Other', description: 'Gym membership', amount: 49.99 },
    { date: d(38), category: 'Food', description: 'Meal prep ingredients', amount: 76.3 },
  ];
}
