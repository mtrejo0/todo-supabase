'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type TodoState = {
  id: string
  user_id: string
  name: string
  order_index: number
  is_default: boolean
  created_at: string
}

async function ensureDefaultStates(userId: string) {
  const supabase = await createClient()
  
  // Check if user has any states
  const { data: existingStates } = await supabase
    .from('todo_states')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  // If no states exist, create the defaults
  if (!existingStates || existingStates.length === 0) {
    // Try using the database function first
    try {
      const { error: functionError } = await supabase
        .rpc('ensure_user_has_default_states', { target_user_id: userId })
      
      if (!functionError) {
        return // Success via function
      }
    } catch (e) {
      console.error('Error calling ensure_user_has_default_states:', e)
    }

    // Fallback to direct insert
    const { error } = await supabase.from('todo_states').insert([
      { user_id: userId, name: 'Not Started', order_index: 0, is_default: true },
      { user_id: userId, name: 'In Progress', order_index: 1, is_default: true },
      { user_id: userId, name: 'Done', order_index: 2, is_default: true },
    ])

    if (error) {
      console.error('Failed to create default states:', error)
      throw new Error('Failed to initialize default states')
    }
  }
}

export async function getStates() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Ensure default states exist
  await ensureDefaultStates(user.id)

  const { data, error } = await supabase
    .from('todo_states')
    .select('*')
    .eq('user_id', user.id)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data as TodoState[]
}

export async function createState(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: maxOrder } = await supabase
    .from('todo_states')
    .select('order_index')
    .eq('user_id', user.id)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const orderIndex = (maxOrder?.order_index ?? -1) + 1

  const { error } = await supabase
    .from('todo_states')
    .insert([{
      user_id: user.id,
      name,
      order_index: orderIndex,
      is_default: false,
    }])

  if (error) throw error

  revalidatePath('/todos')
  return { success: true }
}

export async function updateState(id: string, name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('todo_states')
    .update({ name })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/todos')
  return { success: true }
}

export async function deleteState(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('todo_states')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/todos')
  return { success: true }
}
