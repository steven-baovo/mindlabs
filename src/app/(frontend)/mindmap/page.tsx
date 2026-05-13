import { redirect } from 'next/navigation'

// Mindmap landing page now redirects to the unified Workspace Dashboard at /mindnote
// Both Note and Mindmap resources are accessible from the right sidebar there.
export default function MindmapPage() {
  redirect('/mindnote')
}
