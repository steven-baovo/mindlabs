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
  Network,
  FileText,
  Sparkles
} from 'lucide-react'

const MENU_ITEMS = [
  { 
    title: 'Home', 
    icon: Home, 
    href: '/',
  },
  { 
    title: 'Clarity Planner', 
    icon: Calendar, 
    href: '/clarity',
  },
  { 
    title: 'Canvas', 
    icon: Network, 
    href: '/mindmap',
  },
  { 
    title: 'Mindnote', 
    icon: FileText, 
    href: '/mindnote',
  },
  { 
    title: 'mindAI', 
    icon: Sparkles, 
    href: '/mindai',
  },
  { 
    title: 'Library', 
    icon: Bookmark, 
    href: '#',
    isComingSoon: true
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={`hidden lg:flex flex-col bg-white border-r border-[#e5e5e5] h-[calc(100vh-56px)] sticky top-14 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      <div className="flex-1 py-6 flex flex-col gap-2">
        {MENU_ITEMS.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={index}
              href={item.href || '#'}
              className={`flex items-center gap-4 px-6 py-3 transition-colors group relative cursor-pointer ${
                isActive 
                ? 'text-[#242424]' 
                : 'text-gray-400 hover:text-[#242424]'
              } ${item.isComingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={item.title}
            >
              <Icon strokeWidth={1.5} className={`w-6 h-6 shrink-0 ${isActive ? 'text-[#242424]' : 'text-gray-400 group-hover:text-[#242424]'}`} />
              
              {!isCollapsed && (
                <span className={`text-sm font-medium truncate ${isActive ? 'font-bold' : ''}`}>
                  {item.title}
                </span>
              )}
              
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#242424] rounded-r-full" />
              )}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-[#e5e5e5]">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-4 px-2 py-2 text-gray-400 hover:text-[#242424] transition-colors w-full cursor-pointer"
        >
          {isCollapsed ? <ChevronRight strokeWidth={1.5} className="w-5 h-5 mx-auto" /> : (
            <>
              <ChevronLeft strokeWidth={1.5} className="w-5 h-5" />
              <span className="text-xs font-medium uppercase tracking-widest">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
