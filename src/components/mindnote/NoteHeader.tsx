'use client'

import { ChevronLeft, CloudCheck, Cloud } from 'lucide-react'
import Link from 'next/link'

interface NoteHeaderProps {
  title: string
  onTitleChange: (title: string) => void
  isSaving?: boolean
}

const NoteHeader = ({ title, onTitleChange, isSaving = false }: NoteHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-border-medium/50 py-4">
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Link 
            href="/mindnote"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-secondary"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Tiêu đề ghi chú..."
            className="bg-transparent text-2xl font-bold focus:outline-none placeholder:text-gray-300 w-full"
          />
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {isSaving ? (
            <>
              <Cloud className="w-4 h-4 animate-pulse" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <CloudCheck className="w-4 h-4 text-primary" />
              <span>Đã lưu</span>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default NoteHeader
