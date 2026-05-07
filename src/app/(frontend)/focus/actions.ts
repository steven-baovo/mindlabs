'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type BlockType =
  | 'morning_routine'
  | 'deep_work'
  | 'light_work'
  | 'break'
  | 'exercise'
  | 'wind_down'

export interface FocusBlock {
  id: string
  user_id: string
  day_of_week: number
  start_minutes: number
  duration_minutes: number
  block_type: BlockType
  custom_label: string | null
  created_at: string
}

export async function loadBlocks(): Promise<{ data: FocusBlock[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('focus_blocks')
    .select('*')
    .eq('user_id', user.id)
    .order('day_of_week')
    .order('start_minutes')

  if (error) return { data: null, error: error.message }
  return { data: data as FocusBlock[], error: null }
}

export async function saveBlock(block: {
  day_of_week: number
  start_minutes: number
  duration_minutes: number
  block_type: BlockType
  custom_label?: string
}): Promise<{ data: FocusBlock | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('focus_blocks')
    .insert({ ...block, user_id: user.id })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/focus')
  return { data: data as FocusBlock, error: null }
}

export async function updateBlock(
  id: string,
  updates: Partial<Pick<FocusBlock, 'day_of_week' | 'start_minutes' | 'duration_minutes' | 'custom_label'>>
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('focus_blocks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/focus')
  return { error: error?.message ?? null }
}

export async function deleteBlock(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('focus_blocks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/focus')
  return { error: error?.message ?? null }
}

export async function duplicateDay(
  fromDay: number,
  toDay: number
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get all blocks from source day
  const { data: sourceBlocks, error: fetchError } = await supabase
    .from('focus_blocks')
    .select('day_of_week, start_minutes, duration_minutes, block_type, custom_label')
    .eq('user_id', user.id)
    .eq('day_of_week', fromDay)

  if (fetchError) return { error: fetchError.message }
  if (!sourceBlocks || sourceBlocks.length === 0) return { error: 'No blocks to duplicate' }

  // Delete existing blocks in target day
  await supabase.from('focus_blocks').delete().eq('user_id', user.id).eq('day_of_week', toDay)

  // Insert cloned blocks into target day
  const newBlocks = sourceBlocks.map(b => ({ ...b, day_of_week: toDay, user_id: user.id }))
  const { error: insertError } = await supabase.from('focus_blocks').insert(newBlocks)

  revalidatePath('/focus')
  return { error: insertError?.message ?? null }
}
