import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Category } from '@/lib/types'

const VALID_CATEGORIES: Category[] = [
  'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other',
]

// ── PATCH /api/expenses/[id] ──────────────────────────────────
// Updates an expense — ownership verified before update
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  // RLS ensures the user can only update their own rows, but we verify explicitly too
  const { data, error } = await supabase
    .from('expenses')
    .update({
      amount,
      category: category as string,
      description: description.trim(),
      date,
    })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// ── DELETE /api/expenses/[id] ─────────────────────────────────
// Deletes an expense — ownership verified before delete
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error, count } = await supabase
    .from('expenses')
    .delete({ count: 'exact' })
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (count === 0) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}
