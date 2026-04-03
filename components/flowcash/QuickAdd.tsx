'use client';

import { useState } from 'react';
import { ExpenseFormData, Category } from '@/lib/types';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/constants';
import { Plus, Check } from 'lucide-react';

interface QuickAddProps {
  onAdd: (data: ExpenseFormData) => void;
}

const TODAY = new Date().toISOString().split('T')[0];

export default function QuickAdd({ onAdd }: QuickAddProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(TODAY);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!description.trim() || isNaN(parsed) || parsed <= 0) return;

    onAdd({ description: description.trim(), amount: parsed, category, date });
    setDescription('');
    setAmount('');
    setDate(TODAY);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 1800);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col relative overflow-hidden">
      {/* Violet left accent bar */}
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-violet-500 rounded-full" />

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800">Add Expense</h2>
        <p className="text-xs text-slate-400 mt-0.5">Log instantly</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Morning coffee"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white
              placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400
              transition-all duration-200"
          />
        </div>

        {/* Amount + Date row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white
                placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400
                transition-all duration-200"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white
                focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400
                transition-all duration-200"
            />
          </div>
        </div>

        {/* Category pills */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                    ${isSelected
                      ? 'bg-violet-600 text-white scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  <span className="text-[11px]">{cfg.icon}</span>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`mt-1 w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2
            transition-all duration-300 active:scale-95
            ${submitted
              ? 'bg-emerald-500 text-white'
              : 'bg-violet-600 hover:bg-violet-700 text-white'
            }`}
        >
          {submitted ? (
            <>
              <Check className="w-4 h-4" />
              Added!
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Expense
            </>
          )}
        </button>
      </form>
    </div>
  );
}
