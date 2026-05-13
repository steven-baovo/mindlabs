import { createNote } from './actions'
import { createMindmap } from '../mindmap/actions'
import { redirect } from 'next/navigation'
import { FileText, Network } from 'lucide-react'

export const metadata = {
  title: 'Workspace | Mindlabs',
}

async function handleCreateNote() {
  'use server'
  await createNote()
}

async function handleCreateMap() {
  'use server'
  const { data } = await createMindmap()
  if (data) redirect(`/mindmap/${data.id}`)
}

export default function WorkspaceDashboardPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 bg-white px-6 h-full min-h-[calc(100vh-56px)]">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Workspace</h1>
        <p className="text-gray-400 text-sm mt-1 font-light">Bắt đầu một ý tưởng mới hoặc tiếp tục công việc của bạn</p>
      </div>

      <div className="flex gap-4">
        <form action={handleCreateNote}>
          <button
            type="submit"
            className="group flex flex-col items-center gap-3 px-10 py-8 bg-white border border-[#e5e5e5] rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <FileText className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">Ghi chú mới</p>
              <p className="text-xs text-gray-400 mt-0.5">Bắt đầu viết ngay</p>
            </div>
          </button>
        </form>

        <form action={handleCreateMap}>
          <button
            type="submit"
            className="group flex flex-col items-center gap-3 px-10 py-8 bg-white border border-[#e5e5e5] rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Network className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">Canvas mới</p>
              <p className="text-xs text-gray-400 mt-0.5">Vẽ sơ đồ tư duy</p>
            </div>
          </button>
        </form>
      </div>
    </main>
  )
}

