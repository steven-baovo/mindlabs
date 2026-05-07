import { loadBlocks } from './actions'
import FocusBoard from '@/components/focus/FocusBoard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Focus Protocol — Mindlabs',
  description: 'Thời khóa biểu tuần tối giản. Quy hoạch thời gian, không phải quản lý việc vặt.',
}

export default async function FocusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: blocks } = await loadBlocks()

  return (
    <div className="min-h-screen bg-[#fdfaf6]">
      <div className="px-4 pt-8 pb-4 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a2b49] tracking-tight">Focus Protocol</h1>
          <p className="text-sm text-gray-400 mt-1">Kéo khối vào ngày. Chỉ vậy thôi.</p>
        </div>
        <FocusBoard initialBlocks={blocks ?? []} />
      </div>
    </div>
  )
}
