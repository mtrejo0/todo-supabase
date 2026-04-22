'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type Folder = {
  id: string
  user_id: string
  name: string
  order_index: number
  created_at: string
}

export async function getFolders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data as Folder[]
}

export async function createFolder(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: maxOrder } = await supabase
    .from('folders')
    .select('order_index')
    .eq('user_id', user.id)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const orderIndex = (maxOrder?.order_index ?? -1) + 1

  const { error } = await supabase
    .from('folders')
    .insert([{
      user_id: user.id,
      name,
      order_index: orderIndex,
    }])

  if (error) throw error

  revalidatePath('/todos')
  return { success: true }
}

export async function updateFolder(id: string, name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('folders')
    .update({ name })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/todos')
  return { success: true }
}

export async function deleteFolder(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/todos')
  return { success: true }
}
