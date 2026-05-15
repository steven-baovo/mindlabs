import React, { useState, useEffect, memo } from 'react'
import {
  FileText,
  Network,
  Plus,
  ChevronRight,
  GripVertical,
  MoreHorizontal,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { loadAllResources, Resource, updateSidebarOrder } from '@/app/(frontend)/workspace/actions'
import { createNote, deleteNote } from '@/app/(frontend)/mindspace/actions'
import { createMindmap, deleteMindmap } from '@/app/(frontend)/mindspace/canvas/actions'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface ResourceItemProps {
  resource: Resource
  index: number
  isCollapsed: boolean
  active: boolean
  isEditing: boolean
  editingId: string | null
  tempTitle: string
  setTempTitle: (title: string) => void
  handleStartEditing: (resource: Resource) => void
  handleFinishEditing: (resource: Resource) => void
  handleDelete: (resource: Resource) => void
}

const ResourceItem = memo(({ 
  resource, 
  index, 
  isCollapsed, 
  active, 
  isEditing, 
  tempTitle, 
  setTempTitle, 
  handleStartEditing, 
  handleFinishEditing,
  handleDelete
}: ResourceItemProps) => {
  const Icon = resource.type === 'note' ? FileText : Network
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close menu on click outside
  useEffect(() => {
    if (!isMenuOpen) return
    const close = () => setIsMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [isMenuOpen])

  return (
    <Draggable key={resource.id} draggableId={resource.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={() => handleStartEditing(resource)}
          className={`flex items-center group relative rounded-xl py-2
            ${isCollapsed ? 'justify-center px-0' : 'gap-2 px-2'}
            ${active 
              ? 'bg-[#f5f5f5] text-foreground font-medium' 
              : 'text-secondary hover:bg-[#f9f9f9] hover:text-foreground'}
            ${snapshot.isDragging ? 'shadow-premium bg-white border border-border-main/50 z-50 scale-[1.02]' : ''}
            transition-[background-color,color] duration-200
          `}
        >
          <Link 
            href={resource.type === 'note' ? `/mindspace/note/${resource.id}` : `/mindspace/canvas/${resource.id}`} 
            className="absolute inset-0"
            onClick={(e) => {
              if (snapshot.isDragging) e.preventDefault()
            }}
          />
          
          {!isCollapsed && (
            <div
              {...provided.dragHandleProps}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-grab active:cursor-grabbing text-secondary/40 hover:text-secondary z-10"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}

          <Icon strokeWidth={active ? 2.0 : 1.5} className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? 'text-primary' : 'text-secondary/70 group-hover:text-foreground'}`} />
          
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
                <span className="text-[13px] tracking-tight truncate flex-1">{resource.title}</span>
              )}
            </>
          )}

          {active && (
            <div className={`absolute top-1/2 -translate-y-1/2 w-[2px] h-4 bg-primary rounded-full ${isCollapsed ? 'left-1' : 'left-[-1px]'}`} />
          )}

          {!isCollapsed && (
            <div className="relative flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-1 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMenuOpen(!isMenuOpen)
                }}
                className={`p-1 transition-all rounded-lg border border-transparent ${isMenuOpen ? 'bg-white shadow-sm border-border-main text-primary scale-110' : 'text-secondary/30 hover:text-foreground hover:bg-gray-100'}`}
                title="Thêm thao tác"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-36 bg-white border border-border-main shadow-premium rounded-2xl p-1.5 z-[100] animate-in fade-in zoom-in slide-in-from-top-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1.5 mb-1 border-b border-border-main/50">
                    <span className="text-[9px] uppercase tracking-widest font-black text-secondary/30">Thao tác</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(resource)
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all group/del"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center group-hover/del:bg-red-500 group-hover/del:text-white transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Xóa tệp</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
})

ResourceItem.displayName = 'ResourceItem'

interface ResourceSidebarProps {
  activeTitle?: string
  onTitleChange?: (title: string) => void
  isSaving?: boolean
  isMobile?: boolean
}

const STORAGE_KEY = 'resource-sidebar-collapsed'

const ResourceSidebar = ({ activeTitle, onTitleChange, isSaving, isMobile }: ResourceSidebarProps) => {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState('')
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'note' | 'map'>('note')
  const [deletingId, setDeletingId] = useState<string | null>(null)
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
    setIsCreateMenuOpen(false)
  }

  useEffect(() => {
    const fetchResources = async () => {
      const { data, order } = await loadAllResources()
      
      if (order && order.length > 0) {
        const orderedData = [...data].sort((a, b) => {
          const indexA = order.indexOf(a.id)
          const indexB = order.indexOf(b.id)
          if (indexA === -1 && indexB === -1) return 0
          if (indexA === -1) return 1
          if (indexB === -1) return -1
          return indexA - indexB
        })
        setResources(orderedData)
      } else {
        setResources(data)
      }
      setIsLoading(false)
    }
    fetchResources()
  }, [])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(resources)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setResources(items)
    
    const orderIds = items.map(item => item.id)
    setIsSyncing(true)
    await updateSidebarOrder(orderIds)
    setIsSyncing(false)
  }

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
    if (data) router.push(`/mindspace/canvas/${data.id}`)
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

  const handleDelete = async (resource: Resource) => {
    setDeletingId(resource.id)
  }

  const confirmDelete = async (resource: Resource) => {
    // Optimistic update
    const previousResources = [...resources]
    setResources(prev => prev.filter(r => r.id !== resource.id))
    setDeletingId(null)
    
    try {
      if (resource.type === 'note') {
        await deleteNote(resource.id)
      } else {
        const res = await deleteMindmap(resource.id)
        if (res.error) throw new Error(res.error)
      }

      if (resource.id === currentId) {
        router.push('/mindspace')
        router.refresh()
      }
    } catch (err: any) {
      if (err.message?.includes('NEXT_REDIRECT')) return
      console.error('Delete failed:', err)
      alert('Xóa không thành công. Vui lòng thử lại.')
      setResources(previousResources)
    }
  }

  const filteredResources = resources.filter(r => r.type === activeTab)

  return (
    <aside
      onClick={(e) => {
        // Only toggle if clicking the aside background itself
        if (e.target === e.currentTarget && !isMobile) {
          toggleCollapse()
        }
      }}
      className={`
        h-full shrink-0 bg-white rounded-2xl
        flex flex-col transition-all duration-300 relative
        ${isMobile ? 'w-full' : (isCollapsed ? 'w-[52px]' : 'w-[220px]')}
        ${isCollapsed && !isMobile ? 'cursor-ew-resize' : 'cursor-default'}
      `}
    >
      {/* Edge toggle hit area - Disable on mobile */}
      {!isMobile && (
        <div 
          onClick={(e) => {
            e.stopPropagation()
            toggleCollapse()
          }}
          className={`
            absolute top-0 bottom-0 z-[60] cursor-ew-resize group/toggle
            ${isCollapsed ? '-left-[30px] w-[42px]' : '-left-[30px] w-[38px]'}
          `}
        />
      )}


      {/* Tabs */}
      {!isCollapsed && (
        <div className="flex gap-1 p-1 mx-2 mt-2 bg-gray-50 rounded-xl border border-border-main/50">
          <button
            onClick={() => setActiveTab('note')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${activeTab === 'note' ? 'bg-white shadow-sm text-primary' : 'text-secondary/40 hover:text-secondary'}`}
          >
            Ghi chú
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${activeTab === 'map' ? 'bg-white shadow-sm text-primary' : 'text-secondary/40 hover:text-secondary'}`}
          >
            Bản đồ
          </button>
        </div>
      )}

      <div 
        className="flex-1 overflow-y-auto no-scrollbar py-4 px-2 flex flex-col gap-1 rounded-2xl overflow-hidden"
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center mb-4 relative">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setIsCreateMenuOpen(!isCreateMenuOpen)
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-xl bg-[#f5f5f5] text-foreground hover:bg-[#eeeeee] transition-all ${isCreateMenuOpen ? 'ring-2 ring-primary/20' : ''}`}
            >
              <Plus strokeWidth={2.5} className={`w-4 h-4 transition-transform duration-200 ${isCreateMenuOpen ? 'rotate-45' : ''}`} />
            </button>
            
            {isCreateMenuOpen && (
              <div 
                className="absolute left-full ml-2 top-0 bg-white border border-[#f5f5f5] rounded-xl shadow-xl p-1.5 flex flex-col gap-1 z-[100] w-32 animate-in fade-in zoom-in slide-in-from-left-2 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => {
                    handleCreateNote()
                    setIsCreateMenuOpen(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-[#f9f9f9] rounded-lg text-[12px] font-medium text-secondary hover:text-foreground transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> New Note
                </button>
                <button 
                  onClick={() => {
                    handleCreateMap()
                    setIsCreateMenuOpen(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-[#f9f9f9] rounded-lg text-[12px] font-medium text-secondary hover:text-foreground transition-colors"
                >
                  <Network className="w-3.5 h-3.5" /> New Map
                </button>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="flex gap-2 mb-4 px-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleCreateNote} 
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#f5f5f5] text-foreground rounded-xl text-[13px] font-medium hover:bg-[#eeeeee] transition-all"
            >
              <Plus strokeWidth={2} className="w-4 h-4" /> Note
            </button>
            <button 
              onClick={handleCreateMap} 
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#f5f5f5] text-foreground rounded-xl text-[13px] font-medium hover:bg-[#eeeeee] transition-all"
            >
              <Plus strokeWidth={2} className="w-4 h-4" /> Map
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="px-2 space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-9 bg-gray-100 rounded-main animate-pulse" />)}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="resources">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-col gap-1"
                >
                  {filteredResources.map((resource, index) => (
                    <ResourceItem
                      key={resource.id}
                      resource={resource}
                      index={index}
                      isCollapsed={isCollapsed}
                      active={isActive(resource)}
                      isEditing={editingId === resource.id}
                      editingId={editingId}
                      tempTitle={tempTitle}
                      setTempTitle={setTempTitle}
                      handleStartEditing={handleStartEditing}
                      handleFinishEditing={handleFinishEditing}
                      handleDelete={handleDelete}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Custom Delete Confirmation Overlay */}
      {deletingId && (
        <div className="absolute inset-0 z-[200] bg-white/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border-main shadow-premium rounded-2xl p-4 w-full animate-in zoom-in slide-in-from-bottom-2 duration-300">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3 mx-auto">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-sm font-black text-center text-foreground mb-1">Xóa tài nguyên?</h3>
            <p className="text-[11px] text-center text-secondary mb-4 px-2">Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const res = resources.find(r => r.id === deletingId)
                  if (res) confirmDelete(res)
                }}
                className="w-full py-2 bg-red-500 text-white rounded-xl text-[11px] font-bold hover:bg-red-600 transition-colors shadow-sm"
              >
                Xác nhận xóa
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="w-full py-2 bg-gray-50 text-secondary rounded-xl text-[11px] font-bold hover:bg-gray-100 transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default ResourceSidebar
