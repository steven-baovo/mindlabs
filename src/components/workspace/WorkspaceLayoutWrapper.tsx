'use client'

import { usePathname } from 'next/navigation'
import WorkspaceLayoutSidebar from './WorkspaceLayoutSidebar'

const DEEP_WORKSPACE = /^\/(mindnote|mindmap)\/.+/
const LIST_ROUTE = /^\/(mindnote|mindmap)$/

export default function WorkspaceLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDeepWorkspace = DEEP_WORKSPACE.test(pathname || '')
  const isListRoute = LIST_ROUTE.test(pathname || '')

  if (isDeepWorkspace) {
    return (
      <div className="flex w-full h-screen">
        <WorkspaceLayoutSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    )
  }

  if (isListRoute) {
    return (
      <div className="flex pt-6 px-4 pb-4 gap-4 min-h-screen">
        <WorkspaceLayoutSidebar />
        <main className="flex-1 min-w-0 h-auto no-scrollbar relative">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="pt-[120px] px-4 pb-4 min-h-screen">
      <main className="w-full h-auto no-scrollbar relative">
        {children}
      </main>
    </div>
  )
}
