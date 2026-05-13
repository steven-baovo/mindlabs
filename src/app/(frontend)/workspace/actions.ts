'use server'

import { createClient } from '@/lib/supabase/server'

export type ResourceType = 'note' | 'map'

export interface Resource {
  id: string
  title: string
  type: ResourceType
  updated_at: string
}

export async function loadAllResources(): Promise<{ data: Resource[]; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: 'Not authenticated' }

  const [notesResult, mapsResult] = await Promise.all([
    supabase
      .from('mind_notes')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false }),
    supabase
      .from('mindmaps')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
  ])

  const notes: Resource[] = (notesResult.data ?? []).map((n) => ({
    id: n.id,
    title: n.title || 'Chưa có tiêu đề',
    type: 'note',
    updated_at: n.updated_at,
  }))

  const maps: Resource[] = (mapsResult.data ?? []).map((m) => ({
    id: m.id,
    title: m.title || 'Untitled Canvas',
    type: 'map',
    updated_at: m.updated_at,
  }))

  const combined = [...notes, ...maps].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )

  return { data: combined, error: null }
}
