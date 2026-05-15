'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Settings Actions ---

export async function loadFocusSettings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('focus_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code === 'PGRST116') {
    // No settings found, create default
    const { data: newData, error: createError } = await supabase
      .from('focus_settings')
      .insert([{ user_id: user.id }])
      .select()
      .single()
    
    if (createError) return { error: createError.message }
    return { data: newData }
  }

  if (error) return { error: error.message }
  return { data }
}

export async function updateFocusSettings(updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('focus_settings')
    .update(updates)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/pomodoro')
  return { success: true }
}

// --- Tasks Actions ---

export async function loadFocusTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('focus_tasks')
    .select('*')
    .order('is_completed', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data }
}

export async function createFocusTask(title: string, estimated_pomodoros: number, notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('focus_tasks')
    .insert([{ 
      user_id: user.id,
      title,
      estimated_pomodoros,
      notes
    }])
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/pomodoro')
  return { data }
}

export async function updateFocusTask(id: string, updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('focus_tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/pomodoro')
  return { success: true }
}

export async function deleteFocusTask(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('focus_tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/pomodoro')
  return { success: true }
}

// --- Sessions Actions ---

export async function logFocusSession(taskId: string | null, sessionType: 'pomodoro' | 'short_break' | 'long_break', durationMinutes: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('focus_sessions')
    .insert([{
      user_id: user.id,
      task_id: taskId,
      session_type: sessionType,
      duration_minutes: durationMinutes,
      is_completed: true,
      completed_at: new Date().toISOString()
    }])

  if (error) return { error: error.message }

  // If it's a pomodoro and linked to a task, increment the completed_pomodoros
  if (sessionType === 'pomodoro' && taskId) {
    const { data: task } = await supabase
      .from('focus_tasks')
      .select('completed_pomodoros')
      .eq('id', taskId)
      .single()

    if (task) {
      await supabase
        .from('focus_tasks')
        .update({ completed_pomodoros: task.completed_pomodoros + 1 })
        .eq('id', taskId)
    }
  }

  revalidatePath('/pomodoro')
  return { success: true }
}
