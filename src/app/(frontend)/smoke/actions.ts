'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSmokeState() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('smoke_state')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { error: 'Failed to fetch state' }
  }

  return { data }
}

export async function initSmokeSessionWithSurvey(formData: {
  cigarettesPerDay: number
  yearsSmoked: number
  startDate?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('smoke_state')
    .upsert({
      user_id: user.id,
      start_time: formData.startDate ?? new Date().toISOString(),
      cravings_defeated: 0,
      cigarettes_per_day: formData.cigarettesPerDay,
      years_smoked: formData.yearsSmoked,
    })
    .select()
    .single()

  if (error) {
    console.error('Error initializing smoke session:', error)
    return { error: 'Failed to initialize session' }
  }

  revalidatePath('/smoke')
  return { data }
}

export async function incrementCravingDefeated() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: currentState, error: fetchError } = await supabase
    .from('smoke_state')
    .select('cravings_defeated')
    .eq('user_id', user.id)
    .single()

  if (fetchError) return { error: 'Failed to fetch current state' }

  const newCount = (currentState?.cravings_defeated || 0) + 1

  const { data, error } = await supabase
    .from('smoke_state')
    .update({ cravings_defeated: newCount })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: 'Failed to update craving count' }

  revalidatePath('/smoke')
  return { data }
}

export async function resetSmokeSession(confirmText: string) {
  if (confirmText !== 'TÔI CHẤP NHẬN BẮT ĐẦU LẠI') {
    return { error: 'Confirmation text does not match' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('smoke_state')
    .update({
      start_time: new Date().toISOString(),
      cravings_defeated: 0,
      last_check_in_at: null,
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: 'Failed to reset session' }

  revalidatePath('/smoke')
  return { data }
}

export async function dailyCheckIn() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Server-side validation: must be after 7 PM (19:00) GMT+7
  const now = new Date()
  const gmt7Hour = new Date(now.getTime() + (7 * 60 * 60 * 1000)).getUTCHours()
  
  if (gmt7Hour < 19) {
    return { error: `Cổng xác nhận chỉ mở sau 19:00 hàng ngày (Giờ hiện tại của bạn: ${gmt7Hour}:00).` }
  }

  const { data, error } = await supabase
    .from('smoke_state')
    .update({ last_check_in_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: 'Failed to check in' }

  revalidatePath('/smoke')
  return { data }
}
