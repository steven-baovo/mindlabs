import { loadBlocks } from './actions'
import FocusBoard from '@/components/clarity/FocusBoard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Clarity Planner — Mindlabs',
  description: 'Thời khóa biểu tuần tối giản. Quy hoạch thời gian, không phải quản lý việc vặt.',
}

export default async function FocusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: blocks } = await loadBlocks()

  return (
    <FocusBoard initialBlocks={blocks ?? []} />
  )
}
