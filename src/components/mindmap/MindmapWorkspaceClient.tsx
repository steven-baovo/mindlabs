'use client'

// Simplified wrapper: chỉ giữ overflow-hidden cho canvas
// Title/isSaving state được quản lý bởi MindmapBoard → WorkspaceContext → WorkspaceLayoutSidebar
export default function MindmapWorkspaceClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-[calc(100vh-80px)] overflow-hidden bg-[#fcfdfe]">
      {children}
    </div>
  )
}
