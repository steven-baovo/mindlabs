import Link from 'next/link'
import { Search, Bell, SquarePen, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#f2f2f2] bg-white/95 backdrop-blur-sm">
      <div className="flex h-14 w-full items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="text-2xl font-serif font-black tracking-tighter text-[#242424] mr-4">
            Mindlabs
          </Link>
          
          <div className="hidden md:flex items-center bg-[#f9f9f9] rounded-full px-3 py-1.5 w-64 border border-transparent focus-within:border-gray-200 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/studio" className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-[#242424] text-sm transition-colors">
                <SquarePen className="w-5 h-5" />
                <span>Write</span>
              </Link>
              
              <button className="text-gray-500 hover:text-[#242424] transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 border border-gray-200 text-[#242424] rounded-full flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                  {user.email?.[0]}
                </div>
                <form action={logout}>
                  <button type="submit" className="p-1 text-gray-400 hover:text-red-500 transition-all" title="Sign out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-gray-500 hover:text-[#242424] transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="bg-[#242424] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black transition-all">
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
