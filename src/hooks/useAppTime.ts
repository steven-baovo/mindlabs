'use client'

import { useState, useEffect } from 'react'

/**
 * useAppTime - Custom hook for "Virtual Time"
 * Allows developers to override the current hour for testing UI logic
 * without changing the system clock.
 */
export function useAppTime() {
  const [now, setNow] = useState(new Date())
  const [mockHour, setMockHour] = useState<number | null>(null)

  useEffect(() => {
    // Sync with localStorage on mount
    const saved = localStorage.getItem('DEBUG_HOUR_OVERRIDE')
    if (saved !== null) {
      setMockHour(parseInt(saved))
    }

    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    // Listen for storage changes (to sync across tabs or from DevPanel)
    const handleStorage = () => {
      const val = localStorage.getItem('DEBUG_HOUR_OVERRIDE')
      setMockHour(val !== null ? parseInt(val) : null)
    }
    window.addEventListener('storage', handleStorage)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // If mockHour is set, we return a date object with that hour
  const getAppDate = () => {
    if (mockHour === null) return now
    const d = new Date(now)
    d.setHours(mockHour)
    return d
  }

  const setAppHour = (hour: number | null) => {
    if (hour === null) {
      localStorage.removeItem('DEBUG_HOUR_OVERRIDE')
    } else {
      localStorage.setItem('DEBUG_HOUR_OVERRIDE', hour.toString())
    }
    setMockHour(hour)
    // Trigger a manual storage event for this tab
    window.dispatchEvent(new Event('storage'))
  }

  const appDate = getAppDate()

  return {
    now: appDate,
    realNow: now,
    hour: appDate.getHours(),
    isMocked: mockHour !== null,
    setAppHour
  }
}
