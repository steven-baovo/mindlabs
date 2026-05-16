'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ResourceSidebar from './workspace/ResourceSidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { usePathname } from 'next/navigation'

interface MobileResourceSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const RESOURCE_ROUTE = /^\/mindspace\/(note|canvas)\/[\w-]+/

export default function MobileResourceSidebar({ isOpen, onClose }: MobileResourceSidebarProps) {
  const { title, setTitle, isSaving } = useWorkspace()
  const pathname = usePathname()
  const isResourcePage = RESOURCE_ROUTE.test(pathname || '')

  // Automatically close the sidebar when the route changes (e.g., user selects a note/map)
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] lg:hidden"
          />

          {/* Resource Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[160] lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-black/5">
              <span className="text-sm font-black uppercase tracking-widest text-foreground">
                Tài liệu của tôi
              </span>
              <button 
                onClick={onClose}
                className="p-2 bg-gray-50 rounded-full text-secondary hover:text-foreground active:scale-90 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden" onClick={(e) => {
               // Close drawer if a link is clicked inside ResourceSidebar
               if ((e.target as HTMLElement).closest('a')) {
                 onClose()
               }
            }}>
              <ResourceSidebar 
                activeTitle={isResourcePage ? title : undefined}
                onTitleChange={isResourcePage ? setTitle : undefined}
                isSaving={isResourcePage ? isSaving : false}
                isMobile={true}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
