'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Home, FileText, Sparkles, Cloud, CloudCheck, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import UserMenu from './UserMenu'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const DEEP_WORKSPACE = /^\/(mindnote|mindmap)/

const NAV_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Mindnote', href: '/mindnote', icon: FileText },
  { name: 'MindAI', href: '/mindai', icon: Sparkles },
]

export default function Header() {
  const pathname = usePathname()
  const { isSaving } = useWorkspace()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  const isDeepWorkspace = DEEP_WORKSPACE.test(pathname)

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

  return (
    <motion.header
      layout
      initial={false}
      animate={{
        ...(isDeepWorkspace ? {
          width: '300px',
          left: 'calc(100% - 324px)',
          x: 0,
        } : {
          width: '100%',
          maxWidth: '1280px',
          left: '50%',
          x: '-50%',
        }),
        top: '24px',
      }}
      transition={{ 
        layout: { type: 'spring', stiffness: 300, damping: 30 }
      }}
      className="fixed z-[100] px-6 pointer-events-none"
    >
      <div className="flex h-12 w-full items-center justify-between px-6 glass rounded-full shadow-premium pointer-events-auto border border-black/75 ring-1 ring-white/50 relative group/header backdrop-blur-[64px] backdrop-saturate-[250%]">
        {/* Atmospheric Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000 rounded-full" />
        
        {/* Logo Section */}
        {!isDeepWorkspace && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6 relative z-10"
          >
            <Link href="/" className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-1 group/logo">
              Mindlabs<span className="w-1.5 h-1.5 rounded-full bg-primary group-hover/logo:scale-150 transition-transform duration-500" />
            </Link>
          </motion.div>
        )}

        {/* Center Nav */}
        {!isDeepWorkspace && (
          <nav className="hidden md:flex items-center gap-1 relative z-10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-1.5 rounded-full text-[12px] font-bold transition-all duration-300 group/nav ${
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {pathname === item.href && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-foreground/5 rounded-full -z-10"
                  />
                )}
                {item.name}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary/40 rounded-full group-hover/nav:w-1 transition-all duration-300" />
              </Link>
            ))}
          </nav>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto relative z-10">
          {!isDeepWorkspace && (
            <div className="hidden sm:flex items-center bg-black/5 rounded-full px-4 py-1 border border-black/5 focus-within:border-primary/20 transition-all w-44 group/search">
              <Search strokeWidth={2.5} className="w-3 h-3 text-foreground/50 group-focus-within/search:text-primary transition-colors mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-[10px] text-foreground placeholder-foreground/30 w-full font-bold uppercase tracking-widest"
              />
            </div>
          )}

          {isDeepWorkspace && (
            <div className="flex items-center gap-1 mr-2 bg-black/5 rounded-full p-0.5">
              {[
                { href: '/', icon: Home, title: 'Home' },
                { href: '/clarity', icon: Calendar, title: 'Clarity' },
                { href: '/mindai', icon: Sparkles, title: 'MindAI' }
              ].map((link, i) => (
                <Link 
                  key={i}
                  href={link.href} 
                  className="p-1.5 rounded-full hover:bg-white/90 text-foreground/60 hover:text-primary transition-all active:scale-90"
                  title={link.title}
                >
                  <link.icon strokeWidth={2.5} className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {!isDeepWorkspace && (
                <button className="p-1.5 text-foreground/60 hover:text-foreground transition-colors relative group/bell">
                  <Bell strokeWidth={2.5} className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full border-2 border-white" />
                </button>
              )}
              <UserMenu user={user} profile={profile} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-[11px] font-black text-foreground/60 hover:text-foreground uppercase tracking-widest transition-colors px-2">
                Log in
              </Link>
              <Link href="/register" className="bg-foreground text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all active:scale-95 shadow-lg">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
