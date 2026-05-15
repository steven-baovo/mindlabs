'use client'

import React, { useState, useEffect, memo } from 'react'
import {
  FileText,
  Network,
  Plus,
  ChevronRight,
  GripVertical,
  MoreHorizontal,
  Trash2,
  Folder,
  FolderPlus
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { loadAllResources, Resource, updateSidebarOrder, SidebarOrder, SidebarFolder } from '@/app/(frontend)/workspace/actions'
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
          {...provided.dragHandleProps}
          className={`flex items-center group relative rounded-xl py-1 transition-[background-color,color] duration-200
            ${isCollapsed ? 'justify-center px-0' : 'px-2 gap-2'}
            ${active 
              ? 'bg-[#f5f5f5] text-foreground font-medium' 
              : 'text-secondary hover:bg-[#f9f9f9] hover:text-foreground'}
            ${snapshot.isDragging ? 'shadow-premium bg-white border border-border-main/50 z-50 scale-[1.02]' : ''}
          `}
        >
          <Link 
            href={resource.type === 'note' ? `/mindspace/note/${resource.id}` : `/mindspace/canvas/${resource.id}`} 
            className="absolute inset-0"
            onClick={(e) => {
              if (snapshot.isDragging) e.preventDefault()
            }}
          />
          
          <Icon strokeWidth={active ? 2.0 : 1.5} className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-primary' : 'text-secondary/70 group-hover:text-foreground'}`} />
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  autoFocus
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => handleFinishEditing(resource)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing(resource)}
                  className="w-full text-[11px] bg-white border border-border-main rounded px-1 py-0.5 outline-none ring-1 ring-primary/20"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-[11px] tracking-tight truncate block">{resource.title}</span>
              )}
            </div>
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
                      handleStartEditing(resource)
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 text-[11px] font-bold text-secondary hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Đổi tên
                  </button>
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

interface FolderItemProps {
  folder: SidebarFolder
  index: number
  isCollapsed: boolean
  isOpen: boolean
  toggleFolder: (id: string) => void
  isEditing: boolean
  tempTitle: string
  setTempTitle: (title: string) => void
  handleStartEditing: (folder: SidebarFolder) => void
  handleFinishEditing: (folder: SidebarFolder) => void
  handleDelete: (folder: SidebarFolder) => void
  resources: Resource[]
  activeId?: string
  editingResourceId: string | null
  tempResourceTitle: string
  setTempResourceTitle: (title: string) => void
  handleStartResourceEditing: (resource: Resource) => void
  handleFinishResourceEditing: (resource: Resource) => void
  handleDeleteResource: (resource: Resource) => void
}

const FolderItem = memo(({ folder, index, ...props }: FolderItemProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) return
    const close = () => setIsMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [isMenuOpen])

  return (
    <Draggable key={folder.id} draggableId={folder.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex flex-col mb-1">
          <div 
            onClick={() => props.toggleFolder(folder.id)}
            className={`flex items-center group relative rounded-xl py-1 transition-all duration-200
              ${props.isCollapsed ? 'justify-center px-0' : 'px-2'}
              hover:bg-[#f9f9f9] text-secondary hover:text-foreground
              ${snapshot.isDragging ? 'shadow-premium bg-white border border-border-main/50 z-50 scale-[1.02]' : ''}
            `}
          >
            {!props.isCollapsed && (
              <ChevronRight className={`w-3 h-3 shrink-0 transition-transform text-secondary/50 mr-1 ${props.isOpen ? 'rotate-90' : ''}`} />
            )}
            
            <Folder strokeWidth={1.5} className="w-4 h-4 shrink-0 text-primary/70 mr-1.5" />
            
            {!props.isCollapsed && (
              <div className="flex-1 min-w-0">
                {props.isEditing ? (
                  <input
                    autoFocus
                    value={props.tempTitle}
                    onChange={(e) => props.setTempTitle(e.target.value)}
                    onBlur={() => props.handleFinishEditing(folder)}
                    onKeyDown={(e) => e.key === 'Enter' && props.handleFinishEditing(folder)}
                    className="w-full text-[11px] font-bold bg-white border border-border-main rounded px-1 py-0.5 outline-none ring-1 ring-primary/20"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-[11px] font-bold tracking-tight truncate block">{folder.title}</span>
                )}
              </div>
            )}

            {!props.isCollapsed && (
              <div className="relative flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-1 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(!isMenuOpen)
                  }}
                  className={`p-1 transition-all rounded-lg border border-transparent ${isMenuOpen ? 'bg-white shadow-sm border-border-main text-primary scale-110' : 'text-secondary/30 hover:text-foreground hover:bg-gray-100'}`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {isMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-border-main shadow-premium rounded-2xl p-1.5 z-[100] animate-in fade-in zoom-in slide-in-from-top-2 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        props.handleStartEditing(folder)
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 text-[11px] font-bold text-secondary hover:bg-gray-50 rounded-xl transition-all"
                    >
                      Đổi tên
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        props.handleDelete(folder)
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa (giữ lại file)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!props.isCollapsed && props.isOpen && (
            <Droppable droppableId={`folder-${folder.id}`} type="DEFAULT">
              {(prov, snap) => (
                <div 
                  ref={prov.innerRef} 
                  {...prov.droppableProps} 
                  className={`pl-4 ml-3 border-l border-border-main/30 flex flex-col gap-0.5 mt-0.5 pb-1 transition-colors ${snap.isDraggingOver ? 'bg-primary/5 rounded-r-lg border-l-primary' : ''}`}
                >
                  {folder.children.map((childId, childIndex) => {
                    const res = props.resources.find(r => r.id === childId)
                    if (!res) return null
                    return (
                      <ResourceItem
                        key={res.id}
                        resource={res}
                        index={childIndex}
                        isCollapsed={props.isCollapsed}
                        active={props.activeId === res.id}
                        isEditing={props.editingResourceId === res.id}
                        editingId={props.editingResourceId}
                        tempTitle={props.tempResourceTitle}
                        setTempTitle={props.setTempResourceTitle}
                        handleStartEditing={props.handleStartResourceEditing}
                        handleFinishEditing={props.handleFinishResourceEditing}
                        handleDelete={props.handleDeleteResource}
                      />
                    )
                  })}
                  {prov.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  )
})

FolderItem.displayName = 'FolderItem'

interface ResourceSidebarProps {
  activeTitle?: string
  onTitleChange?: (title: string) => void
  isSaving?: boolean
  isMobile?: boolean
}

const STORAGE_KEY = 'resource-sidebar-collapsed'
const OPEN_FOLDERS_KEY = 'resource-sidebar-open-folders'

const ResourceSidebar = ({ activeTitle, onTitleChange, isSaving, isMobile }: ResourceSidebarProps) => {
  const [resources, setResources] = useState<Resource[]>([])
  const [order, setOrder] = useState<SidebarOrder>([])
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // File editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState('')
  
  // Folder editing state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [tempFolderTitle, setTempFolderTitle] = useState('')

  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  const currentId = params?.id as string | undefined

  useEffect(() => {
    try {
      const saved = localStorage.getItem(OPEN_FOLDERS_KEY)
      if (saved) setOpenFolders(new Set(JSON.parse(saved)))
    } catch (e) {}
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
    setIsCreateMenuOpen(false)
  }

  const toggleFolder = (id: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(OPEN_FOLDERS_KEY, JSON.stringify(Array.from(next)))
      return next
    })
  }

  const syncOrder = async (newOrder: SidebarOrder) => {
    setIsSyncing(true)
    await updateSidebarOrder(newOrder)
    setIsSyncing(false)
  }

  useEffect(() => {
    const fetchResources = async () => {
      const { data, order: fetchedOrder } = await loadAllResources()
      
      const idsInOrder = new Set<string>()
      fetchedOrder.forEach(item => {
        if (typeof item === 'string') idsInOrder.add(item)
        else item.children.forEach(child => idsInOrder.add(child))
      })

      const orphans = data.filter(r => !idsInOrder.has(r.id)).map(r => r.id)
      const validResourceIds = new Set(data.map(r => r.id))
      
      const finalOrder = [...fetchedOrder, ...orphans].map(item => {
        if (typeof item === 'string') {
          return validResourceIds.has(item) ? item : null
        } else {
          return {
            ...item,
            children: item.children.filter(childId => validResourceIds.has(childId))
          }
        }
      }).filter(Boolean) as SidebarOrder

      setResources(data)
      setOrder(finalOrder)
      setIsLoading(false)
    }
    fetchResources()
  }, [])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return

    // Prevent folder dropping into a folder
    const isFolder = order.some(item => typeof item === 'object' && item.id === draggableId)
    if (isFolder && destination.droppableId !== 'root') return

    // Prevent dropping into same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    let newOrder = JSON.parse(JSON.stringify(order)) as SidebarOrder
    let movedItem: string | SidebarFolder | undefined

    // Remove from source
    if (source.droppableId === 'root') {
      movedItem = newOrder.splice(source.index, 1)[0]
    } else {
      const folderId = source.droppableId.replace('folder-', '')
      const folder = newOrder.find((f): f is SidebarFolder => typeof f === 'object' && f.id === folderId)
      if (folder) {
        movedItem = folder.children.splice(source.index, 1)[0]
      }
    }

    if (!movedItem) return

    // Insert into destination
    if (destination.droppableId === 'root') {
      newOrder.splice(destination.index, 0, movedItem)
    } else {
      const folderId = destination.droppableId.replace('folder-', '')
      const folder = newOrder.find((f): f is SidebarFolder => typeof f === 'object' && f.id === folderId)
      if (folder && typeof movedItem === 'string') {
        folder.children.splice(destination.index, 0, movedItem)
      }
    }

    setOrder(newOrder)
    syncOrder(newOrder)
  }

  useEffect(() => {
    if (activeTitle && currentId) {
      setResources(prev => prev.map(r =>
        r.id === currentId ? { ...r, title: activeTitle } : r
      ))
    }
  }, [activeTitle, currentId])

  const handleCreateNote = async () => {
    const { data } = await createNote()
    if (data) {
      const res: Resource = { id: data.id, title: data.title || 'Chưa có tiêu đề', type: 'note', updated_at: data.updated_at }
      setResources(prev => [res, ...prev])
      setOrder(prev => {
        const newOrder = [data.id, ...prev]
        syncOrder(newOrder)
        return newOrder
      })
      router.push(`/mindspace/note/${data.id}`)
    }
  }

  const handleCreateMap = async () => {
    const { data } = await createMindmap()
    if (data) {
      const res: Resource = { id: data.id, title: data.title || 'Untitled Canvas', type: 'map', updated_at: data.updated_at }
      setResources(prev => [res, ...prev])
      setOrder(prev => {
        const newOrder = [data.id, ...prev]
        syncOrder(newOrder)
        return newOrder
      })
      router.push(`/mindspace/canvas/${data.id}`)
    }
  }

  const handleCreateFolder = async () => {
    const newFolder: SidebarFolder = {
      id: crypto.randomUUID(),
      type: 'folder',
      title: 'Thư mục mới',
      children: []
    }
    setOrder(prev => {
      const newOrder = [newFolder, ...prev]
      syncOrder(newOrder)
      return newOrder
    })
    setEditingFolderId(newFolder.id)
    setTempFolderTitle(newFolder.title)
    setOpenFolders(prev => new Set(prev).add(newFolder.id))
  }

  const handleStartEditingResource = (resource: Resource) => {
    if (isCollapsed) return
    setEditingId(resource.id)
    setTempTitle(resource.title)
  }

  const handleFinishEditingResource = async (resource: Resource) => {
    if (!editingId) return
    const newTitle = tempTitle.trim() || 'Untitled'
    if (resource.id === currentId) {
      onTitleChange?.(newTitle)
    } else {
      setResources(prev => prev.map(r => r.id === resource.id ? { ...r, title: newTitle } : r))
    }
    setEditingId(null)
  }

  const handleStartEditingFolder = (folder: SidebarFolder) => {
    if (isCollapsed) return
    setEditingFolderId(folder.id)
    setTempFolderTitle(folder.title)
  }

  const handleFinishEditingFolder = async (folder: SidebarFolder) => {
    if (!editingFolderId) return
    const newTitle = tempFolderTitle.trim() || 'Thư mục mới'
    const newOrder = order.map(item => 
      (typeof item === 'object' && item.id === folder.id) 
        ? { ...item, title: newTitle } 
        : item
    )
    setOrder(newOrder)
    syncOrder(newOrder)
    setEditingFolderId(null)
  }

  const handleDeleteFolder = async (folder: SidebarFolder) => {
    let newOrder = [...order]
    const index = newOrder.findIndex(f => typeof f === 'object' && f.id === folder.id)
    if (index === -1) return
    
    const targetFolder = newOrder[index] as SidebarFolder
    newOrder.splice(index, 1) // Remove folder
    newOrder = [...targetFolder.children, ...newOrder] // Move children to root
    
    setOrder(newOrder)
    syncOrder(newOrder)
  }

  const handleDeleteResource = async (resource: Resource) => {
    setDeletingId(resource.id)
  }

  const confirmDeleteResource = async (resource: Resource) => {
    // Optimistic update
    const previousResources = [...resources]
    setResources(prev => prev.filter(r => r.id !== resource.id))
    
    let newOrder = JSON.parse(JSON.stringify(order)) as SidebarOrder
    newOrder = newOrder.map(item => {
      if (typeof item === 'string') return item === resource.id ? null : item
      return { ...item, children: item.children.filter(id => id !== resource.id) }
    }).filter(Boolean) as SidebarOrder
    
    setOrder(newOrder)
    syncOrder(newOrder)
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

  return (
    <aside
      onClick={(e) => {
        if (e.target === e.currentTarget && !isMobile) toggleCollapse()
      }}
      className={`
        h-full shrink-0 bg-white rounded-2xl
        flex flex-col transition-all duration-300 relative
        ${isMobile ? 'w-full' : (isCollapsed ? 'w-[52px]' : 'w-[220px]')}
        ${isCollapsed && !isMobile ? 'cursor-ew-resize' : 'cursor-default'}
      `}
    >
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

      <div className="p-4 px-2 pb-2">
        {isCollapsed ? (
          <div className="flex flex-col items-center relative">
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
                className="absolute right-full mr-2 top-0 bg-white border border-[#f5f5f5] rounded-xl shadow-xl p-1.5 flex flex-col gap-1 z-[100] w-36 animate-in fade-in zoom-in slide-in-from-right-2 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => { handleCreateNote(); setIsCreateMenuOpen(false) }} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f9f9f9] rounded-lg text-[12px] font-medium text-secondary hover:text-foreground transition-colors">
                  <FileText className="w-3.5 h-3.5" /> Note mới
                </button>
                <button onClick={() => { handleCreateMap(); setIsCreateMenuOpen(false) }} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f9f9f9] rounded-lg text-[12px] font-medium text-secondary hover:text-foreground transition-colors">
                  <Network className="w-3.5 h-3.5" /> Map mới
                </button>
                <button onClick={() => { handleCreateFolder(); setIsCreateMenuOpen(false) }} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f9f9f9] rounded-lg text-[12px] font-medium text-secondary hover:text-foreground transition-colors border-t border-border-main/50 mt-1 pt-2">
                  <FolderPlus className="w-3.5 h-3.5" /> Thư mục mới
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-1.5 px-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleCreateNote} title="Tạo Ghi chú" className="flex-1 flex items-center justify-center py-2 bg-[#f5f5f5] text-foreground rounded-xl hover:bg-[#eeeeee] transition-all text-secondary hover:text-foreground">
              <FileText className="w-4 h-4" />
            </button>
            <button onClick={handleCreateMap} title="Tạo Bản đồ" className="flex-1 flex items-center justify-center py-2 bg-[#f5f5f5] text-foreground rounded-xl hover:bg-[#eeeeee] transition-all text-secondary hover:text-foreground">
              <Network className="w-4 h-4" />
            </button>
            <button onClick={handleCreateFolder} title="Tạo Thư mục" className="flex-1 flex items-center justify-center py-2 bg-[#f5f5f5] text-foreground rounded-xl hover:bg-[#eeeeee] transition-all text-secondary hover:text-foreground">
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2 flex flex-col gap-1 rounded-2xl">

        {isLoading ? (
          <div className="px-2 pt-2 space-y-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-2 py-1.5 px-2 animate-pulse">
                <div className="w-4 h-4 bg-gray-100 rounded-md shrink-0" />
                <div className={`h-3 bg-gray-100 rounded-full ${i % 2 === 0 ? 'w-24' : 'w-32'}`} />
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="root" type="DEFAULT">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-1 min-h-[100px]">
                  {order.map((item, index) => {
                    if (typeof item === 'string') {
                      const res = resources.find(r => r.id === item)
                      if (!res) return null
                      return (
                        <ResourceItem
                          key={res.id}
                          resource={res}
                          index={index}
                          isCollapsed={isCollapsed}
                          active={currentId === res.id}
                          isEditing={editingId === res.id}
                          editingId={editingId}
                          tempTitle={tempTitle}
                          setTempTitle={setTempTitle}
                          handleStartEditing={handleStartEditingResource}
                          handleFinishEditing={handleFinishEditingResource}
                          handleDelete={handleDeleteResource}
                        />
                      )
                    } else {
                      return (
                        <FolderItem
                          key={item.id}
                          folder={item}
                          index={index}
                          isCollapsed={isCollapsed}
                          isOpen={openFolders.has(item.id)}
                          toggleFolder={toggleFolder}
                          isEditing={editingFolderId === item.id}
                          tempTitle={tempFolderTitle}
                          setTempTitle={setTempFolderTitle}
                          handleStartEditing={handleStartEditingFolder}
                          handleFinishEditing={handleFinishEditingFolder}
                          handleDelete={handleDeleteFolder}
                          resources={resources}
                          activeId={currentId}
                          editingResourceId={editingId}
                          tempResourceTitle={tempTitle}
                          setTempResourceTitle={setTempTitle}
                          handleStartResourceEditing={handleStartEditingResource}
                          handleFinishResourceEditing={handleFinishEditingResource}
                          handleDeleteResource={handleDeleteResource}
                        />
                      )
                    }
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

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
                  if (res) confirmDeleteResource(res)
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
