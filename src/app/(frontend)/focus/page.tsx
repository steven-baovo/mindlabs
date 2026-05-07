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
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Title and subtitle outside the card */}
        <div className="mb-10 ml-2">
          <h1 className="text-3xl font-bold text-[#1a2b49] tracking-tight">Focus Protocol</h1>
          <p className="text-sm text-gray-400 mt-2">Kéo khối vào ngày. Chỉ vậy thôi.</p>
        </div>

        {/* White card container only for the main feature area */}
        <div className="bg-white border border-gray-300 rounded-xl overflow-hidden p-6 md:p-10">
          <FocusBoard initialBlocks={blocks ?? []} />
        </div>
      </div>
    </div>


  )
}
