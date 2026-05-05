import Link from 'next/link'
import { Menu, LogOut, User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black tracking-tighter text-[#1a2b49] flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a2b49] rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
            MINDLABS
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 bg-[#1a2b49] text-white rounded-md flex items-center justify-center text-[10px] font-bold uppercase">
                  {user.email?.[0]}
                </div>
                <span className="text-xs font-bold text-[#1a2b49]">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <form action={logout}>
                <button type="submit" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Đăng xuất">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="hidden md:inline-flex items-center justify-center rounded-xl bg-[#1a2b49] px-6 py-2 text-xs font-bold text-white shadow-lg hover:bg-blue-900 transition-all">
              Đăng nhập
            </Link>
          )}
          
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
