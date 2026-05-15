'use client'

import { Menu, FolderClosed } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MobileHeaderProps {
  onMenuClick: () => void
  onResourceClick?: () => void
  title?: string
}

export default function MobileHeader({ onMenuClick, onResourceClick, title = 'Mindlabs' }: MobileHeaderProps) {
  const pathname = usePathname()
  const isWorkspace = pathname?.startsWith('/mindspace')

  return (
    <header className="lg:hidden fixed top-0 left-0 z-[60] w-full pt-4 pb-4 flex justify-center pointer-events-none">
      <div className="w-[90%] max-w-md flex items-center justify-between h-14 px-4 glass backdrop-blur-2xl bg-white/70 rounded-[24px] shadow-premium border border-white/20 relative pointer-events-auto overflow-hidden">
        {/* Atmospheric Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <button 
          onClick={(e) => {
            e.preventDefault()
            onMenuClick()
          }}
          className="p-3 -ml-2 text-foreground hover:bg-black/5 rounded-xl active:scale-95 transition-all flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm">
             <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className="text-[13px] font-black uppercase tracking-widest text-foreground">
            {title}
          </span>
        </Link>

        {isWorkspace ? (
          <button 
            onClick={(e) => {
              e.preventDefault()
              onResourceClick?.()
            }}
            className="p-3 -mr-2 text-primary bg-primary/5 hover:bg-primary/10 rounded-xl active:scale-95 transition-all flex items-center justify-center"
            aria-label="Open resources"
          >
            <FolderClosed className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  )
}
