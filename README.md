# Expense Tracker AI
- https://thriving-kringle-3541c1.netlify.app/
A modern expense tracking application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- Add, edit, and delete expenses
- Categorize expenses (Food, Transport, Shopping, Health, Entertainment, Other)
- Filter and search expenses
- Visual spending charts and summaries
- Local storage persistence
- Responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/              # Next.js app router
├── components/       # React components
│   ├── Dashboard.tsx
│   ├── ExpenseForm.tsx
│   ├── ExpenseList.tsx
│   ├── ExpenseModal.tsx
│   ├── FilterBar.tsx
│   ├── Navigation.tsx
│   ├── SpendingChart.tsx
│   ├── SummaryCards.tsx
│   └── CategoryBadge.tsx
├── hooks/            # Custom React hooks
│   └── useExpenses.ts
└── lib/              # Utilities and types
    ├── constants.ts
    ├── storage.ts
    ├── types.ts
    └── utils.ts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
