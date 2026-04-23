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

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // Ensure profile exists for this user (fixes legacy users)
  if (authData.user) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single()

    // Create profile if it doesn't exist
    if (!existingProfile) {
      await supabase
        .from('profiles')
        .insert([{ id: authData.user.id, email: authData.user.email }])
    }

    // Ensure default states exist
    const { data: existingStates } = await supabase
      .from('todo_states')
      .select('id')
      .eq('user_id', authData.user.id)
      .limit(1)

    if (!existingStates || existingStates.length === 0) {
      try {
        await supabase.rpc('ensure_user_has_default_states', { target_user_id: authData.user.id })
      } catch (e) {
        // Fallback to direct insert
        await supabase.from('todo_states').insert([
          { user_id: authData.user.id, name: 'Not Started', order_index: 0, is_default: true },
          { user_id: authData.user.id, name: 'In Progress', order_index: 1, is_default: true },
          { user_id: authData.user.id, name: 'Done', order_index: 2, is_default: true },
        ])
      }
    }
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
      console.error('Profile creation error:', profileError)
    }

    // Use database function to ensure states exist (triple fallback approach)
    // This will work even if the trigger failed
    try {
      const { data: functionResult, error: functionError } = await supabase
        .rpc('ensure_user_has_default_states', { target_user_id: authData.user.id })
      
      if (functionError) {
        console.error('Function call error:', functionError)
        // Final fallback: direct insert
        const { data: existingStates } = await supabase
          .from('todo_states')
          .select('id')
          .eq('user_id', authData.user.id)
          .limit(1)

        if (!existingStates || existingStates.length === 0) {
          await supabase.from('todo_states').insert([
            { user_id: authData.user.id, name: 'Not Started', order_index: 0, is_default: true },
            { user_id: authData.user.id, name: 'In Progress', order_index: 1, is_default: true },
            { user_id: authData.user.id, name: 'Done', order_index: 2, is_default: true },
          ])
        }
      }
    } catch (e) {
      console.error('Unexpected error ensuring states:', e)
    }

    // Final verification
    const { data: finalCheck } = await supabase
      .from('todo_states')
      .select('id')
      .eq('user_id', authData.user.id)
      .limit(1)

    if (!finalCheck || finalCheck.length === 0) {
      console.error('CRITICAL: User still has no states after all fallbacks!')
      return { error: 'Failed to initialize user account. Please contact support.' }
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
