'use client';

import { Category } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/constants';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses}`}
    >
      <span role="img" aria-label={category}>
        {config.icon}
      </span>
      {category}
    </span>
  );
}
