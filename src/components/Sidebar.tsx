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
  Calendar,
  MessageSquare,
  Info,
  History,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  LayoutGrid,
  ExternalLink,
  Timer,
  ListTodo
} from 'lucide-react'
import UserMenu from './UserMenu'
import { useFocus } from '@/contexts/FocusContext'

interface SidebarProps {
  user: any
  profile: any
}

const PRIMARY_MENU = [
  { title: 'Dashboard', icon: Home, href: '/' },
]

const EXPLORE_MENU = [
  { title: 'Journal', icon: BookOpen, href: '/journal', desc: 'Tạp chí tri thức' },
  { title: 'About Us', icon: Info, href: '/about', desc: 'Câu chuyện về Mindlabs' },
  { title: 'Contact', icon: MessageSquare, href: '/contact', desc: 'Liên hệ hỗ trợ' },
  { title: 'Changelog', icon: History, href: '/changelog', desc: 'Nhật ký cập nhật' },
  { title: 'FAQ', icon: HelpCircle, href: '/faq', desc: 'Câu hỏi thường gặp' },
  { title: 'Help Center', icon: BookOpen, href: '/docs', desc: 'Tài liệu hướng dẫn' },
  { title: 'Legal', icon: ShieldCheck, href: '/legal', desc: 'Điều khoản & Bảo mật' },
]

const TOOLS_MENU = [
  { title: 'Clarity Planner', icon: Calendar, href: '/clarity' },
  { title: 'MindSpace', icon: FileText, href: '/mindspace' },
  { title: 'mindAI', icon: Sparkles, href: '/mindai' },
  { title: 'MindFocus', icon: Timer, href: '/pomodoro' },
  { title: 'Todo List', icon: ListTodo, href: '/todo' },
  { title: 'Kanban Board', icon: LayoutGrid, href: '/kanban' },
]

export default function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname()
  const focus = useFocus()
  
  // Initialize collapsed state based on route
  const isWorkspaceInitial = pathname ? pathname.includes('/mindspace/') : false
  const [isCollapsed, setIsCollapsed] = useState(isWorkspaceInitial)
  const [prevPathname, setPrevPathname] = useState(pathname)

  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setIsCollapsed(pathname ? pathname.includes('/mindspace/') : false)
  }

  const [isExploreOpen, setIsExploreOpen] = useState(false)

  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon
    const isActive = pathname === item.href

    return (
      <Link
        key={index}
        href={item.href || '#'}
        onClick={(e) => e.stopPropagation()}
        className={`flex items-center transition-all group relative rounded-xl py-2 cursor-pointer
          ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}
          ${isActive 
            ? 'bg-[#f5f5f5] text-foreground font-medium' 
            : 'text-secondary hover:text-foreground hover:bg-[#f9f9f9]'}
        `}
        title={item.title}
      >
        <Icon strokeWidth={isActive ? 2.0 : 1.5} className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-primary' : 'text-secondary/70 group-hover:text-foreground'}`} />
        
        {!isCollapsed && (
          <span className="text-[13px] tracking-tight truncate">
            {item.title}
          </span>
        )}

        {/* Live Timer Indicator in Sidebar */}
        {item.title === 'MindFocus' && focus.isActive && (
          <>
            {isCollapsed ? (
              <span className="absolute top-0 right-0 flex h-2 w-2 z-20">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${focus.mode === 'pomodoro' ? 'bg-primary' : 'bg-green-500'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${focus.mode === 'pomodoro' ? 'bg-primary' : 'bg-green-500'}`}></span>
              </span>
            ) : (
              <div className={`ml-auto flex items-center gap-1.5 ${focus.mode === 'pomodoro' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'} px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest animate-pulse`}>
                <span>{focus.formatTime(focus.timeLeft)}</span>
              </div>
            )}
          </>
        )}
      </Link>
    )
  }

  return (
    <aside 
      onClick={(e) => {
        // Only toggle if clicking the aside background itself
        if (e.target === e.currentTarget) {
          setIsCollapsed(!isCollapsed)
        }
      }}
      className={`
        hidden lg:flex flex-col bg-white rounded-2xl h-full transition-all duration-300 z-50 relative
        ${isCollapsed ? 'w-[52px]' : 'w-[220px]'}
        ${isCollapsed ? 'cursor-ew-resize' : 'cursor-default'}
      `}
    >
      {/* Edge toggle hit area */}
      <div 
        onClick={(e) => {
          e.stopPropagation()
          setIsCollapsed(!isCollapsed)
        }}
        className={`
          absolute top-0 bottom-0 z-[60] cursor-ew-resize group/toggle
          ${isCollapsed ? '-right-[30px] w-[42px]' : '-right-[30px] w-[38px]'}
        `}
      />
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
          
          {/* Explore Item */}
          <div className="relative group/explore">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExploreOpen(!isExploreOpen)
              }}
              onMouseEnter={() => isCollapsed && setIsExploreOpen(true)}
              onMouseLeave={() => isCollapsed && setIsExploreOpen(false)}
              className={`flex items-center transition-all group relative rounded-xl py-2 cursor-pointer w-full text-left
                ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}
                ${isExploreOpen ? 'bg-[#f5f5f5] text-foreground font-medium' : 'text-secondary hover:text-foreground hover:bg-[#f9f9f9]'}
              `}
            >
              <LayoutGrid strokeWidth={isExploreOpen ? 2.0 : 1.5} className={`w-[18px] h-[18px] shrink-0 ${isExploreOpen ? 'text-primary' : 'text-secondary/70 group-hover:text-foreground'}`} />
              {!isCollapsed && <span className="text-[13px] tracking-tight truncate">Khám phá</span>}
              {!isCollapsed && (
                <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isExploreOpen ? 'rotate-90 text-primary' : 'text-secondary/30'}`} />
              )}
            </button>

            {/* Expanded Accordion List */}
            {!isCollapsed && isExploreOpen && (
              <div className="mt-1 ml-4 border-l border-border-main/50 pl-2 flex flex-col gap-0.5 animate-in slide-in-from-top-2 duration-200">
                {EXPLORE_MENU.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] transition-all
                      ${pathname === item.href ? 'text-primary font-bold bg-primary/5' : 'text-secondary/60 hover:text-foreground hover:bg-gray-50'}
                    `}
                  >
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Collapsed Flyout Panel */}
            {isCollapsed && isExploreOpen && (
              <div 
                onMouseEnter={() => setIsExploreOpen(true)}
                onMouseLeave={() => setIsExploreOpen(false)}
                className="absolute left-[56px] top-0 w-[240px] glass p-4 rounded-2xl border border-primary/10 -premium z-[100] animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <div className="flex flex-col gap-3">
                  <div className="px-2 pb-2 border-b border-border-main/50">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-secondary/40">Khám phá</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {EXPLORE_MENU.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={index}
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all group/item"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover/item:bg-primary group-hover/item:text-white transition-all">
                             <Icon className="w-4 h-4 text-secondary/40 group-hover/item:text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground leading-none mb-1">{item.title}</span>
                            <span className="text-[10px] text-secondary/40 leading-none truncate w-[140px]">{item.desc}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <div className="mx-3 my-4 border-t border-[#f5f5f5]" />
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
