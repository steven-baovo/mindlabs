'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * SQL for Supabase SQL Editor:
 * 
 * CREATE TABLE mind_notes (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
 *   title TEXT DEFAULT 'Chưa có tiêu đề',
 *   content JSONB DEFAULT '{}',
 *   is_favorite BOOLEAN DEFAULT false,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Enable RLS
 * ALTER TABLE mind_notes ENABLE ROW LEVEL SECURITY;
 * 
 * -- Policies
 * CREATE POLICY "Users can manage their own notes" ON mind_notes
 *   FOR ALL USING (auth.uid() = user_id);
 */

export async function loadNotes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('mind_notes')
    .select('*')
    .order('updated_at', { ascending: false })

  return { data, error: error?.message }
}

export async function loadNote(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mind_notes')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error: error?.message }
}

export async function createNote(formData?: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('mind_notes')
    .insert([{ user_id: user.id }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/mindspace')
  return { data, error: null }
}

export async function updateNote(id: string, updates: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('mind_notes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  
  return { success: true }
}

export async function deleteNote(id: string, formData?: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('mind_notes')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/mindspace')
  return { success: true }
}
