'use client'

import { useState, useEffect, useTransition } from 'react'
import { FileText, Plus, Search, Clock, Loader2, Cloud, CloudCheck, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { loadNotes, createNote } from '@/app/(frontend)/mindspace/actions'

interface NoteSidebarProps {
  activeTitle?: string
  onTitleChange?: (title: string) => void
  isSaving?: boolean
}

const NoteSidebar = ({ activeTitle, onTitleChange, isSaving }: NoteSidebarProps) => {
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const params = useParams()
  const router = useRouter()
  const currentId = params?.id as string

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await loadNotes()
      if (!error && data) {
        setNotes(data)
      }
      setIsLoading(false)
    }
    fetchNotes()
  }, [])

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Vừa xong'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <aside className="w-64 bg-gray-50/30 h-full flex flex-col shrink-0">
      {/* Active Note Context */}
      {activeTitle !== undefined && (
        <div className="p-4 bg-white border-b border-border-medium/10">
          <div className="flex items-center justify-between mb-3">
             <Link 
              href="/mindspace"
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-secondary transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Quay lại</span>
            </Link>

            <div className="flex items-center gap-1.5 text-[10px] font-medium transition-all">
              {isSaving ? (
                <div className="flex items-center gap-1 text-primary animate-pulse">
                  <Cloud className="w-3 h-3" />
                  <span>Đang lưu</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-500">
                  <CloudCheck className="w-3 h-3" />
                  <span>Đã lưu</span>
                </div>
              )}
            </div>
          </div>

          <input
            type="text"
            value={activeTitle}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Tiêu đề..."
            className="w-full bg-transparent text-base font-bold focus:outline-none placeholder:text-gray-300 text-secondary"
          />
        </div>
      )}

      <div className="p-4 border-b border-border-medium/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider">Ghi chú của bạn</h2>
          <button 
            onClick={() => startTransition(async () => {
              const { data } = await createNote()
              if (data) {
                setNotes(prev => [data, ...prev])
                router.push(`/mindspace/note/${data.id}`)
              }
            })}
            disabled={isPending}
            className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50"
            title="Tạo ghi chú mới"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-border-medium/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            Không tìm thấy ghi chú
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Link
              key={note.id}
              href={`/mindspace/note/${note.id}`}
              className={`flex flex-col gap-1 p-3 rounded-xl transition-all group ${
                currentId === note.id 
                  ? 'bg-white shadow-sm border border-border-medium/50 ring-1 ring-primary/5' 
                  : 'hover:bg-white/60 text-gray-600'
              }`}
            >
              <div className="flex items-start gap-2">
                <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${currentId === note.id ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium line-clamp-1 ${currentId === note.id ? 'text-secondary' : ''}`}>
                  {note.title || 'Chưa có tiêu đề'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 ml-6 text-[10px] text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatRelativeTime(note.updated_at)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </aside>
  )
}

export default NoteSidebar
