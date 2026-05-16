'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { FocusBlock, BlockType, saveBlock, updateBlock, deleteBlock, duplicateDay, updateBlocks } from '@/app/(frontend)/clarity/actions'
import {
  BLOCK_CONFIGS, DAYS,
  minutesToPx, pxToMinutes, minutesToTime,
  SNAP_MINUTES, PIXELS_PER_MINUTE,
  START_HOUR, END_HOUR
} from './blockConfig'
import { Settings } from 'lucide-react'
import BlockItem from './BlockItem'
import BlockPalette from './BlockPalette'

interface Props {
  initialBlocks: FocusBlock[]
}

const SNAP_MINUTES_LOCAL = 15 // Internal snapping logic

export default function FocusBoard({ initialBlocks }: Props) {
  const [mounted, setMounted] = useState(false)
  const [blocks, setBlocks] = useState<FocusBlock[]>(() => 
    initialBlocks.filter(b => !!BLOCK_CONFIGS[b.block_type])
  )
  const [activeDay, setActiveDay] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [dragging, setDragging] = useState<{ block: FocusBlock; offsetY: number } | null>(null)
  const [dragPreview, setDragPreview] = useState<{ dayIndex: number; startMinutes: number } | null>(null)
  const [duplicateMenu, setDuplicateMenu] = useState<{ fromDay: number } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const duplicateRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState('Schedule')
  const [viewStartHour, setViewStartHour] = useState(6) // Default 06:00 AM

  const TOTAL_MINS = 1440 // Always 24 hours
  const BOARD_H = minutesToPx(TOTAL_MINS)
  const VISUAL_OFFSET = viewStartHour * 60

  // Helper to map real minutes (0-1439) to visual position (0-1439)
  const getVisualMinutes = (realMins: number) => (realMins - VISUAL_OFFSET + 1440) % 1440
  // Helper to map visual position to real minutes
  const getRealMinutes = (visualMins: number) => (visualMins + VISUAL_OFFSET) % 1440

  const [customDurations, setCustomDurations] = useState<Record<BlockType, number>>(() => {
    const initial: any = {}
    Object.values(BLOCK_CONFIGS).forEach(cfg => {
      initial[cfg.type] = cfg.defaultDuration
    })
    return initial
  })
  const columnRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
      if (duplicateRef.current && !duplicateRef.current.contains(event.target as Node)) {
        setDuplicateMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ─── Drag from Palette ───────────────────────────────────────────────
  const handlePaletteDragStart = useCallback((type: BlockType) => {
    const cfg = BLOCK_CONFIGS[type]
    const phantom: FocusBlock = {
      id: `phantom-${Date.now()}`,
      user_id: '',
      day_of_week: 0,
      start_minutes: 480, // default 08:00
      duration_minutes: customDurations[type],
      block_type: type,
      custom_label: null,
      created_at: '',
    }
    setDragging({ block: phantom, offsetY: 0 })
  }, [customDurations])

  // ─── Resolve Pushing (Domino Effect) ────────────────────────────────
  const resolvePushing = useCallback((allBlocks: FocusBlock[], dayIndex: number) => {
    // Sort blocks by visual position
    const dayBlocks = [...allBlocks.filter(b => b.day_of_week === dayIndex)]
      .sort((a, b) => getVisualMinutes(a.start_minutes) - getVisualMinutes(b.start_minutes))
    
    let changed = false
    const updatedDayBlocks = [...dayBlocks]

    for (let i = 1; i < updatedDayBlocks.length; i++) {
      const prev = updatedDayBlocks[i - 1]
      const curr = updatedDayBlocks[i]
      
      const prevVisualStart = getVisualMinutes(prev.start_minutes)
      const prevVisualEnd = prevVisualStart + prev.duration_minutes
      const currVisualStart = getVisualMinutes(curr.start_minutes)
      
      if (currVisualStart < prevVisualEnd) {
        const newVisualStart = prevVisualEnd
        if (newVisualStart < TOTAL_MINS) {
          curr.start_minutes = getRealMinutes(newVisualStart)
          changed = true
        }
      }
    }

    if (changed) {
      setBlocks(prev => prev.map(b => {
        const found = updatedDayBlocks.find(db => db.id === b.id)
        return found ? { ...b, start_minutes: found.start_minutes } : b
      }))
      // Batch update to DB
      const updates = updatedDayBlocks.map(b => ({ id: b.id, start_minutes: b.start_minutes }))
      updateBlocks(updates).catch(console.error)
    }
  }, [viewStartHour])

  // ─── Column Drop ─────────────────────────────────────────────────────
  const handleColumnDrop = useCallback((dayIndex: number, e: React.DragEvent) => {
    e.preventDefault()
    setDragPreview(null)
    if (!dragging) return

    const col = columnRefs.current[dayIndex]
    if (!col) return

    const rect = col.getBoundingClientRect()
    const rawY = e.clientY - rect.top - dragging.offsetY
    const snapped = Math.round(rawY / (SNAP_MINUTES * PIXELS_PER_MINUTE)) * SNAP_MINUTES
    
    const visualStart = Math.max(0, Math.min(snapped, TOTAL_MINS - dragging.block.duration_minutes))
    const start = getRealMinutes(visualStart)

    let newBlocks = [...blocks]
    if (dragging.block.id.startsWith('phantom-')) {
      const tempId = `temp-${Date.now()}`
      const optimisticBlock: FocusBlock = {
        ...dragging.block,
        id: tempId,
        day_of_week: dayIndex,
        start_minutes: start,
      }
      
      newBlocks = [...blocks, optimisticBlock]
      setBlocks(newBlocks)
      resolvePushing(newBlocks, dayIndex)

      saveBlock({
        day_of_week: dayIndex,
        start_minutes: start,
        duration_minutes: dragging.block.duration_minutes,
        block_type: dragging.block.block_type,
      }).then(result => {
        if (result.data) {
          setBlocks(prev => prev.map(b => b.id === tempId ? result.data! : b))
        } else {
          setBlocks(prev => prev.filter(b => b.id !== tempId))
        }
      }).catch(console.error)
    } else {
      const updated = { ...dragging.block, day_of_week: dayIndex, start_minutes: start }
      newBlocks = blocks.map(b => b.id === updated.id ? updated : b)
      setBlocks(newBlocks)
      resolvePushing(newBlocks, dayIndex)
      
      updateBlock(dragging.block.id, { day_of_week: dayIndex, start_minutes: start }).catch(console.error)
    }
    setDragging(null)
  }, [dragging, blocks, resolvePushing, viewStartHour])

  // ─── Block Drag Start ─────────────────────────────────────────────────
  const handleBlockDragStart = useCallback((block: FocusBlock, offsetY: number) => {
    setDragging({ block, offsetY })
  }, [])

  // ─── Delete Block ─────────────────────────────────────────────────────
  const handleDelete = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
    deleteBlock(id).catch(console.error)
  }, [])

  // ─── Update Label ─────────────────────────────────────────────────────
  const handleLabelUpdate = useCallback((id: string, label: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, custom_label: label } : b))
    updateBlock(id, { custom_label: label }).catch(console.error)
  }, [])

  // ─── Update Time (Manual or Resize) ──────────────────────────────────
  const handleTimeUpdate = useCallback((id: string, start: number, duration: number) => {
    const updatedBlocks = blocks.map(b => b.id === id ? { ...b, start_minutes: start, duration_minutes: duration } : b)
    setBlocks(updatedBlocks)
    
    // Trigger pushing
    const target = updatedBlocks.find(b => b.id === id)
    if (target) {
      resolvePushing(updatedBlocks, target.day_of_week)
    }

    updateBlock(id, { start_minutes: start, duration_minutes: duration }).catch(console.error)
  }, [blocks, resolvePushing])


  // ─── Duplicate Day ────────────────────────────────────────────────────
  const handleDuplicate = useCallback((fromDay: number, toDay: number) => {
    const sourceBlocks = blocks.filter(b => b.day_of_week === fromDay)
    duplicateDay(fromDay, toDay).catch(console.error)
    setBlocks(prev => {
      const withoutTarget = prev.filter(b => b.day_of_week !== toDay)
      const cloned = sourceBlocks.map(b => ({
        ...b,
        id: `cloned-${Date.now()}-${Math.random()}`,
        day_of_week: toDay,
      }))
      return [...withoutTarget, ...cloned]
    })
    setDuplicateMenu(null)
  }, [blocks])

  const handleColumnDragOver = useCallback((dayIndex: number, e: React.DragEvent) => {
    e.preventDefault()
    if (!dragging) return

    const col = columnRefs.current[dayIndex]
    if (!col) return

    const rect = col.getBoundingClientRect()
    const rawY = e.clientY - rect.top - dragging.offsetY
    const snapped = Math.round(rawY / (SNAP_MINUTES * PIXELS_PER_MINUTE)) * SNAP_MINUTES
    
    const visualStart = Math.max(0, Math.min(snapped, TOTAL_MINS - dragging.block.duration_minutes))
    
    setDragPreview({ dayIndex, startMinutes: getRealMinutes(visualStart) })
  }, [dragging, viewStartHour])

  const renderColumn = (dayIndex: number) => {
    const dayBlocks = blocks.filter(b => b.day_of_week === dayIndex)
    const isOver = dragPreview?.dayIndex === dayIndex

    return (
      <div
        key={dayIndex}
        className="flex-1 min-w-0 relative"
        ref={el => { columnRefs.current[dayIndex] = el }}
        onDragOver={e => handleColumnDragOver(dayIndex, e)}
        onDrop={e => handleColumnDrop(dayIndex, e)}
        onDragLeave={() => setDragPreview(null)}
        style={{ height: BOARD_H }}
      >
        {/* Ghost Preview Block */}
        {isOver && dragging && (
          <div 
            className="absolute left-1 right-1 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/30 z-0 pointer-events-none transition-all duration-150"
            style={{ 
              top: minutesToPx(getVisualMinutes(dragPreview.startMinutes)) + 1,
              height: minutesToPx(dragging.block.duration_minutes) - 2
            }}
          />
        )}

        {/* Blocks */}
        {dayBlocks.map(block => (
          <BlockItem
            key={block.id}
            block={block}
            onDragStart={handleBlockDragStart}
            onDelete={handleDelete}
            onLabelUpdate={handleLabelUpdate}
            onTimeUpdate={handleTimeUpdate}
            visualOffset={VISUAL_OFFSET}
          />
        ))}
      </div>
    )
  }

  if (!mounted) return <div className="min-h-screen bg-white" />

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Sub Header / Navigation ── */}
      <div className="bg-white border-b border-[#e5e5e5] px-8 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-8">
          <h1 className="text-sm font-black text-[#1a2b49] uppercase tracking-tighter">Clarity Planner</h1>
          
          <nav className="flex items-center gap-6">
            {['Schedule', 'Tasks', 'Analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold transition-all relative py-1 ${
                  activeTab === tab ? 'text-[#1a2b49]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute -bottom-3 left-0 right-0 h-0.5 bg-[#1a2b49] rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={settingsRef}>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 transition-colors rounded-lg cursor-pointer ${showSettings ? 'bg-gray-100 text-[#1a2b49]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-10 w-56 bg-white border border-[#e5e5e5] rounded-xl p-4 z-40">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Cài đặt bảng</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Bắt đầu ngày:</span>
                    <select 
                      value={viewStartHour} 
                      onChange={e => setViewStartHour(Number(e.target.value))}
                      className="text-xs bg-gray-50 border-none rounded px-2 py-1 outline-none font-bold text-[#1a2b49]"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 px-8">
        {/* ── Main Board (Full Width) ── */}
        <div className="flex-1 border-r border-[#e5e5e5] bg-white">
          {/* ─ Header row ─ */}
          <div className="flex bg-white border-b border-[#e5e5e5]">
            {/* Time ruler gutter */}
            <div className="w-16 shrink-0" />
            {isMobile ? (
              <div className="flex gap-1 p-2 flex-1">
                {DAYS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    className={`flex-1 text-[10px] font-black py-2 rounded transition-colors ${
                      activeDay === i
                        ? 'bg-[#1a2b49] text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 divide-x divide-gray-50">
                {DAYS.map((d, i) => (
                  <div key={i} className="flex-1 min-w-0 relative group" ref={duplicateMenu?.fromDay === i ? duplicateRef : null}>
                    <div className="text-center py-3">
                      <span className="text-[11px] font-black text-[#1a2b49] uppercase tracking-[0.2em]">{d}</span>
                    </div>

                    <button
                      onClick={() => setDuplicateMenu(duplicateMenu?.fromDay === i ? null : { fromDay: i })}
                      className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold bg-gray-50 hover:bg-gray-100 text-gray-400 rounded px-1 py-0.5"
                    >
                      COPY
                    </button>
                    {duplicateMenu?.fromDay === i && (
                      <div className="absolute top-10 right-2 z-50 bg-white rounded-lg border border-gray-200 p-2 min-w-[140px]">
                        <p className="text-[9px] font-black text-gray-400 mb-2 px-1 uppercase">Sao chép sang:</p>
                        {DAYS.map((td, ti) => ti !== i && (
                          <button
                            key={ti}
                            onClick={() => handleDuplicate(i, ti)}
                            className="w-full text-left text-[11px] font-bold px-2 py-1.5 rounded hover:bg-gray-50 text-gray-700 transition-colors"
                          >
                            {DAYS[ti]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─ Board Content ─ */}
          <div className="flex items-start bg-white">
            {/* Time ruler */}
            <div className="w-16 shrink-0 relative bg-white border-r border-gray-50" style={{ height: BOARD_H }}>
              {Array.from({ length: 49 }).map((_, i) => {
                const visualMins = i * 30;
                const realMins = getRealMinutes(visualMins);
                const hour = Math.floor(realMins / 60) % 24;
                const isHalfHour = visualMins % 60 !== 0;
                
                return (
                  <div
                    key={i}
                    className="absolute right-0 flex items-center -translate-y-1/2"
                    style={{ top: minutesToPx(visualMins) }}
                  >
                    {!isHalfHour && (
                      <span className="text-[9px] font-black text-gray-400 mr-2 tabular-nums">
                        {String(hour).padStart(2, '0')}:00
                      </span>
                    )}
                    <div className={`h-[1px] ${isHalfHour ? 'w-1 bg-gray-100' : 'w-2 bg-gray-200'}`} />
                  </div>
                );
              })}
            </div>

            {/* Columns Area */}
            <div className="flex-1 flex bg-white">
              {isMobile ? (
                <div className="flex-1 relative" style={{ height: BOARD_H }}>
                  {renderColumn(activeDay)}
                </div>
              ) : (
                <div className="flex flex-1 divide-x divide-gray-50">
                  {DAYS.map((_, i) => renderColumn(i))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Block Palette Sidebar (Sticky) ── */}
        <div className="w-48 bg-gray-50/20 p-5 border-l border-[#e5e5e5] hidden lg:block sticky top-14 self-start h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden no-scrollbar">
          <BlockPalette 
            onDragStart={handlePaletteDragStart} 
            customDurations={customDurations}
            onDurationChange={(type, dur) => setCustomDurations(prev => ({ ...prev, [type]: dur }))}
          />
        </div>
      </div>
    </div>
  )
}


