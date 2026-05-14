'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Home, FileText, Sparkles, Cloud, CloudCheck, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import UserMenu from './UserMenu'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const DEEP_WORKSPACE = /^\/(mindnote|mindmap)\/[\w-]+/

const NAV_ITEMS = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Mindnote', icon: FileText, href: '/mindnote' },
  { name: 'MindAI', icon: Sparkles, href: '/mindai' },
  { name: 'Clarity', icon: Calendar, href: '/clarity' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isSaving } = useWorkspace()
  const [isExpanded, setIsExpanded] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
    }
    getUser()
  }, [])

  // Only render in deep workspace (specific document open)
  if (!DEEP_WORKSPACE.test(pathname)) return null

  const backHref = pathname.startsWith('/mindmap/') ? '/mindmap' : '/mindnote'

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -80, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-[90] pointer-events-auto"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Hover trigger hint — vệt mờ tinh tế khi collapsed */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -left-1 inset-y-4 w-[3px] bg-primary/25 rounded-full"
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{ width: isExpanded ? 200 : 60 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="overflow-hidden glass rounded-[28px] shadow-2xl border-white/30 flex flex-col py-5 gap-1"
        style={{ minHeight: 320 }}
      >
        {/* Back button */}
        <Link
          href={backHref}
          className="mx-2 flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-black/5 transition-all group mb-2"
          title="Back"
        >
          <ChevronLeft strokeWidth={1.5} className="w-5 h-5 text-primary shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="text-premium text-foreground whitespace-nowrap overflow-hidden"
              >
                Back
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Divider */}
        <div className="mx-4 h-px bg-border-main/40 mb-1" />

        {/* Nav Items */}
        <div className="flex flex-col gap-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-foreground/[0.06] text-foreground'
                    : 'text-secondary hover:bg-black/5 hover:text-foreground'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <item.icon
                  strokeWidth={isActive ? 2 : 1.5}
                  className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-secondary/70 group-hover:text-foreground'}`}
                />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2, delay: 0.08 }}
                      className="text-[12px] font-bold tracking-tight whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-border-main/40 mt-1" />

        {/* Save Status */}
        <div className="mx-2 flex items-center gap-3 px-3 py-2.5 rounded-2xl text-secondary mt-1">
          {isSaving ? (
            <Cloud strokeWidth={1.5} className="w-5 h-5 text-primary animate-pulse shrink-0" />
          ) : (
            <CloudCheck strokeWidth={1.5} className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="text-premium text-secondary whitespace-nowrap"
              >
                {isSaving ? 'Saving...' : 'All saved'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        {user && (
          <div className="mx-2 flex items-center gap-3 px-2 py-2 rounded-2xl mt-auto">
            <UserMenu user={user} profile={profile} />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2, delay: 0.12 }}
                  className="text-[11px] font-bold text-foreground truncate whitespace-nowrap max-w-[100px]"
                >
                  {profile?.display_name || user?.email?.split('@')[0]}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
