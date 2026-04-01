'use client';

import { useState } from 'react';
import { ExpenseFormData, Category } from '@/lib/types';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/constants';

interface ExpenseFormProps {
  initialData?: ExpenseFormData;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: ExpenseFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [amountStr, setAmountStr] = useState(
    initialData?.amount ? initialData.amount.toString() : ''
  );
  const [formData, setFormData] = useState<Omit<ExpenseFormData, 'amount'>>({
    category: initialData?.category ?? 'Food',
    description: initialData?.description ?? '',
    date: initialData?.date ?? today,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<string, string>> = {};
    const amount = parseFloat(amountStr);

    if (!amountStr || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Enter a valid amount greater than $0.00';
    } else if (amount > 999999.99) {
      newErrors.amount = 'Amount cannot exceed $999,999.99';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length > 100) {
      newErrors.description = 'Must be 100 characters or less';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      amount: parseFloat(parseFloat(amountStr).toFixed(2)),
      description: formData.description.trim(),
    });
  }

  const selectedConfig = CATEGORY_CONFIG[formData.category];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Amount <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm select-none">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="999999.99"
            value={amountStr}
            onChange={(e) => {
              setAmountStr(e.target.value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            placeholder="0.00"
            className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.amount
                ? 'border-red-300 bg-red-50 focus:ring-red-400'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            autoFocus
          />
        </div>
        {errors.amount && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <span>⚠</span> {errors.amount}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Category <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const isSelected = formData.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat as Category })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all ${
                  isSelected
                    ? `${cfg.bgColor} ${cfg.textColor} border-transparent font-medium ring-2 ring-offset-1`
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{cfg.icon}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Description <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          placeholder="What did you spend on?"
          maxLength={100}
          className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
            errors.description
              ? 'border-red-300 bg-red-50 focus:ring-red-400'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-red-500 text-xs flex items-center gap-1">
              <span>⚠</span> {errors.description}
            </p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs ml-auto ${
              formData.description.length > 90 ? 'text-orange-400' : 'text-gray-300'
            }`}
          >
            {formData.description.length}/100
          </span>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Date <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={formData.date}
          max={today}
          onChange={(e) => {
            setFormData({ ...formData, date: e.target.value });
            if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
          }}
          className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
            errors.date
              ? 'border-red-300 bg-red-50 focus:ring-red-400'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        {errors.date && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <span>⚠</span> {errors.date}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
        >
          {isEditing ? 'Save Changes' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
