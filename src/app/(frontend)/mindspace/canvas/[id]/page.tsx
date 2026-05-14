import { loadMindmap } from '../actions'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ReactFlowProvider } from '@xyflow/react'
import MindmapWorkspaceClient from '@/components/mindmap/MindmapWorkspaceClient'

const MindmapBoard = dynamic(() => import('@/components/mindmap/MindmapBoard'), {
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-secondary animate-pulse">Đang tải bản đồ...</p>
      </div>
    </div>
  )
})

export const metadata = {
  title: 'Canvas | Mindlabs',
}

export default async function MindmapWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: mindmap, error } = await loadMindmap(id)

  if (error || !mindmap) {
    return notFound()
  }

  // Ensure nodes and edges are arrays (handle default empty JSONB)
  const initialNodes = Array.isArray(mindmap.nodes) ? mindmap.nodes : []
  const initialEdges = Array.isArray(mindmap.edges) ? mindmap.edges : []

  return (
    <MindmapWorkspaceClient>
      {/* Hide global footer on this page */}
      <style dangerouslySetInnerHTML={{ __html: `
        footer { display: none !important; }
        body { overflow: hidden !important; }
      ` }} />
      
      <ReactFlowProvider>
        <MindmapBoard 
          mindmapId={mindmap.id}
          initialTitle={mindmap.title}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
        />
      </ReactFlowProvider>
    </MindmapWorkspaceClient>
  )
}
