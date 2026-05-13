'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  FileText,
  Network,
  Plus,
  Loader2,
  Cloud,
  CloudCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { loadAllResources, Resource } from '@/app/(frontend)/workspace/actions'
import { createNote } from '@/app/(frontend)/mindnote/actions'
import { createMindmap } from '@/app/(frontend)/mindmap/actions'
import { useRouter } from 'next/navigation'

interface ResourceSidebarProps {
  activeTitle?: string
  onTitleChange?: (title: string) => void
  isSaving?: boolean
}

const STORAGE_KEY = 'resource-sidebar-collapsed'

const ResourceSidebar = ({ activeTitle, onTitleChange, isSaving }: ResourceSidebarProps) => {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isPendingNote, startNoteTransition] = useTransition()
  const [isPendingMap, startMapTransition] = useTransition()
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState('')

  const currentId = params?.id as string | undefined

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setIsCollapsed(true)
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  useEffect(() => {
    const fetchResources = async () => {
      if (resources.length === 0) setIsLoading(true)
      const { data } = await loadAllResources()
      setResources(data)
      setIsLoading(false)
    }
    fetchResources()
  }, [])

  useEffect(() => {
    if (activeTitle && currentId) {
      setResources(prev => prev.map(r => 
        r.id === currentId ? { ...r, title: activeTitle } : r
      ))
    }
  }, [activeTitle, currentId])

  const isActive = (resource: Resource) => currentId === resource.id

  const handleCreateNote = () => {
    startNoteTransition(async () => {
      await createNote()
    })
  }

  const handleCreateMap = () => {
    startMapTransition(async () => {
      const { data } = await createMindmap()
      if (data) router.push(`/mindmap/${data.id}`)
    })
  }

  const handleStartEditing = (resource: Resource) => {
    setEditingId(resource.id)
    setTempTitle(resource.title)
  }

  const handleFinishEditing = async (resource: Resource) => {
    if (!editingId) return
    const newTitle = tempTitle.trim() || 'Untitled'
    
    if (resource.id === currentId) {
      onTitleChange?.(newTitle)
    } else {
      setResources(prev => prev.map(r => r.id === resource.id ? { ...r, title: newTitle } : r))
    }
    setEditingId(null)
  }

  return (
    <aside
      className={`
        sticky top-0 h-[calc(100vh-56px)] shrink-0 border-l border-[#e5e5e5]
        bg-white flex flex-col transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}
    >
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-3 pt-4">
          <button
            onClick={handleCreateNote}
            disabled={isPendingNote}
            className="p-2 text-gray-400 hover:text-[#242424] hover:bg-gray-50 rounded-md transition-colors"
          >
            {isPendingNote ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
          </button>
          <button
            onClick={handleCreateMap}
            disabled={isPendingMap}
            className="p-2 text-gray-400 hover:text-[#242424] hover:bg-gray-50 rounded-md transition-colors"
          >
            {isPendingMap ? <Loader2 className="w-5 h-5 animate-spin" /> : <Network className="w-5 h-5" />}
          </button>
        </div>
      ) : (
        <>
          <div className="px-6 py-4 border-b border-[#e5e5e5] flex gap-3">
            <button
              onClick={handleCreateNote}
              disabled={isPendingNote}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-[#242424] hover:bg-[#242424] hover:text-white rounded-lg text-xs font-bold transition-all border border-[#e5e5e5]"
            >
              {isPendingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              NOTE
            </button>
            <button
              onClick={handleCreateMap}
              disabled={isPendingMap}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-[#242424] hover:bg-[#242424] hover:text-white rounded-lg text-xs font-bold transition-all border border-[#e5e5e5]"
            >
              {isPendingMap ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              CANVAS
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 no-scrollbar">
            {isLoading ? (
              <div className="flex flex-col gap-1.5 px-3 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-200/50 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs px-4">
                Chưa có ghi chú hay canvas nào
              </div>
            ) : (
              resources.map((resource) => {
                const href = resource.type === 'note' ? `/mindnote/${resource.id}` : `/mindmap/${resource.id}`
                const active = isActive(resource)
                const Icon = resource.type === 'note' ? FileText : Network
                const isEditing = editingId === resource.id

                return (
                  <div
                    key={`${resource.type}-${resource.id}`}
                    onDoubleClick={() => handleStartEditing(resource)}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors group relative cursor-pointer ${
                      active ? 'bg-gray-50/50 text-[#242424]' : 'text-gray-400 hover:text-[#242424] hover:bg-gray-50/30'
                    }`}
                  >
                    <Link href={href} className="absolute inset-0 z-0" />
                    <Icon strokeWidth={1.5} className={`w-5 h-5 shrink-0 z-10 ${active ? 'text-[#242424]' : 'text-gray-400 group-hover:text-[#242424]'}`} />
                    {isEditing ? (
                      <input
                        autoFocus
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={() => handleFinishEditing(resource)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing(resource)}
                        className="text-sm font-bold bg-white border border-primary/20 rounded px-1 -ml-1 flex-1 z-20 outline-none ring-2 ring-primary/10"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className={`text-sm font-medium line-clamp-1 flex-1 z-10 transition-all ${active ? 'font-bold' : ''}`}>
                        {resource.title}
                      </span>
                    )}
                    {active && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#242424] rounded-l-full z-10 shadow-[0_0_8px_rgba(0,0,0,0.1)]" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      <div className="p-4 border-t border-[#e5e5e5] mt-auto">
        <button 
          onClick={toggleCollapse}
          className="flex items-center gap-4 px-2 py-2 text-gray-400 hover:text-[#242424] transition-colors w-full cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronLeft strokeWidth={1.5} className="w-5 h-5 mx-auto" />
          ) : (
            <>
              <span className="text-xs font-medium uppercase tracking-widest flex-1 text-right">Collapse</span>
              <ChevronRight strokeWidth={1.5} className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

export default ResourceSidebar
