'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Network,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState('')
  const params = useParams()
  const router = useRouter()

  const currentId = params?.id as string | undefined

  useEffect(() => {
    // Starts expanded by default
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

  const handleCreateNote = async () => {
    await createNote()
  }

  const handleCreateMap = async () => {
    const { data } = await createMindmap()
    if (data) router.push(`/mindmap/${data.id}`)
  }

  const handleStartEditing = (resource: Resource) => {
    if (isCollapsed) return
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
        h-full shrink-0 bg-white rounded-2xl shadow-sm border border-white/50
        flex flex-col transition-all duration-300 relative overflow-hidden
        ${isCollapsed ? 'w-[52px]' : 'w-[220px]'}
      `}
    >
      {!isCollapsed && isSaving && (
        <div className="absolute top-2 right-2 z-10">
          <span className="text-[10px] text-primary animate-pulse font-medium bg-white/80 backdrop-blur px-2 py-1 rounded-full border border-border-main shadow-sm">Saving...</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-2 flex flex-col gap-1">
        {!isCollapsed && (
          <div className="flex gap-2 mb-4 px-1">
            <button onClick={handleCreateNote} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-border-main rounded-main text-[11px] font-bold hover:border-foreground transition-all shadow-sm">
              <Plus strokeWidth={2} className="w-3.5 h-3.5" /> Note
            </button>
            <button onClick={handleCreateMap} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-border-main rounded-main text-[11px] font-bold hover:border-foreground transition-all shadow-sm">
              <Plus strokeWidth={2} className="w-3.5 h-3.5" /> Map
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="px-2 space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-9 bg-gray-100 rounded-main animate-pulse" />)}
          </div>
        ) : (
          resources.map((resource) => {
            const active = isActive(resource)
            const Icon = resource.type === 'note' ? FileText : Network
            const isEditing = editingId === resource.id

            return (
              <div
                key={resource.id}
                onDoubleClick={() => handleStartEditing(resource)}
                className={`flex items-center transition-all group relative rounded-xl py-2 cursor-pointer
                  ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}
                  ${active ? 'bg-active-bg text-foreground font-bold border border-border-main shadow-sm' : 'text-secondary hover:bg-hover-bg hover:text-foreground'}
                `}
              >
                <Link href={resource.type === 'note' ? `/mindnote/${resource.id}` : `/mindmap/${resource.id}`} className="absolute inset-0" />
                <Icon strokeWidth={active ? 2 : 1.5} className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-secondary/70 group-hover:text-foreground'}`} />
                
                {!isCollapsed && (
                  <>
                    {isEditing ? (
                      <input
                        autoFocus
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={() => handleFinishEditing(resource)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing(resource)}
                        className="text-[13px] bg-white border border-border-main rounded px-1.5 py-0.5 flex-1 z-10 outline-none ring-1 ring-primary/20"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-[13px] truncate flex-1">{resource.title}</span>
                    )}
                  </>
                )}

                {active && (
                  <div className={`absolute top-1/2 -translate-y-1/2 w-[2px] h-4 bg-primary rounded-full ${isCollapsed ? 'left-1' : 'left-[-1px]'}`} />
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="p-4 border-t border-border-main">
        <button
          onClick={toggleCollapse}
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

export default ResourceSidebar
