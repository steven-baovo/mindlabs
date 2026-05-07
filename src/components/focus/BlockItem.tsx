'use client'

import { useState, useRef } from 'react'
import { FocusBlock } from '@/app/(frontend)/focus/actions'
import { BLOCK_CONFIGS, minutesToPx, minutesToTime, PIXELS_PER_MINUTE } from './blockConfig'
import { Trash2, GripVertical, Grip } from 'lucide-react'

interface Props {
  block: FocusBlock
  onDragStart: (block: FocusBlock, offsetY: number) => void
  onDelete: (id: string) => void
  onLabelUpdate: (id: string, label: string) => void
}

export default function BlockItem({ block, onDragStart, onDelete, onLabelUpdate }: Props) {
  const cfg = BLOCK_CONFIGS[block.block_type]
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(block.custom_label ?? '')
  const [showActions, setShowActions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const height = minutesToPx(block.duration_minutes)
  const top = minutesToPx(block.start_minutes)

  const handleDragStart = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    e.dataTransfer.effectAllowed = 'move'
    onDragStart(block, offsetY)
  }

  const handleLabelSubmit = () => {
    setEditing(false)
    onLabelUpdate(block.id, label)
  }

  const isSmall = height < 50

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); if (editing) handleLabelSubmit() }}
      className={`
        absolute left-1 right-1 rounded-lg border cursor-grab active:cursor-grabbing
        overflow-hidden transition-shadow hover:shadow-md select-none
        ${cfg.color} ${cfg.border}
      `}
      style={{ top, height: Math.max(height, 24), zIndex: showActions ? 10 : 1 }}
    >
      <div className="flex items-start gap-1 p-1.5 h-full">
        <Grip className={`w-3 h-3 mt-0.5 shrink-0 opacity-30 ${cfg.textColor}`} />
        <div className="flex-1 min-w-0">
          {!isSmall && (
            <div className={`text-[10px] font-bold leading-tight truncate ${cfg.textColor}`}>
              {cfg.icon} {cfg.label}
            </div>
          )}
          {isSmall && (
            <div className={`text-[9px] font-bold truncate ${cfg.textColor}`}>
              {cfg.icon} {minutesToTime(block.start_minutes)}
            </div>
          )}
          {!isSmall && editing ? (
            <input
              ref={inputRef}
              value={label}
              onChange={e => setLabel(e.target.value)}
              onBlur={handleLabelSubmit}
              onKeyDown={e => e.key === 'Enter' && handleLabelSubmit()}
              placeholder="Ghi chú ngắn..."
              className={`w-full text-[9px] bg-transparent border-none outline-none mt-0.5 ${cfg.textColor} placeholder-opacity-50`}
              autoFocus
              maxLength={60}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            !isSmall && label && (
              <div
                className={`text-[9px] opacity-70 truncate mt-0.5 ${cfg.textColor} cursor-text`}
                onClick={e => { e.stopPropagation(); setEditing(true) }}
              >
                {label}
              </div>
            )
          )}
          {!isSmall && !label && !editing && (
            <div
              className={`text-[9px] opacity-30 mt-0.5 ${cfg.textColor} cursor-text`}
              onClick={e => { e.stopPropagation(); setEditing(true) }}
            >
              + ghi chú
            </div>
          )}
        </div>

        {/* Delete button */}
        {showActions && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(block.id) }}
            className="shrink-0 p-0.5 rounded hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-2.5 h-2.5 text-red-400" />
          </button>
        )}
      </div>

      {/* Time label at bottom */}
      {height >= 60 && (
        <div className={`absolute bottom-1 right-2 text-[8px] opacity-40 font-mono ${cfg.textColor}`}>
          {minutesToTime(block.start_minutes)} – {minutesToTime(block.start_minutes + block.duration_minutes)}
        </div>
      )}
    </div>
  )
}
