'use client'

import { useState, useEffect } from 'react'
import MobileNavbar from './MobileNavbar'
import MobileSidebar from './MobileSidebar'
import MobileResourceSidebar from './MobileResourceSidebar'
import MobileResourceButton from './MobileResourceButton'

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
      <MobileResourceButton onClick={() => setIsResourceOpen(true)} />
      
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

      <MobileNavbar onMenuClick={() => setIsSidebarOpen(true)} />
    </>
  )
}
