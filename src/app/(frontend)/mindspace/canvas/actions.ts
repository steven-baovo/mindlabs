'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Mindmap {
  id: string
  user_id: string
  title: string
  nodes: any
  edges: any
  created_at: string
  updated_at: string
}

export async function loadMindmaps(): Promise<{ data: Mindmap[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('mindmaps')
    .select('id, title, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: data as Mindmap[], error: null }
}

export async function createMindmap(title: string = 'Untitled Canvas'): Promise<{ data: Mindmap | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('mindmaps')
    .insert({ title, user_id: user.id })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/mindspace')
  return { data: data as Mindmap, error: null }
}

export async function loadMindmap(id: string): Promise<{ data: Mindmap | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('mindmaps')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Mindmap, error: null }
}

export async function updateMindmap(
  id: string,
  updates: { nodes?: any; edges?: any; title?: string }
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('mindmaps')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  if (updates.title) {
    revalidatePath('/mindspace')
  }
  return { error: null }
}

export async function deleteMindmap(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('mindmaps')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/mindspace')
  return { error: null }
}
