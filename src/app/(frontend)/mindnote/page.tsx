import { FileText, Network } from 'lucide-react'
import { createNote } from '@/app/(frontend)/mindnote/actions'
import { createMindmap } from '@/app/(frontend)/mindmap/actions'

export default function WorkspaceDashboardPage() {
  const handleCreateNoteAction = async () => {
    'use server'
    await createNote()
  }

  const handleCreateMapAction = async () => {
    'use server'
    await createMindmap()
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-white px-6 h-full min-h-[calc(100vh-56px)]">
      <div className="text-center max-w-2xl mb-16">
        <h1 className="text-4xl font-black text-foreground tracking-tight mb-4">
          Personal Workspace
        </h1>
        <p className="text-secondary text-sm font-medium opacity-70">
          Select a tool to begin your creative session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <form action={handleCreateNoteAction} className="h-full">
          <button
            type="submit"
            className="w-full group flex items-center gap-6 p-6 bg-white border border-border-main rounded-card hover:border-primary/40 hover:bg-background/50 transition-all duration-300 cursor-pointer text-left"
          >
            <div className="w-12 h-12 rounded-main bg-background border border-border-main flex items-center justify-center group-hover:bg-white transition-colors">
              <FileText className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">New Note</p>
              <p className="text-xs text-secondary mt-0.5">Start a simple text document.</p>
            </div>
          </button>
        </form>

        <form action={handleCreateMapAction} className="h-full">
          <button
            type="submit"
            className="w-full group flex items-center gap-6 p-6 bg-white border border-border-main rounded-card hover:border-primary/30 hover:bg-background transition-all duration-300 cursor-pointer text-left"
          >
            <div className="w-12 h-12 rounded-main bg-background border border-border-main flex items-center justify-center group-hover:bg-white transition-colors">
              <Network className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">New Canvas</p>
              <p className="text-xs text-secondary mt-0.5">Create a visual mindmap.</p>
            </div>
          </button>
        </form>
      </div>
    </main>
  )
}
