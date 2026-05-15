'use client'

import { useState, useEffect } from 'react'
import MobileHeader from './MobileHeader'
import MobileNavbar from './MobileNavbar'
import MobileSidebar from './MobileSidebar'
import MobileResourceSidebar from './MobileResourceSidebar'

interface MobileNavigationWrapperProps {
  user: any
  profile: any
}

export default function MobileNavigationWrapper({ user, profile }: MobileNavigationWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isResourceOpen, setIsResourceOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <MobileHeader 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onResourceClick={() => setIsResourceOpen(true)}
      />
      
      <MobileSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
        profile={profile} 
      />

      <MobileResourceSidebar 
        isOpen={isResourceOpen}
        onClose={() => setIsResourceOpen(false)}
      />

      <MobileNavbar />
    </>
  )
}
