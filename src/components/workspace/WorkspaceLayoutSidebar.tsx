'use client'

import { usePathname } from 'next/navigation'
import ResourceSidebar from './ResourceSidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

// Regex: chỉ show title section khi đang ở trang resource cụ thể
const RESOURCE_ROUTE = /^\/(mindnote|mindmap)\/[\w-]+/
const WORKSPACE_ROUTE = /^\/(mindnote|mindmap)/

export default function WorkspaceLayoutSidebar() {
  const pathname = usePathname()
  const { title, setTitle, isSaving } = useWorkspace()

  if (!WORKSPACE_ROUTE.test(pathname || '')) return null

  const isResourcePage = RESOURCE_ROUTE.test(pathname || '')

  return (
    <ResourceSidebar
      activeTitle={isResourcePage ? title : undefined}
      onTitleChange={setTitle}
      isSaving={isSaving}
    />
  )
}
