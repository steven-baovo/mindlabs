'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Calendar,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles
} from 'lucide-react'

const MENU_ITEMS = [
  { title: 'Home', icon: Home, href: '/' },
  { title: 'Clarity Planner', icon: Calendar, href: '/clarity' },
  { title: 'Mindnote', icon: FileText, href: '/mindnote' },
  { title: 'mindAI', icon: Sparkles, href: '/mindai' },
  { title: 'Library', icon: Bookmark, href: '#', isComingSoon: true }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={`
      hidden lg:flex flex-col bg-white border-r border-border-main h-[calc(100vh-56px)] sticky top-14 transition-all duration-300
      ${isCollapsed ? 'w-16' : 'w-60'}
    `}>
      <div className="flex-1 py-6 flex flex-col gap-0.5 px-2">
        {MENU_ITEMS.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={index}
              href={item.href || '#'}
              className={`
                flex items-center gap-3 px-3 py-2 transition-all group relative rounded-main
                ${isActive 
                  ? 'bg-active-bg text-foreground font-bold border border-border-main shadow-sm' 
                  : 'text-secondary hover:text-foreground hover:bg-hover-bg'}
                ${item.isComingSoon ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={item.title}
            >
              <Icon strokeWidth={isActive ? 2 : 1.5} className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-primary' : 'text-secondary/70 group-hover:text-foreground'}`} />
              
              {!isCollapsed && (
                <span className="text-[13px] tracking-tight truncate">
                  {item.title}
                </span>
              )}
              
              {isActive && (
                <div className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-[2px] h-4 bg-primary rounded-r-full" />
              )}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-border-main">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center p-1.5 text-secondary hover:text-foreground hover:bg-hover-bg rounded-main transition-colors w-full cursor-pointer"
        >
          {isCollapsed ? <ChevronRight strokeWidth={1.5} className="w-4 h-4" /> : (
            <div className="flex items-center gap-2">
              <ChevronLeft strokeWidth={1.5} className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
