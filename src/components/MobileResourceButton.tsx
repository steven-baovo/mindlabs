'use client'

import { FolderClosed } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface MobileResourceButtonProps {
  onClick: () => void
}

export default function MobileResourceButton({ onClick }: MobileResourceButtonProps) {
  const pathname = usePathname()
  const isWorkspace = pathname?.startsWith('/mindspace')

  if (!isWorkspace) return null

  return (
    <button 
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      className="lg:hidden fixed top-4 right-4 z-[60] w-12 h-12 glass backdrop-blur-2xl bg-white/70 rounded-[20px] -premium border border-white/20 flex items-center justify-center text-primary active:scale-95 transition-all"
      aria-label="Open resources"
    >
      <FolderClosed className="w-5 h-5" />
    </button>
  )
}
