'use client'

import { 
  X, 
  Home, 
  Search, 
  Info, 
  MessageSquare, 
  History, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck,
  Calendar,
  FileText,
  Sparkles,
  Timer,
  Settings,
  Bell
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import UserMenu from './UserMenu'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  user: any
  profile: any
}

const MENU_ITEMS = [
  { title: 'Home', icon: Home, href: '/' },
  { title: 'Search', icon: Search, href: '#' },
  { title: 'Clarity Planner', icon: Calendar, href: '/clarity' },
  { title: 'MindSpace', icon: FileText, href: '/mindspace' },
  { title: 'MindAI', icon: Sparkles, href: '/mindai' },
  { title: 'MindFocus', icon: Timer, href: '/pomodoro' },
]

const EXPLORE_ITEMS = [
  { title: 'About Us', icon: Info, href: '/about' },
  { title: 'Contact', icon: MessageSquare, href: '/contact' },
  { title: 'Changelog', icon: History, href: '/changelog' },
  { title: 'FAQ', icon: HelpCircle, href: '/faq' },
  { title: 'Help Center', icon: BookOpen, href: '/docs' },
  { title: 'Legal', icon: ShieldCheck, href: '/legal' },
]

export default function MobileSidebar({ isOpen, onClose, user, profile }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] lg:hidden"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[160] lg:hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-black/5">
              <Link href="/" onClick={onClose} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                   <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
                </div>
                <span className="text-lg font-black tracking-tighter text-foreground">
                  Mindlabs
                </span>
              </Link>
              <button 
                onClick={onClose}
                className="p-2 bg-gray-50 rounded-full text-secondary hover:text-foreground active:scale-90 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-8 no-scrollbar">
              {/* Primary Menu */}
              <div className="flex flex-col gap-1">
                <span className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 mb-2">Điều hướng</span>
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-primary/5 text-primary font-bold' : 'text-secondary hover:bg-gray-50'}`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-secondary/60'}`} />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Explore Menu */}
              <div className="flex flex-col gap-1">
                <span className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 mb-2">Khám phá</span>
                {EXPLORE_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-primary/5 text-primary font-bold' : 'text-secondary hover:bg-gray-50'}`}
                    >
                      <Icon className="w-5 h-5 text-secondary/60" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Footer / User Profile */}
            <div className="p-6 border-t border-black/5 bg-gray-50/50">
              {user ? (
                <div className="flex items-center gap-4">
                  <UserMenu user={user} profile={profile} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-foreground truncate">{profile?.display_name || 'User'}</span>
                    <span className="text-xs text-secondary/60 truncate">{user?.email}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={onClose} className="px-4 py-3 rounded-2xl bg-gray-100 text-center text-sm font-black uppercase tracking-widest text-foreground">Login</Link>
                  <Link href="/register" onClick={onClose} className="px-4 py-3 rounded-2xl bg-primary text-white text-center text-sm font-black uppercase tracking-widest shadow-lg">Join</Link>
                </div>
              )}
              
              <div className="flex items-center justify-around mt-6 pt-6 border-t border-black/5">
                <button className="flex flex-col items-center gap-1 group">
                   <div className="p-2 rounded-xl group-hover:bg-gray-100 transition-colors">
                      <Bell className="w-5 h-5 text-secondary/60" />
                   </div>
                   <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Thông báo</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                   <div className="p-2 rounded-xl group-hover:bg-gray-100 transition-colors">
                      <Settings className="w-5 h-5 text-secondary/60" />
                   </div>
                   <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Cài đặt</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
