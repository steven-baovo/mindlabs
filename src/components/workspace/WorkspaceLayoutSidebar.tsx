'use client'

import { usePathname } from 'next/navigation'
import ResourceSidebar from './ResourceSidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

// Show ResourceSidebar on /mindnote, /mindmap, and any child routes
const WORKSPACE_ROUTE = /^\/(mindnote|mindmap)/
// Only pass activeTitle/isSaving when inside a specific document
const RESOURCE_ROUTE = /^\/(mindnote|mindmap)\/[\w-]+/

export default function WorkspaceLayoutSidebar() {
  const pathname = usePathname()
  const { title, setTitle, isSaving } = useWorkspace()

  if (!WORKSPACE_ROUTE.test(pathname || '')) return null

  const isResourcePage = RESOURCE_ROUTE.test(pathname || '')

  return (
    <ResourceSidebar
      activeTitle={isResourcePage ? title : undefined}
      onTitleChange={isResourcePage ? setTitle : undefined}
      isSaving={isResourcePage ? isSaving : false}
    />
  )
}
