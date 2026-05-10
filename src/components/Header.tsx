import Link from 'next/link'
import { Search, Bell, SquarePen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import UserMenu from './UserMenu'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e5e5] bg-white/95 backdrop-blur-sm">
      <div className="flex h-14 w-full items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="text-2xl font-black tracking-tighter text-[#242424] mr-4">
            Mindlabs
          </Link>
          
          <div className="hidden md:flex items-center bg-[#f9f9f9] rounded-full px-3 py-1.5 w-64 border border-transparent focus-within:border-gray-200 transition-all">
            <Search strokeWidth={1.5} className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm" 
              className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <>


              <div className="flex items-center gap-4">
                <UserMenu user={user} profile={profile} />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-gray-500 hover:text-[#242424] transition-colors">
                Đăng nhập
              </Link>
              <Link href="/register" className="bg-[#242424] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black transition-all">
                Bắt đầu ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
