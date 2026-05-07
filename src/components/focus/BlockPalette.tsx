'use client'

import { BlockType } from '@/app/(frontend)/focus/actions'
import { BLOCK_CONFIGS } from './blockConfig'

interface Props {
  onDragStart: (type: BlockType) => void
  customDurations: Record<BlockType, number>
  onDurationChange: (type: BlockType, duration: number) => void
}

export default function BlockPalette({ onDragStart, customDurations, onDurationChange }: Props) {
  const blocks = Object.values(BLOCK_CONFIGS)

  return (
    <div className="w-44 shrink-0">
      <div className="sticky top-20">
        <p className="text-[12px] font-black text-[#1a2b49] uppercase tracking-widest mb-4">
          Khối thời gian
        </p>

        <div className="flex flex-col gap-2">
          {blocks.map(cfg => (
            <div
              key={cfg.type}
              draggable
              onDragStart={() => onDragStart(cfg.type)}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white cursor-grab active:cursor-grabbing transition-all hover:bg-gray-50"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.bgColor} ${cfg.textColor}`}>
                <cfg.icon className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-gray-700 leading-tight">
                  {cfg.label}
                </div>
                <div className="flex items-center text-[10px] text-gray-400 font-medium mt-0.5">
                  <input
                    type="text"
                    value={customDurations[cfg.type]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      onDurationChange(cfg.type, val);
                    }}
                    onClick={e => e.stopPropagation()}
                    style={{ width: `${String(customDurations[cfg.type]).length || 1}ch` }}
                    className="bg-transparent border-none outline-none focus:text-gray-600 transition-colors p-0 text-right"
                  />
                  <span className="ml-1 text-[10px] text-gray-400">phút</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-gray-300 mt-4 leading-relaxed">
          Kéo khối vào cột ngày để thêm vào lịch của bạn.
        </p>
      </div>
    </div>
  )
}
