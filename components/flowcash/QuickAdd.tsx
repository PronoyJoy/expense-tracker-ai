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
    <div className="bg-black rounded-3xl p-6 flex flex-col relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/[0.03] rounded-full blur-2xl pointer-events-none" />

      <div className="relative">
        <h2 className="text-[17px] font-bold text-white">Quick Add</h2>
        <p className="text-xs text-white/40 mt-0.5">Log an expense instantly</p>
      </div>

      <form onSubmit={handleSubmit} className="relative mt-5 flex flex-col gap-3">

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-white/50 mb-1.5 block">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Morning coffee"
            className="w-full bg-white/[0.07] border border-white/[0.10] text-white placeholder-white/25 rounded-2xl px-4 py-3 text-sm
              focus:outline-none focus:border-white/40 focus:bg-white/[0.10] transition-all duration-200"
          />
        </div>

        {/* Amount + Date row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/[0.07] border border-white/[0.10] text-white placeholder-white/25 rounded-2xl px-4 py-3 text-sm
                focus:outline-none focus:border-white/40 focus:bg-white/[0.10] transition-all duration-200"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/[0.07] border border-white/[0.10] text-white rounded-2xl px-4 py-3 text-sm
                focus:outline-none focus:border-white/40 focus:bg-white/[0.10] transition-all duration-200
                [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Category pills */}
        <div>
          <label className="text-xs font-medium text-white/50 mb-2 block">Category</label>
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
                      ? 'bg-white text-black scale-105'
                      : 'bg-white/[0.07] text-white/60 border border-white/[0.10] hover:bg-white/[0.12] hover:text-white'
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
          className={`mt-1 w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2
            transition-all duration-300 active:scale-95
            ${submitted
              ? 'bg-emerald-400 text-black'
              : 'bg-white text-black hover:bg-white/90'
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
