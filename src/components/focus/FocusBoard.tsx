'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { FocusBlock, BlockType, saveBlock, updateBlock, deleteBlock, duplicateDay } from '@/app/(frontend)/focus/actions'
import {
  BLOCK_CONFIGS, DAYS, DAY_LABELS,
  minutesToPx, pxToMinutes, minutesToTime,
  SNAP_MINUTES, PIXELS_PER_MINUTE,
  START_HOUR, END_HOUR
} from './blockConfig'
import BlockItem from './BlockItem'
import BlockPalette from './BlockPalette'

interface Props {
  initialBlocks: FocusBlock[]
}

const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60
const BOARD_HEIGHT = minutesToPx(TOTAL_MINUTES)
const HOUR_MARKS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR)

export default function FocusBoard({ initialBlocks }: Props) {
  const [mounted, setMounted] = useState(false)
  const [blocks, setBlocks] = useState<FocusBlock[]>(initialBlocks)
  const [activeDay, setActiveDay] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [dragging, setDragging] = useState<{ block: FocusBlock; offsetY: number } | null>(null)
  const [duplicateMenu, setDuplicateMenu] = useState<{ fromDay: number } | null>(null)
  const columnRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ─── Drag from Palette ───────────────────────────────────────────────
  const handlePaletteDragStart = useCallback((type: BlockType) => {
    const cfg = BLOCK_CONFIGS[type]
    const phantom: FocusBlock = {
      id: `phantom-${Date.now()}`,
      user_id: '',
      day_of_week: 0,
      start_minutes: 480, // default 08:00
      duration_minutes: cfg.defaultDuration,
      block_type: type,
      custom_label: null,
      created_at: '',
    }
    setDragging({ block: phantom, offsetY: 0 })
  }, [])

  // ─── Column Drop ─────────────────────────────────────────────────────
  const handleColumnDrop = useCallback(async (dayIndex: number, e: React.DragEvent) => {
    e.preventDefault()
    if (!dragging) return

    const col = columnRefs.current[dayIndex]
    if (!col) return

    const rect = col.getBoundingClientRect()
    const rawY = e.clientY - rect.top - dragging.offsetY
    const snapped = Math.round(rawY / (SNAP_MINUTES * PIXELS_PER_MINUTE)) * SNAP_MINUTES
    const start = Math.max(0, Math.min(snapped, TOTAL_MINUTES - dragging.block.duration_minutes))

    if (dragging.block.id.startsWith('phantom-')) {
      // New block from palette
      const result = await saveBlock({
        day_of_week: dayIndex,
        start_minutes: start,
        duration_minutes: dragging.block.duration_minutes,
        block_type: dragging.block.block_type,
      })
      if (result.data) {
        setBlocks(prev => [...prev, result.data!])
      }
    } else {
      // Existing block moved
      const updated = { ...dragging.block, day_of_week: dayIndex, start_minutes: start }
      setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b))
      await updateBlock(dragging.block.id, { day_of_week: dayIndex, start_minutes: start })
    }
    setDragging(null)
  }, [dragging])

  // ─── Block Drag Start ─────────────────────────────────────────────────
  const handleBlockDragStart = useCallback((block: FocusBlock, offsetY: number) => {
    setDragging({ block, offsetY })
  }, [])

  // ─── Delete Block ─────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
    await deleteBlock(id)
  }, [])

  // ─── Update Label ─────────────────────────────────────────────────────
  const handleLabelUpdate = useCallback(async (id: string, label: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, custom_label: label } : b))
    await updateBlock(id, { custom_label: label })
  }, [])

  // ─── Duplicate Day ────────────────────────────────────────────────────
  const handleDuplicate = useCallback(async (fromDay: number, toDay: number) => {
    const sourceBlocks = blocks.filter(b => b.day_of_week === fromDay)
    await duplicateDay(fromDay, toDay)
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

  const renderColumn = (dayIndex: number) => {
    const dayBlocks = blocks.filter(b => b.day_of_week === dayIndex)

    return (
      <div
        key={dayIndex}
        className="flex-1 min-w-0 relative"
        ref={el => { columnRefs.current[dayIndex] = el }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => handleColumnDrop(dayIndex, e)}
        style={{ height: BOARD_HEIGHT }}
      >
        {/* Grid lines */}
        {HOUR_MARKS.slice(0, -1).map(h => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-gray-100"
            style={{ top: minutesToPx(h * 60) }}
          />
        ))}
        {/* Half-hour lines */}
        {HOUR_MARKS.slice(0, -1).map(h => (
          <div
            key={`h-${h}`}
            className="absolute left-0 right-0 border-t border-gray-50"
            style={{ top: minutesToPx(h * 60 + 30) }}
          />
        ))}

        {/* Blocks */}
        {dayBlocks.map(block => (
          <BlockItem
            key={block.id}
            block={block}
            onDragStart={handleBlockDragStart}
            onDelete={handleDelete}
            onLabelUpdate={handleLabelUpdate}
          />
        ))}
      </div>
    )
  }

  if (!mounted) return <div className="min-h-screen bg-[#fdfaf6]" />

  return (
    <div className="flex gap-4">
      {/* ── Main Board ── */}
      <div className="flex-1 overflow-x-auto">
        {/* ─ Header row ─ */}
        <div className="flex">
          {/* Time ruler gutter */}
          <div className="w-12 shrink-0" />
          {isMobile ? (
            /* Mobile: day tabs */
            <div className="flex gap-1 mb-2 flex-1">
              {DAYS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
                    activeDay === i
                      ? 'bg-[#1a2b49] text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          ) : (
            /* Desktop: 7 column headers */
            <div className="flex flex-1 gap-1">
              {DAYS.map((d, i) => (
                <div key={i} className="flex-1 min-w-0 relative group">
                  <div className="text-center py-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{d}</span>
                    <div className="text-[10px] text-gray-300">{DAY_LABELS[i]}</div>
                  </div>
                  {/* Duplicate button */}
                  <button
                    onClick={() => setDuplicateMenu(duplicateMenu?.fromDay === i ? null : { fromDay: i })}
                    className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-gray-100 hover:bg-gray-200 text-gray-500 rounded px-1 py-0.5"
                    title="Sao chép ngày này sang ngày khác"
                  >
                    copy
                  </button>
                  {/* Duplicate popover */}
                  {duplicateMenu?.fromDay === i && (
                    <div className="absolute top-8 right-0 z-20 bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-32">
                      <p className="text-[10px] text-gray-400 mb-1 px-1">Sao chép sang:</p>
                      {DAYS.map((td, ti) => ti !== i && (
                        <button
                          key={ti}
                          onClick={() => handleDuplicate(i, ti)}
                          className="w-full text-left text-xs px-2 py-1 rounded-lg hover:bg-gray-50 text-gray-700"
                        >
                          {DAY_LABELS[ti]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─ Board body ─ */}
        <div className="flex border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
          {/* Time ruler */}
          <div className="w-12 shrink-0 relative bg-[#fdfaf6] border-r border-gray-100" style={{ height: BOARD_HEIGHT }}>
            {HOUR_MARKS.filter(h => h % 2 === 0).map(h => (
              <div
                key={h}
                className="absolute right-2 text-[10px] text-gray-300 font-mono leading-none"
                style={{ top: minutesToPx(h * 60) - 6 }}
              >
                {String(h).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Columns */}
          {isMobile ? (
            <div className="flex-1 relative" style={{ height: BOARD_HEIGHT }}>
              {renderColumn(activeDay)}
            </div>
          ) : (
            <div className="flex flex-1 divide-x divide-gray-100">
              {DAYS.map((_, i) => renderColumn(i))}
            </div>
          )}
        </div>
      </div>

      {/* ── Block Palette ── */}
      <BlockPalette onDragStart={handlePaletteDragStart} />
    </div>
  )
}
