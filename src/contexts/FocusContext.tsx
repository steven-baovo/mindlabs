'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { loadFocusSettings, logFocusSession } from '@/app/(frontend)/pomodoro/actions'

export type FocusMode = 'pomodoro' | 'short_break' | 'long_break'

interface FocusSettings {
  pomodoro_duration: number
  short_break_duration: number
  long_break_duration: number
  auto_start_breaks: boolean
  auto_start_pomodoros: boolean
  long_break_interval: number
  alarm_sound: string
  ticking_sound: string
}

interface FocusContextType {
  mode: FocusMode
  timeLeft: number
  isActive: boolean
  settings: FocusSettings
  pomodorosCompleted: number
  activeTaskId: string | null
  setMode: (mode: FocusMode) => void
  toggleTimer: () => void
  skipTimer: () => void
  setActiveTaskId: (id: string | null) => void
  updateSettings: (newSettings: Partial<FocusSettings>) => void
  formatTime: (seconds: number) => string
}

const defaultSettings: FocusSettings = {
  pomodoro_duration: 25,
  short_break_duration: 5,
  long_break_duration: 15,
  auto_start_breaks: false,
  auto_start_pomodoros: false,
  long_break_interval: 4,
  alarm_sound: 'bell',
  ticking_sound: 'none'
}

const FocusContext = createContext<FocusContextType | undefined>(undefined)

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<FocusSettings>(defaultSettings)
  const [mode, setMode] = useState<FocusMode>('pomodoro')
  const [timeLeft, setTimeLeft] = useState(defaultSettings.pomodoro_duration * 60)
  const [isActive, setIsActive] = useState(false)
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null)
  const tickingAudioRef = useRef<HTMLAudioElement | null>(null)
  
  // Load settings and tasks on mount
  useEffect(() => {
    async function load() {
      // 1. Check if logged in
      const { data: dbSettings, error } = await loadFocusSettings()
      
      if (dbSettings) {
        // Logged in mode
        setSettings(dbSettings)
        setTimeLeft(dbSettings.pomodoro_duration * 60)
      } else {
        // Guest mode - load from localStorage
        const localSettings = localStorage.getItem('mindfocus_settings')
        if (localSettings) {
          const parsed = JSON.parse(localSettings)
          setSettings(parsed)
          setTimeLeft(parsed.pomodoro_duration * 60)
        }
      }
    }
    load()
    
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }

    // Setup audio elements
    if (typeof window !== 'undefined') {
      alarmAudioRef.current = new Audio('https://pixabay.com/static/audio/2022/03/15/audio_73229007f5.mp3')
      tickingAudioRef.current = new Audio('https://actions.google.com/sounds/v1/tools/clock_ticking.ogg')
      tickingAudioRef.current.loop = true
    }
  }, [])

  // Sync timeLeft when mode or settings change (only if not active)
  useEffect(() => {
    if (!isActive) {
      if (mode === 'pomodoro') setTimeLeft(settings.pomodoro_duration * 60)
      else if (mode === 'short_break') setTimeLeft(settings.short_break_duration * 60)
      else if (mode === 'long_break') setTimeLeft(settings.long_break_duration * 60)
    }
  }, [mode, settings])

  // Timer tick logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (settings.ticking_sound !== 'none' && tickingAudioRef.current) {
        tickingAudioRef.current.play().catch(() => {})
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else {
      if (tickingAudioRef.current) tickingAudioRef.current.pause()
      if (isActive && timeLeft === 0) handleTimerComplete()
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (tickingAudioRef.current) tickingAudioRef.current.pause()
    }
  }, [isActive, timeLeft, settings.ticking_sound])

  const handleTimerComplete = async () => {
    setIsActive(false)
    if (tickingAudioRef.current) tickingAudioRef.current.pause()

    if (alarmAudioRef.current) {
      alarmAudioRef.current.currentTime = 0
      alarmAudioRef.current.volume = 0.8
      alarmAudioRef.current.play().catch(e => console.log('Audio play failed:', e))
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const title = mode === 'pomodoro' ? 'Time to take a break!' : 'Time to focus!'
      const body = mode === 'pomodoro' ? 'Great job! You finished a focus session.' : 'Break is over. Let\'s get back to work.'
      new Notification(title, { body, icon: '/favicon.ico' })
    }

    let duration = 0
    if (mode === 'pomodoro') duration = settings.pomodoro_duration
    else if (mode === 'short_break') duration = settings.short_break_duration
    else if (mode === 'long_break') duration = settings.long_break_duration

    // Log session (Server handles guest check inside logFocusSession)
    const { error } = await logFocusSession(activeTaskId, mode, duration)
    
    if (error === 'Unauthorized') {
      // Guest mode session logging
      const session = {
        id: Math.random().toString(36).substr(2, 9),
        task_id: activeTaskId,
        session_type: mode,
        duration_minutes: duration,
        completed_at: new Date().toISOString()
      }
      const local = localStorage.getItem('mindfocus_sessions')
      const sessions = local ? JSON.parse(local) : []
      localStorage.setItem('mindfocus_sessions', JSON.stringify([session, ...sessions]))

      // If it's a pomodoro and linked to a task, increment local task count
      if (mode === 'pomodoro' && activeTaskId) {
        const localTasks = localStorage.getItem('mindfocus_tasks')
        if (localTasks) {
          const tasks = JSON.parse(localTasks)
          const updated = tasks.map((t: any) => 
            t.id === activeTaskId ? { ...t, completed_pomodoros: t.completed_pomodoros + 1 } : t
          )
          localStorage.setItem('mindfocus_tasks', JSON.stringify(updated))
          // We need a way to refresh the UI tasks, but for now this works on reload
        }
      }
    }

    if (mode === 'pomodoro') {
      const newCount = pomodorosCompleted + 1
      setPomodorosCompleted(newCount)
      const isLongBreak = newCount % settings.long_break_interval === 0
      const nextMode = isLongBreak ? 'long_break' : 'short_break'
      setMode(nextMode)
      if (settings.auto_start_breaks) setIsActive(true)
    } else {
      setMode('pomodoro')
      if (settings.auto_start_pomodoros) setIsActive(true)
    }
  }

  const toggleTimer = () => setIsActive(!isActive)
  const skipTimer = () => { setIsActive(false); handleTimerComplete() }

  const updateSettingsState = (newSettings: Partial<FocusSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    // Save to localStorage if guest
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindfocus_settings', JSON.stringify(updated))
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <FocusContext.Provider value={{
      mode,
      timeLeft,
      isActive,
      settings,
      pomodorosCompleted,
      activeTaskId,
      setMode,
      toggleTimer,
      skipTimer,
      setActiveTaskId,
      updateSettings: updateSettingsState,
      formatTime
    }}>
      {children}
    </FocusContext.Provider>
  )
}

export function useFocus() {
  const context = useContext(FocusContext)
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider')
  }
  return context
}
