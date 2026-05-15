'use client'

import { useState, useEffect } from 'react'
import { useFocus } from '@/contexts/FocusContext'
import { updateFocusSettings } from '@/app/(frontend)/pomodoro/actions'
import { Settings2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FloatingPortal } from '@floating-ui/react'

export default function FocusSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSettings } = useFocus()
  const [localSettings, setLocalSettings] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)

  // Sync local settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings)
    }
  }, [isOpen, settings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateFocusSettings(localSettings)
      updateSettings(localSettings)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-black/[0.02] hover:bg-black/[0.05] rounded-full transition-all text-black/40 hover:text-foreground border border-black/5"
      >
        <Settings2 className="w-4 h-4" />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase">Settings</span>
      </button>

      <FloatingPortal>
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                onClick={handleClose}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-black/5"
              >
                <div className="flex items-center justify-between p-8 border-b border-black/[0.03]">
                  <h2 className="text-xl font-black tracking-tighter text-foreground uppercase">Settings</h2>
                  <button onClick={handleClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <X className="w-5 h-5 text-black/20" />
                  </button>
                </div>

                <div className="p-8 flex flex-col gap-8 overflow-y-auto max-h-[70vh] no-scrollbar">
                  {/* Durations */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-black/30 uppercase tracking-[0.3em]">Durations (min)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Pomo', key: 'pomodoro_duration' },
                        { label: 'Short', key: 'short_break_duration' },
                        { label: 'Long', key: 'long_break_duration' }
                      ].map((item) => (
                        <div key={item.key} className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-black/40 uppercase">{item.label}</label>
                          <input 
                            type="number" min="1" 
                            className="w-full bg-black/[0.02] border border-black/5 rounded-2xl px-4 py-3 text-center font-black text-sm outline-none focus:border-primary/20 transition-all"
                            value={localSettings[item.key as keyof typeof localSettings] as number}
                            onChange={e => setLocalSettings({...localSettings, [item.key]: Number(e.target.value)})}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-black/[0.03] w-full" />

                  {/* Toggles */}
                  <div className="space-y-6">
                    {[
                      { label: 'Auto-start Breaks', key: 'auto_start_breaks' },
                      { label: 'Auto-start Pomodoros', key: 'auto_start_pomodoros' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">{item.label}</span>
                        <button 
                          onClick={() => setLocalSettings({...localSettings, [item.key]: !localSettings[item.key as keyof typeof localSettings]})}
                          className={`w-12 h-6 rounded-full relative transition-all duration-300 ${localSettings[item.key as keyof typeof localSettings] ? 'bg-primary' : 'bg-black/10'}`}
                        >
                          <motion.div 
                            animate={{ x: localSettings[item.key as keyof typeof localSettings] ? 26 : 4 }}
                            className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" 
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-black/[0.03] w-full" />

                  {/* Interval */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Long Break Interval</span>
                    <input 
                      type="number" min="1" 
                      className="w-20 bg-black/[0.02] border border-black/5 rounded-2xl px-4 py-3 text-center font-black text-sm outline-none"
                      value={localSettings.long_break_interval}
                      onChange={e => setLocalSettings({...localSettings, long_break_interval: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="p-8 border-t border-black/[0.03] flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-10 py-4 bg-primary text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
                  >
                    {isSaving ? 'Saving...' : 'Apply Changes'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  )
}
