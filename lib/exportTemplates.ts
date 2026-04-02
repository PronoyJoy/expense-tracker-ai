import { Expense } from './types';
import { CATEGORY_CONFIG } from './constants';

export interface ExportTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  badge?: 'Popular' | 'New' | 'Pro';
  accentColor: string;
  bgColor: string;
  borderColor: string;
  defaultFormat: 'csv' | 'json';
}

export const TEMPLATES: ExportTemplate[] = [
  {
    id: 'tax-report',
    name: 'Tax Report',
    tagline: 'For your accountant',
    description: 'Chronological record of all deductible expenses, grouped by year with category subtotals.',
    icon: '🧾',
    badge: 'Popular',
    accentColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    defaultFormat: 'csv',
  },
  {
    id: 'monthly-summary',
    name: 'Monthly Summary',
    tagline: 'Month-by-month breakdown',
    description: 'Spending totals per category for each month, ideal for budget reviews.',
    icon: '📅',
    badge: 'Popular',
    accentColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    defaultFormat: 'csv',
  },
  {
    id: 'category-analysis',
    name: 'Category Analysis',
    tagline: 'Spending patterns',
    description: 'Each expense annotated with its % share of total spend and category rank.',
    icon: '📊',
    accentColor: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    defaultFormat: 'csv',
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker',
    tagline: 'Running totals',
    description: 'Expenses sorted by date with cumulative running total column — great for spreadsheets.',
    icon: '💰',
    badge: 'New',
    accentColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    defaultFormat: 'csv',
  },
  {
    id: 'full-export',
    name: 'Full Export',
    tagline: 'Everything, raw',
    description: 'Complete data dump with all fields. Use for backups or importing into other tools.',
    icon: '🗂️',
    accentColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    defaultFormat: 'json',
  },
];

export interface TemplateOutput {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  recordCount: number;
}

export function applyTemplate(templateId: string, expenses: Expense[]): TemplateOutput {
  const today = new Date().toISOString().split('T')[0];

  switch (templateId) {
    case 'tax-report': {
      const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
      return {
        headers: ['Date', 'Category', 'Amount (USD)', 'Description', 'Tax Year'],
        rows: sorted.map((e) => [
          e.date,
          e.category,
          e.amount.toFixed(2),
          e.description,
          e.date.substring(0, 4),
        ]),
        filename: `tax-report-${today}`,
        recordCount: sorted.length,
      };
    }

    case 'monthly-summary': {
      const byMonthCat: Record<string, Record<string, number>> = {};
      for (const e of expenses) {
        const month = e.date.substring(0, 7);
        if (!byMonthCat[month]) byMonthCat[month] = {};
        byMonthCat[month][e.category] = (byMonthCat[month][e.category] ?? 0) + e.amount;
      }
      const rows: (string | number)[][] = [];
      for (const month of Object.keys(byMonthCat).sort()) {
        const cats = byMonthCat[month];
        const total = Object.values(cats).reduce((s, v) => s + v, 0);
        for (const [cat, amount] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
          rows.push([month, cat, amount.toFixed(2), ((amount / total) * 100).toFixed(1) + '%']);
        }
      }
      return {
        headers: ['Month', 'Category', 'Total (USD)', '% of Month'],
        rows,
        filename: `monthly-summary-${today}`,
        recordCount: rows.length,
      };
    }

    case 'category-analysis': {
      const total = expenses.reduce((s, e) => s + e.amount, 0);
      const sorted = [...expenses].sort((a, b) => b.amount - a.amount);
      let rank = 1;
      let lastAmt = -1;
      return {
        headers: ['Date', 'Category', 'Amount (USD)', '% of Total', 'Spend Rank', 'Description'],
        rows: sorted.map((e) => {
          if (e.amount !== lastAmt) { rank++; lastAmt = e.amount; }
          return [
            e.date,
            e.category,
            e.amount.toFixed(2),
            total > 0 ? ((e.amount / total) * 100).toFixed(2) + '%' : '0%',
            rank - 1,
            e.description,
          ];
        }),
        filename: `category-analysis-${today}`,
        recordCount: sorted.length,
      };
    }

    case 'budget-tracker': {
      const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
      let running = 0;
      return {
        headers: ['Date', 'Category', 'Amount (USD)', 'Running Total', 'Description'],
        rows: sorted.map((e) => {
          running += e.amount;
          return [e.date, e.category, e.amount.toFixed(2), running.toFixed(2), e.description];
        }),
        filename: `budget-tracker-${today}`,
        recordCount: sorted.length,
      };
    }

    default: {
      // full-export
      return {
        headers: ['ID', 'Date', 'Category', 'Amount', 'Description', 'Created At'],
        rows: expenses.map((e) => [
          e.id,
          e.date,
          e.category,
          e.amount.toFixed(2),
          e.description,
          e.createdAt,
        ]),
        filename: `full-export-${today}`,
        recordCount: expenses.length,
      };
    }
  }
}

export function outputToCSV(output: TemplateOutput): string {
  const BOM = '\uFEFF';
  const lines = [
    output.headers.join(','),
    ...output.rows.map((r) =>
      r.map((cell) => {
        const s = String(cell);
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      }).join(',')
    ),
  ];
  return BOM + lines.join('\r\n');
}

export function outputToJSON(output: TemplateOutput, templateName: string): string {
  const records = output.rows.map((row) => {
    const obj: Record<string, string | number> = {};
    output.headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  return JSON.stringify(
    { template: templateName, exportedAt: new Date().toISOString(), count: records.length, data: records },
    null,
    2
  );
}
