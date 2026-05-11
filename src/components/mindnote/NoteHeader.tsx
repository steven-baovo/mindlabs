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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border-medium/20 h-12 flex items-center">
      <div className="w-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <Link 
            href="/mindnote"
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-secondary shrink-0"
            title="Quay lại"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          
          <div className="flex items-center gap-2 text-gray-400 text-xs shrink-0">
            <span>Mindnote</span>
            <span>/</span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Tiêu đề ghi chú..."
            className="bg-transparent text-sm font-medium focus:outline-none placeholder:text-gray-300 w-full truncate text-secondary"
          />
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-medium transition-all">
            {isSaving ? (
              <div className="flex items-center gap-1.5 text-primary animate-pulse">
                <Cloud className="w-3 h-3" />
                <span>Đang lưu</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CloudCheck className="w-3 h-3" />
                <span>Đã lưu</span>
              </div>
            )}
          </div>
          
          <div className="h-4 w-px bg-border-medium/30 mx-1" />
          
          {/* Action buttons could go here */}
        </div>
      </div>
    </header>
  )
}

export default NoteHeader
