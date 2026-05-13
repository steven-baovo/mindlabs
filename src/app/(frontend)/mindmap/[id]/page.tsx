import { loadMindmap } from '../actions'
import { notFound } from 'next/navigation'
import MindmapBoard from '@/components/mindmap/MindmapBoard'
import { ReactFlowProvider } from '@xyflow/react'
import MindmapWorkspaceClient from '@/components/mindmap/MindmapWorkspaceClient'

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

