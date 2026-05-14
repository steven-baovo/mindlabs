'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Search,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  Calendar
} from 'lucide-react'
import UserMenu from './UserMenu'

interface SidebarProps {
  user: any
  profile: any
}

const PRIMARY_MENU = [
  { title: 'Home', icon: Home, href: '/' },
  { title: 'Search', icon: Search, href: '#' },
]

const TOOLS_MENU = [
  { title: 'Clarity Planner', icon: Calendar, href: '/clarity' },
  { title: 'Mindnote', icon: FileText, href: '/mindnote' },
  { title: 'mindAI', icon: Sparkles, href: '/mindai' },
]

export default function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname()
  
  // Initialize collapsed state based on route
  const isWorkspaceInitial = pathname ? (pathname.includes('/mindnote/') || pathname.includes('/mindmap/')) : false
  const [isCollapsed, setIsCollapsed] = useState(isWorkspaceInitial)

  // Automatically collapse on workspace routes when navigating
  useEffect(() => {
    if (!pathname) return
    const isWorkspaceRoute = pathname.includes('/mindnote/') || pathname.includes('/mindmap/')
    setIsCollapsed(isWorkspaceRoute)
  }, [pathname])

  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon
    const isActive = pathname === item.href

    return (
      <Link
        key={index}
        href={item.href || '#'}
        onClick={(e) => e.stopPropagation()}
        className={`
          flex items-center transition-all group relative rounded-xl py-2
          ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}
          ${isActive 
            ? 'bg-[#f5f5f5] text-foreground font-semibold' 
            : 'text-secondary hover:text-foreground hover:bg-[#f9f9f9]'}
          cursor-pointer
        `}
        title={item.title}
      >
        <Icon strokeWidth={isActive ? 2.5 : 1.5} className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-primary' : 'text-secondary/70 group-hover:text-foreground'}`} />
        
        {!isCollapsed && (
          <span className="text-[13px] tracking-tight truncate">
            {item.title}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside 
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={`
        hidden lg:flex flex-col bg-white rounded-2xl h-full transition-all duration-300 z-50 shadow-sm border border-white/50 relative cursor-col-resize
        ${isCollapsed ? 'w-[52px]' : 'w-[220px]'}
      `}
    >
      {/* Logo & Toggle Section */}
      <div 
        className={`h-16 flex items-center mb-2 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}
      >
        <Link 
          href="/" 
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 group overflow-hidden shrink-0"
        >
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0">
             <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-black tracking-tighter text-foreground whitespace-nowrap">
              Mindlabs
            </span>
          )}
        </Link>
        
        {!isCollapsed && (
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setIsCollapsed(true)
            }}
            className="p-1.5 text-secondary/30 hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div 
        className="flex-1 overflow-y-auto no-scrollbar px-2 flex flex-col gap-1 pt-4"
      >
        <div className="mb-6">
          {PRIMARY_MENU.map((item, index) => renderMenuItem(item, index))}
        </div>

        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <div className="px-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40">Tools</span>
            </div>
          )}
          {TOOLS_MENU.map((item, index) => renderMenuItem(item, index))}
        </div>
      </div>

      {/* Bottom Section */}
      <div 
        className="p-2 border-t border-[#f5f5f5] flex flex-col gap-1"
      >
        <button 
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center transition-all rounded-xl py-2 text-secondary hover:text-foreground hover:bg-[#f9f9f9] w-full cursor-pointer ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
        >
           <Bell className="w-[18px] h-[18px] shrink-0" />
           {!isCollapsed && <span className="text-[13px]">Notifications</span>}
        </button>
        
        <button 
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center transition-all rounded-xl py-2 text-secondary hover:text-foreground hover:bg-[#f9f9f9] w-full cursor-pointer ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
        >
           <Settings className="w-[18px] h-[18px] shrink-0" />
           {!isCollapsed && <span className="text-[13px]">Settings</span>}
        </button>

        <div className="mt-2 pt-2 border-t border-[#f5f5f5]">
           {user ? (
             <div 
               onClick={(e) => e.stopPropagation()}
               className={`flex items-center rounded-xl py-2 hover:bg-[#f9f9f9] transition-all ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-2'}`}
             >
               <UserMenu user={user} profile={profile} />
               {!isCollapsed && (
                 <div className="flex flex-col min-w-0">
                   <span className="text-[12px] font-bold truncate text-foreground leading-tight">
                     {profile?.display_name || 'User'}
                   </span>
                   <span className="text-[10px] text-secondary/60 truncate leading-tight">
                     {user?.email}
                   </span>
                 </div>
               )}
             </div>
           ) : (
             <div className={`flex flex-col gap-1 ${isCollapsed ? 'items-center' : 'px-1'}`}>
                <Link 
                  href="/login" 
                  onClick={(e) => e.stopPropagation()}
                  className={`flex items-center transition-all rounded-xl py-2 bg-primary text-white font-bold hover:opacity-90 ${isCollapsed ? 'justify-center w-8 h-8' : 'gap-3 px-3 w-full'}`}
                  title="Login"
                >
                  <div className={`w-5 h-5 flex items-center justify-center ${isCollapsed ? '' : 'shrink-0'}`}>
                    <span className="text-[10px]">IN</span>
                  </div>
                  {!isCollapsed && <span className="text-[13px]">Login</span>}
                </Link>
             </div>
           )}
        </div>
      </div>
    </aside>
  )
}
