import Link from 'next/link'
import { Search, Bell } from 'lucide-react'
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
    <header className="sticky top-0 z-50 w-full border-b border-border-main bg-white">
      <div className="flex h-14 w-full items-center justify-between px-6">
        <div className="flex items-center gap-8 flex-1">
          <Link href="/" className="text-lg font-black tracking-tighter text-foreground flex items-center gap-1 group">
            Mindlabs<span className="w-1 h-1 rounded-full bg-primary" />
          </Link>
          
          <div className="hidden md:flex items-center bg-white rounded-main px-3 py-1.5 w-64 border border-border-main focus-within:border-primary/40 transition-all">
            <Search strokeWidth={1.5} className="w-4 h-4 text-secondary mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder-secondary/50 w-full font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <button className="p-1.5 text-secondary hover:text-foreground transition-colors">
                <Bell strokeWidth={1.5} className="w-5 h-5" />
              </button>
              <UserMenu user={user} profile={profile} />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-secondary hover:text-foreground transition-colors">
                Log in
              </Link>
              <Link href="/register" className="bg-primary text-primary-foreground px-4 py-1.5 rounded-main text-sm font-bold hover:opacity-90 transition-all active:scale-95">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
