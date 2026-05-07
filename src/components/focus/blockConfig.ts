import { BlockType } from '@/app/(frontend)/focus/actions'

export interface BlockConfig {
  type: BlockType
  label: string
  color: string        // bg color class
  border: string       // border color class
  textColor: string    // text color class
  icon: string         // emoji icon
  defaultDuration: number // in minutes
}

export const BLOCK_CONFIGS: Record<BlockType, BlockConfig> = {
  morning_routine: {
    type: 'morning_routine',
    label: 'Bắt đầu ngày mới',
    color: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-800',
    icon: '🌅',
    defaultDuration: 90,
  },
  deep_work: {
    type: 'deep_work',
    label: 'Làm việc sâu',
    color: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-800',
    icon: '🎯',
    defaultDuration: 90,
  },
  light_work: {
    type: 'light_work',
    label: 'Làm việc nhẹ',
    color: 'bg-green-50',
    border: 'border-green-200',
    textColor: 'text-green-800',
    icon: '📋',
    defaultDuration: 60,
  },
  break: {
    type: 'break',
    label: 'Nghỉ ngơi',
    color: 'bg-gray-50',
    border: 'border-gray-200',
    textColor: 'text-gray-600',
    icon: '☕',
    defaultDuration: 30,
  },
  lunch: {
    type: 'lunch',
    label: 'Nghỉ trưa',
    color: 'bg-orange-50',
    border: 'border-orange-200',
    textColor: 'text-orange-800',
    icon: '🍱',
    defaultDuration: 60,
  },
  exercise: {
    type: 'exercise',
    label: 'Tập thể dục',
    color: 'bg-red-50',
    border: 'border-red-200',
    textColor: 'text-red-800',
    icon: '🏃',
    defaultDuration: 60,
  },
  wind_down: {
    type: 'wind_down',
    label: 'Kết thúc ngày',
    color: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-800',
    icon: '🌙',
    defaultDuration: 60,
  },
  sleep: {
    type: 'sleep',
    label: 'Ngủ',
    color: 'bg-indigo-100',
    border: 'border-indigo-300',
    textColor: 'text-indigo-900',
    icon: '😴',
    defaultDuration: 480,
  },
}

export const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
export const DAY_LABELS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']

// Board settings
export const MINUTES_PER_DAY = 1440
export const START_HOUR = 0      // 00:00
export const END_HOUR = 24       // 24:00
export const PIXELS_PER_MINUTE = 1.2  // 1 minute = 1.2px → 1 hour = 72px
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
