'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/todos')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // Create profile for the user
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: authData.user.id, email: authData.user.email }])

    if (profileError) {
      // Profile might already exist or trigger failed - check if states exist
      const { data: existingStates } = await supabase
        .from('todo_states')
        .select('id')
        .eq('user_id', authData.user.id)
        .limit(1)

      // If no states exist, create them manually
      if (!existingStates || existingStates.length === 0) {
        await supabase.from('todo_states').insert([
          { user_id: authData.user.id, name: 'Not Started', order_index: 0, is_default: true },
          { user_id: authData.user.id, name: 'In Progress', order_index: 1, is_default: true },
          { user_id: authData.user.id, name: 'Done', order_index: 2, is_default: true },
        ])
      }
    }

    // Ensure states exist even if profile was created successfully
    const { data: states } = await supabase
      .from('todo_states')
      .select('id')
      .eq('user_id', authData.user.id)
      .limit(1)

    if (!states || states.length === 0) {
      await supabase.from('todo_states').insert([
        { user_id: authData.user.id, name: 'Not Started', order_index: 0, is_default: true },
        { user_id: authData.user.id, name: 'In Progress', order_index: 1, is_default: true },
        { user_id: authData.user.id, name: 'Done', order_index: 2, is_default: true },
      ])
    }
  }

  revalidatePath('/', 'layout')
  redirect('/todos')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
