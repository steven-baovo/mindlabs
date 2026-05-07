'use client'

import { BlockType } from '@/app/(frontend)/focus/actions'
import { BLOCK_CONFIGS } from './blockConfig'

interface Props {
  onDragStart: (type: BlockType) => void
}

export default function BlockPalette({ onDragStart }: Props) {
  const blocks = Object.values(BLOCK_CONFIGS)

  return (
    <div className="w-44 shrink-0">
      <div className="sticky top-20">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Khối thời gian
        </p>
        <div className="flex flex-col gap-2">
          {blocks.map(cfg => (
            <div
              key={cfg.type}
              draggable
              onDragStart={() => onDragStart(cfg.type)}
              className={`
                flex items-center gap-2 p-2.5 rounded-xl border cursor-grab active:cursor-grabbing
                transition-all hover:shadow-md hover:scale-[1.02]
                ${cfg.color} ${cfg.border}
              `}
            >
              <span className="text-base leading-none">{cfg.icon}</span>
              <div className="min-w-0">
                <div className={`text-[11px] font-bold leading-tight ${cfg.textColor}`}>
                  {cfg.label}
                </div>
                <div className={`text-[9px] opacity-60 mt-0.5 ${cfg.textColor}`}>
                  {cfg.defaultDuration >= 60
                    ? `${cfg.defaultDuration / 60}h`
                    : `${cfg.defaultDuration}p`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hint */}
        <p className="text-[9px] text-gray-300 mt-4 leading-relaxed">
          Kéo khối vào cột ngày để thêm vào lịch của bạn.
        </p>
      </div>
    </div>
  )
}
