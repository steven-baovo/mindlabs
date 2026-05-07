'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Wind, 
  Calendar, 
  BookOpen, 
  Zap, 
  Brain, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Minus
} from 'lucide-react'

const MENU_ITEMS = [
  { 
    title: 'Tổng quan', 
    icon: Home, 
    href: '/',
    color: 'text-blue-500'
  },
  { 
    title: 'GIAO THỨC (PROTOCOLS)', 
    isLabel: true 
  },
  { 
    title: '21 Ngày Thói Quen', 
    icon: Calendar, 
    href: '/21days',
    color: 'text-purple-500',
    description: 'Hình thành kỷ luật mới'
  },
  { 
    title: 'Focus Protocol', 
    icon: Brain, 
    href: '/focus', 
    color: 'text-green-500',
    description: 'Thời khóa biểu tuần tối giản'
  },
  { 
    title: 'KHÁM PHÁ', 
    isLabel: true 
  },
  { 
    title: 'Blog Phát Triển', 
    icon: BookOpen, 
    href: '/blog',
    color: 'text-indigo-500'
  },
  { 
    title: 'Kho Lưu Trữ', 
    icon: ShieldCheck, 
    href: '#',
    color: 'text-gray-500',
    isComingSoon: true
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={`hidden lg:flex flex-col bg-[#fdfaf6] border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20 px-2' : 'w-72 p-4'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 right-[-12px] z-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors hidden lg:flex"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={`space-y-1 ${isCollapsed ? 'mt-8' : ''}`}>
        {MENU_ITEMS.map((item, index) => {
          if (item.isLabel) {
            return isCollapsed ? (
              <div key={index} className="flex justify-center py-4">
                <Minus className="w-4 h-4 text-gray-300" />
              </div>
            ) : (
              <h3 key={index} className="px-3 pt-6 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {item.title}
              </h3>
            )
          }

          const Icon = item.icon!
          const isActive = pathname === item.href

          return (
            <Link
              key={index}
              href={item.href || '#'}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all group relative ${
                isActive 
                ? 'bg-white shadow-sm ring-1 ring-gray-200' 
                : 'hover:bg-white/50'
              } ${item.isComingSoon ? 'opacity-50 cursor-not-allowed' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.title : undefined}
            >
              <div className={`p-2 rounded-lg bg-white shadow-sm ${isActive ? 'ring-1 ring-gray-100' : ''}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold truncate ${isActive ? 'text-[#1a2b49]' : 'text-gray-600'}`}>
                      {item.title}
                    </span>
                    {isActive && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />}
                  </div>
                  {item.description && (
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                  )}
                  {item.isComingSoon && (
                    <span className="inline-block mt-1 text-[8px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">Sắp có</span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>


    </aside>
  )
}
