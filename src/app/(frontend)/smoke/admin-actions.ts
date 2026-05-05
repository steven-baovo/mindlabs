'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Admin Actions - Purely for development and testing
// Should be guarded by admin email in production

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // You can add your specific email here for production safety
  // if (user?.email !== 'your-admin-email@gmail.com') throw new Error('Unauthorized')
  
  return user
}

export async function adminSetProgressDays(days: number) {
  const user = await verifyAdmin()
  if (!user) return { error: 'Not authenticated' }

  const supabase = await createClient()
  
  // Calculate start_time to be exactly "days" ago
  const newStartTime = new Date()
  newStartTime.setDate(newStartTime.getDate() - days)
  // Ensure it's slightly more than the day count to trigger the milestone
  newStartTime.setMinutes(newStartTime.getMinutes() - 5)

  const { data, error } = await supabase
    .from('smoke_state')
    .update({ start_time: newStartTime.toISOString() })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/smoke')
  return { data }
}

export async function adminResetCheckIn() {
  const user = await verifyAdmin()
  if (!user) return { error: 'Not authenticated' }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('smoke_state')
    .update({ last_check_in_at: null })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/smoke')
  return { data }
}

export async function adminForceStartInFuture(hours: number) {
  const user = await verifyAdmin()
  if (!user) return { error: 'Not authenticated' }

  const supabase = await createClient()
  
  const futureDate = new Date()
  futureDate.setHours(futureDate.getHours() + hours)

  const { data, error } = await supabase
    .from('smoke_state')
    .update({ start_time: futureDate.toISOString() })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/smoke')
  return { data }
}
