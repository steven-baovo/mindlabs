import { BlockType } from '@/app/(frontend)/clarity/actions'
import { Layout, Coffee, Sun, Dumbbell, Moon, Users, Palette } from 'lucide-react'

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
  connection: {
    type: 'connection',
    label: 'Cuộc hẹn',
    icon: Users,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    defaultDuration: 60,
  },
  custom: {
    type: 'custom',
    label: 'Tùy chỉnh',
    icon: Palette,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    defaultDuration: 60,
  },
}

export const CUSTOM_COLORS = [
  { bg: 'bg-gray-100', text: 'text-gray-700' },
  { bg: 'bg-red-100', text: 'text-red-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-green-100', text: 'text-green-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
]

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
