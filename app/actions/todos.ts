'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type Todo = {
  id: string
  user_id: string
  folder_id: string | null
  state_id: string
  title: string
  description: string | null
  scheduled_date: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export async function getTodos() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data as Todo[]
}

export async function createTodo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const folderId = formData.get('folderId') as string | null
  const stateId = formData.get('stateId') as string
  const scheduledDate = formData.get('scheduledDate') as string | null

  const { data: maxOrder } = await supabase
    .from('todos')
    .select('order_index')
    .eq('user_id', user.id)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const orderIndex = (maxOrder?.order_index ?? -1) + 1

  const { error } = await supabase
    .from('todos')
    .insert([{
      user_id: user.id,
      title,
      description: description || null,
      folder_id: folderId || null,
      state_id: stateId,
      scheduled_date: scheduledDate || null,
      order_index: orderIndex,
    }])

  if (error) throw error

  revalidatePath('/todos')
  return { success: true }
}

export async function updateTodo(id: string, updates: Partial<Todo>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/todos')
  return { success: true }
}

export async function deleteTodo(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/todos')
  return { success: true }
}

export async function reorderTodos(todoIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const updates = todoIds.map((id, index) => 
    supabase
      .from('todos')
      .update({ order_index: index })
      .eq('id', id)
      .eq('user_id', user.id)
  )

  await Promise.all(updates)

  revalidatePath('/todos')
  return { success: true }
}
