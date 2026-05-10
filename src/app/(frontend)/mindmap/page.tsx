import { loadMindmaps } from './actions'
import Link from 'next/link'
import CreateMindmapButton from '@/components/mindmap/CreateMindmapButton'
import { FileDown, Calendar, Plus } from 'lucide-react'

export const metadata = {
  title: 'Mindmaps | Mindlabs',
}

export default async function MindmapPage() {
  const { data: mindmaps, error } = await loadMindmaps()

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-12 border-b border-[#e5e5e5] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Canvas</h1>
          <p className="text-gray-500 mt-2 text-sm">Không gian thuần túy cho những suy nghĩ mạch lạc</p>
        </div>
        <CreateMindmapButton />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-sm">
          {error}
        </div>
      )}

      {mindmaps && mindmaps.length === 0 && !error && (
        <div className="text-center py-20 border-2 border-dashed border-[#e5e5e5] rounded-2xl bg-gray-50/50">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-4">
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No canvas yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Create your first canvas to start visually organizing your thoughts and ideas.
          </p>
          <CreateMindmapButton />
        </div>
      )}

      {mindmaps && mindmaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mindmaps.map((mindmap) => (
            <Link
              key={mindmap.id}
              href={`/mindmap/${mindmap.id}`}
              className="group block border border-[#e5e5e5] rounded-xl p-6 hover:shadow-md hover:border-gray-200 transition-all bg-white"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2">
                {mindmap.title}
              </h3>
              <div className="flex items-center text-xs text-gray-400 gap-4 mt-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(mindmap.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileDown className="w-3.5 h-3.5" />
                  Canvas
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
