import { BlockType } from '@/app/(frontend)/focus/actions'
import { Layout, Coffee, Sun, Dumbbell, Moon } from 'lucide-react'

export interface BlockConfig {
  type: BlockType
  label: string
  bgColor: string       // bg color class
  textColor: string     // text color class
  icon: any             // Lucide icon component
  defaultDuration: number // in minutes
}

export const BLOCK_CONFIGS: Record<BlockType, BlockConfig> = {
  morning_routine: {
    type: 'morning_routine',
    label: 'Bắt đầu ngày mới',
    icon: Sun,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    defaultDuration: 90,
  },
  deep_work: {
    type: 'deep_work',
    label: 'Làm việc sâu',
    icon: Layout,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    defaultDuration: 90,
  },
  light_work: {
    type: 'light_work',
    label: 'Làm việc nhẹ',
    icon: Coffee,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    defaultDuration: 30,
  },
  break: {
    type: 'break',
    label: 'Nghỉ giải lao',
    icon: Sun,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    defaultDuration: 15,
  },
  exercise: {
    type: 'exercise',
    label: 'Tập thể dục',
    icon: Dumbbell,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    defaultDuration: 45,
  },
  wind_down: {
    type: 'wind_down',
    label: 'Thư giãn',
    icon: Moon,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    defaultDuration: 60,
  },
}

export const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

// Board settings
export const MINUTES_PER_DAY = 1440
export const START_HOUR = 0      // 00:00
export const END_HOUR = 24       // 24:00
export const PIXELS_PER_MINUTE = 1.2
export const SNAP_MINUTES = 30   // Snap to 30-min grid

export function minutesToPx(minutes: number): number {
  return minutes * PIXELS_PER_MINUTE
}

export function pxToMinutes(px: number): number {
  return Math.round(px / PIXELS_PER_MINUTE / SNAP_MINUTES) * SNAP_MINUTES
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}
