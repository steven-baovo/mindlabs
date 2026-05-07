'use client'

import { useState, useRef } from 'react'
import { FocusBlock } from '@/app/(frontend)/focus/actions'
import { BLOCK_CONFIGS, minutesToPx, minutesToTime, PIXELS_PER_MINUTE } from './blockConfig'
import { Trash2 } from 'lucide-react'

interface Props {
  block: FocusBlock
  onDragStart: (block: FocusBlock, offsetY: number) => void
  onDelete: (id: string) => void
  onLabelUpdate: (id: string, label: string) => void
  onTimeUpdate: (id: string, start: number, duration: number) => void
  visualOffset: number
}

export default function BlockItem({ block, onDragStart, onDelete, onLabelUpdate, onTimeUpdate, visualOffset }: Props) {
  const cfg = BLOCK_CONFIGS[block.block_type]
  if (!cfg) return null

  const [editing, setEditing] = useState(false)
  const [editingTime, setEditingTime] = useState(false)
  const [label, setLabel] = useState(block.custom_label ?? '')
  const [timeInput, setTimeInput] = useState(`${minutesToTime(block.start_minutes)} - ${minutesToTime(block.start_minutes + block.duration_minutes)}`)
  const [showActions, setShowActions] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeInputRef = useRef<HTMLInputElement>(null)

  const height = minutesToPx(block.duration_minutes)
  const visualMinutes = (block.start_minutes - visualOffset + 1440) % 1440
  const top = minutesToPx(visualMinutes)

  const [isDraggingLocal, setIsDraggingLocal] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDraggingLocal(true)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    e.dataTransfer.effectAllowed = 'move'
    onDragStart(block, offsetY)
  }

  const handleDragEnd = () => {
    setIsDraggingLocal(false)
  }

  const handleLabelSubmit = () => {
    setEditing(false)
    onLabelUpdate(block.id, label)
  }

  const handleTimeSubmit = () => {
    setEditingTime(false)
    const parts = timeInput.split('-').map(p => p.trim())
    if (parts.length === 2) {
      const [startS, endS] = parts
      const startM = parseTime(startS)
      const endM = parseTime(endS)
      if (startM !== null && endM !== null && endM > startM) {
        onTimeUpdate(block.id, startM, endM - startM)
        return
      }
    }
    setTimeInput(`${minutesToTime(block.start_minutes)} - ${minutesToTime(block.start_minutes + block.duration_minutes)}`)
  }

  const parseTime = (s: string): number | null => {
    const [h, m] = s.split(':').map(Number)
    if (isNaN(h) || isNaN(m)) return null
    return h * 60 + m
  }

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const startY = e.clientY
    const startDuration = block.duration_minutes

    const onMouseMove = (moveEvent: MouseEvent) => {
      // visual update only if needed, or skip to mouseup for performance
    }

    const onMouseUp = (upEvent: MouseEvent) => {
      const deltaY = upEvent.clientY - startY
      const deltaMinutes = Math.round(deltaY / PIXELS_PER_MINUTE / 15) * 15
      const newDuration = Math.max(15, startDuration + deltaMinutes)
      onTimeUpdate(block.id, block.start_minutes, newDuration)
      setIsResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const isSmall = height < 50

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); if (editing) handleLabelSubmit() }}
      className={`absolute left-1 right-1 rounded-lg border border-gray-100 cursor-grab active:cursor-grabbing overflow-hidden select-none transition-all duration-300 ease-in-out ${cfg.bgColor} ${showActions ? 'shadow-md scale-[1.02] z-10' : 'z-1'} ${isDraggingLocal ? 'opacity-20' : 'opacity-100'}`}
      style={{ 
        top: top + 1, 
        height: Math.max(height, 24) - 2, 
        zIndex: showActions ? 10 : 1 
      }}
    >
      <div className="flex flex-col h-full p-2.5">
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0 flex-1">
            <div 
              onClick={(e) => { e.stopPropagation(); setEditing(true) }}
              className={`text-[11px] font-bold leading-tight truncate ${cfg.textColor} cursor-text hover:opacity-80 transition-opacity`}
            >
              {block.custom_label || cfg.label}
            </div>

            {!isSmall && (
              <div 
                onClick={(e) => { e.stopPropagation(); setEditingTime(true) }}
                className={`text-[10px] opacity-60 font-medium ${cfg.textColor} mt-0.5 cursor-text hover:opacity-100 transition-opacity`}
              >
                {editingTime ? (
                  <input
                    ref={timeInputRef}
                    value={timeInput}
                    onChange={e => setTimeInput(e.target.value)}
                    onBlur={handleTimeSubmit}
                    onKeyDown={e => e.key === 'Enter' && handleTimeSubmit()}
                    className="bg-white/30 border-none outline-none w-full rounded px-0.5"
                    autoFocus
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  `${minutesToTime(block.start_minutes)} - ${minutesToTime(block.start_minutes + block.duration_minutes)}`
                )}
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex gap-1">
              <button
                onClick={e => { e.stopPropagation(); onDelete(block.id) }}
                className="p-0.5 rounded hover:bg-red-100 transition-colors group"
              >
                <Trash2 className="w-3 h-3 text-red-400 group-hover:text-red-600" />
              </button>
            </div>
          )}
        </div>

        {editing && (
          <div className="mt-2">
            <input
              ref={inputRef}
              value={label}
              onChange={e => setLabel(e.target.value)}
              onBlur={handleLabelSubmit}
              onKeyDown={e => e.key === 'Enter' && handleLabelSubmit()}
              placeholder="Sửa tên khối..."
              className={`w-full text-[10px] bg-white/50 rounded px-1.5 py-1 border-none outline-none ${cfg.textColor} placeholder-opacity-50`}
              autoFocus
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

      </div>

      <div
        onMouseDown={startResizing}
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize group"
      >
        <div className="mx-auto w-8 h-1 rounded-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
      </div>
    </div>
  )
}
