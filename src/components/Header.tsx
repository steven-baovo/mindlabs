import Link from 'next/link'
import { Menu, LogOut, User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-blue-900">
            MINDLABS
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog Phát Triển</Link>
            <Link href="/21days" className="hover:text-blue-600 transition-colors text-orange-500">21 Ngày Thói Quen</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <span className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                {user.email?.split('@')[0]}
              </span>
              <form action={logout}>
                <button type="submit" className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all">
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="hidden md:inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all">
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
