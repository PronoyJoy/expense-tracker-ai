# Backend Integration Plan — AI Expense Tracker

**Project:** aidrivenexpensetracker  
**Supabase Project ID:** mphzxajxtavqnyedafpf  
**Region:** ap-northeast-1  
**Stack:** Next.js 14 · TypeScript · Supabase (Postgres + Auth) · Tailwind CSS  
**Started:** 2026-04-03  

---

## Overview

The app currently runs fully client-side with localStorage as its data store. This plan migrates it to a real backend using Supabase — giving us a persistent database, user authentication, and secure server-side API routes. Every part is designed to be non-breaking: the UI and types stay the same, only the data layer changes.

---

## Architecture

```
Browser (Next.js Client Components)
        │
        ▼
Next.js API Routes  (/app/api/*)        ← server-side, keys never exposed
        │
        ▼
Supabase Client (server)
        │
        ├── PostgreSQL Database         ← expenses, profiles tables
        └── Supabase Auth              ← JWT-based user sessions
```

**Security principle:** The `SUPABASE_SERVICE_ROLE_KEY` only lives in API routes (server-side). The browser only ever uses the `ANON_KEY` with RLS policies enforced at the database level.

---

## Parts

---

### PART 1 — Environment & Package Setup
**Status:** ✅ Done — 2026-04-03

**What we do:**
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Create `.env.local` with project URL and anon key
- Add `.env.local` to `.gitignore` (security — never commit secrets)
- Create a `.env.example` file with placeholder values for documentation

**Files created/modified:**
- `.env.local` — secret keys (gitignored)
- `.env.example` — template for other developers
- `package.json` — new dependencies added

**Environment variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://mphzxajxtavqnyedafpf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>   # server-side only, never NEXT_PUBLIC_
```

**Security notes:**
- `NEXT_PUBLIC_*` variables are exposed to the browser — only safe with RLS enforced
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — must never be prefixed with `NEXT_PUBLIC_`
- `.env.local` must be in `.gitignore` before the first commit

---

### PART 2 — Supabase Client Setup
**Status:** ✅ Done — 2026-04-03

**What we do:**
- Create two Supabase client helpers:
  - `lib/supabase/client.ts` — browser client (uses anon key, for client components)
  - `lib/supabase/server.ts` — server client (uses service role key, for API routes)
- Both clients are typed using the generated database types

**Files created:**
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/types.ts` — auto-generated Supabase database types

**Design principle:** Single source of truth for the Supabase client — no inline `createClient()` calls scattered across components.

---

### PART 3 — Database Schema
**Status:** ✅ Done — 2026-04-03

**What we do:**
- Create the `profiles` table — stores user display info (linked to Supabase Auth `auth.users`)
- Create the `expenses` table — stores all expense records per user
- Apply Row Level Security (RLS) policies — users can only read/write their own data
- Add indexes for common query patterns (user_id, date, category)

**Tables:**

#### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, references auth.users(id) |
| email | text | User's email |
| full_name | text | Optional display name |
| created_at | timestamptz | Auto-set to now() |
| updated_at | timestamptz | Auto-updated |

#### `expenses`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, gen_random_uuid() |
| user_id | uuid | Foreign key → profiles(id), NOT NULL |
| amount | numeric(10,2) | NOT NULL, must be > 0 |
| category | text | Enum-validated via CHECK constraint |
| description | text | NOT NULL, max 100 chars enforced in app |
| date | date | NOT NULL (YYYY-MM-DD) |
| created_at | timestamptz | Auto-set to now() |

**RLS Policies on `expenses`:**
- `SELECT`: `auth.uid() = user_id`
- `INSERT`: `auth.uid() = user_id`
- `UPDATE`: `auth.uid() = user_id`
- `DELETE`: `auth.uid() = user_id`

**Security notes:**
- RLS is the last line of defense — even if the client is compromised, data is isolated per user
- `amount` uses `numeric(10,2)` not `float` to avoid floating-point precision bugs with money
- Category is validated at both DB level (CHECK constraint) and app level (TypeScript type)

---

### PART 4 — Authentication
**Status:** ✅ Done — 2026-04-03

**What we do:**
- Create login and signup pages under `app/auth/`
- Create a middleware (`middleware.ts`) to protect dashboard routes
- Auto-create a profile row when a new user signs up (via Supabase Auth trigger)
- Handle session persistence with `@supabase/ssr` cookie-based sessions
- Add a sign-out button to the Sidebar

**Files created/modified:**
- `app/auth/login/page.tsx` — Login page (matches FlowCash design)
- `app/auth/signup/page.tsx` — Signup page (matches FlowCash design)
- `middleware.ts` — Redirects unauthenticated users to /auth/login
- `components/flowcash/Sidebar.tsx` — Add sign-out button + user display

**Auth flow:**
```
User visits /
  → middleware.ts checks session
  → No session → redirect to /auth/login
  → Has session → allow through to dashboard

User signs up
  → Supabase creates auth.users row
  → DB trigger creates profiles row
  → Redirect to dashboard
```

**Design principle:** Auth pages use the same FlowCash color palette and card style as the dashboard — consistent visual identity.

---

### PART 5 — API Routes (Server-Side CRUD)
**Status:** ✅ Done — 2026-04-03

**What we do:**
- Create Next.js Route Handlers under `app/api/expenses/`
- All DB operations happen server-side — service role key never touches the browser
- Routes validate input, enforce ownership, and return typed responses
- Proper HTTP status codes and error messages

**Routes:**

| Method | Path | Action |
|--------|------|--------|
| GET | `/api/expenses` | Fetch all expenses for logged-in user |
| POST | `/api/expenses` | Create a new expense |
| PATCH | `/api/expenses/[id]` | Update an expense by ID |
| DELETE | `/api/expenses/[id]` | Delete an expense by ID |

**Files created:**
- `app/api/expenses/route.ts` — GET + POST
- `app/api/expenses/[id]/route.ts` — PATCH + DELETE

**Security notes:**
- Every route verifies the session via `supabase.auth.getUser()` before any DB call
- Ownership is verified on UPDATE and DELETE — prevents users from touching other users' data
- Input is validated before hitting the database
- No raw SQL — uses Supabase query builder to prevent injection

---

### PART 6 — Replace localStorage with Supabase
**Status:** ✅ Done — 2026-04-03

**What we do:**
- Update `hooks/useExpenses.ts` to call the API routes instead of localStorage
- Keep the same hook interface — components don't need to change
- Add proper loading, error, and optimistic update states
- Keep `lib/storage.ts` as a fallback only for unauthenticated/offline state (optional)

**Files modified:**
- `hooks/useExpenses.ts` — replaces localStorage calls with `fetch()` to API routes
- `lib/storage.ts` — kept but no longer the primary store

**State changes in the hook:**
```typescript
// Before
const [expenses, setExpenses] = useState<Expense[]>([])
// load from localStorage on mount

// After
const [expenses, setExpenses] = useState<Expense[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
// fetch from /api/expenses on mount
// CRUD operations call their respective API routes
```

**Design principle:** Optimistic updates — UI updates immediately, then syncs with server. If server fails, state rolls back with an error toast. Same UX feel as before.

---

### PART 7 — TypeScript Types & Code Quality
**Status:** ✅ Done — 2026-04-03

**What we do:**
- Generate Supabase TypeScript types from the live database schema
- Extend `lib/types.ts` to align with DB types where needed
- Ensure all API responses are typed end-to-end

**Files modified:**
- `lib/supabase/types.ts` — auto-generated, never hand-edited
- `lib/types.ts` — minimal additions (e.g. `user_id` on Expense type)

---

### PART 8 — UI: Auth Pages & Loading States
**Status:** ✅ Done — 2026-04-03

**What we do:**
- Build login + signup forms matching the FlowCash design system
- Add loading spinners to components that fetch data
- Add empty/error states for failed fetches
- Show user email in the Sidebar
- Toast notifications for auth events (login success, logout, errors)

**Files created/modified:**
- `app/auth/login/page.tsx`
- `app/auth/signup/page.tsx`
- `components/flowcash/Sidebar.tsx` — user info + sign-out
- `components/flowcash/HeroStats.tsx` — loading skeleton
- `components/flowcash/RecentTransactions.tsx` — loading skeleton
- `components/flowcash/FlowCashDashboard.tsx` — wrap with auth check

---

## Standards & Principles

### Security
- Service role key is server-side only — never in client bundles
- RLS enforced at database level — all queries are user-scoped
- Input validated at API route level before touching DB
- Sessions managed via secure HTTP-only cookies (`@supabase/ssr`)
- No raw SQL — parameterized queries via Supabase client
- `.env.local` gitignored from the first commit

### Code Quality
- TypeScript strict mode — no `any` types
- All Supabase responses are error-checked before use
- Consistent error handling: API routes return `{ error: string }` on failure
- Hook interface unchanged — components are unaware of the storage layer

### Design Principles
- Auth pages match FlowCash color palette (`fc-*` tokens)
- Loading states use skeletons, not spinners where possible — avoids layout shift
- Optimistic updates keep the UI feeling instant
- Mobile-first — auth forms are fully responsive

### File Organization
```
lib/
  supabase/
    client.ts      ← browser Supabase client
    server.ts      ← server Supabase client
    types.ts       ← auto-generated DB types
  types.ts         ← app-level TypeScript types (unchanged interface)
  storage.ts       ← localStorage (kept, deprecated as primary store)

app/
  api/
    expenses/
      route.ts         ← GET, POST
      [id]/route.ts    ← PATCH, DELETE
  auth/
    login/page.tsx
    signup/page.tsx

middleware.ts          ← route protection
```

---

## Progress Tracker

| Part | Description | Status |
|------|-------------|--------|
| 1 | Environment & Package Setup | ✅ Done |
| 2 | Supabase Client Setup | ✅ Done |
| 3 | Database Schema | ✅ Done |
| 4 | Authentication | ✅ Done |
| 5 | API Routes | ✅ Done |
| 6 | Replace localStorage with Supabase | ✅ Done |
| 7 | TypeScript Types & Code Quality | ✅ Done |
| 8 | UI: Auth Pages & Loading States | ✅ Done |

---

## Notes

- All parts are designed to be done in order — each builds on the previous
- The existing UI components will **not** be redesigned — only wired to real data
- Existing localStorage data will be lost on migration (acceptable for a dev project)
- This backend.md will be updated after each part is completed with what was done
