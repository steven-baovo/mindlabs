import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSmokeState } from './actions'
import SmokeDashboard from '@/components/smoke/SmokeDashboard'

export const metadata = {
  title: 'Mindlabs | The Logic Protocol - Smoke',
  description: 'Hệ thống phòng thủ tâm lý hỗ trợ bỏ thuốc lá.',
}

export default async function SmokePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/smoke')
  }

  const { data: smokeState, error } = await getSmokeState()

  // If error other than "Not found", we handle it gracefully.
  // Actually getSmokeState handles "Not found" by returning { data: null }
  
  return (
    <div className="w-full bg-[#fdfaf6] min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="font-lora text-4xl md:text-5xl font-bold text-[#1a2b49] mb-4">
            Neurological Defense System
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Đây không phải là một ứng dụng đếm ngày. Đây là một cỗ máy hỗ trợ bạn đối đầu với những xung đột thần kinh khi cắt đứt Nicotine.
          </p>
        </header>

        <SmokeDashboard initialState={smokeState || null} />
      </div>
    </div>
  )
}
