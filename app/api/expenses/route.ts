import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Category } from '@/lib/types'

const VALID_CATEGORIES: Category[] = [
  'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other',
]

// ── GET /api/expenses ─────────────────────────────────────────
// Returns all expenses for the authenticated user, sorted by date DESC
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// ── POST /api/expenses ────────────────────────────────────────
// Creates a new expense for the authenticated user
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { amount, category, description, date } = body as Record<string, unknown>

  // Validate inputs
  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
  }
  if (!VALID_CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }
  if (typeof description !== 'string' || description.trim().length < 1 || description.trim().length > 100) {
    return NextResponse.json({ error: 'description must be 1–100 characters' }, { status: 400 })
  }
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      amount,
      category: category as string,
      description: description.trim(),
      date,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
