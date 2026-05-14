import { FileText, Network } from 'lucide-react'
import { createNote } from '@/app/(frontend)/mindspace/actions'
import { createMindmap } from '@/app/(frontend)/mindspace/canvas/actions'

export default function MindSpaceDashboardPage() {
  const handleCreateNoteAction = async () => {
    'use server'
    await createNote()
  }

  const handleCreateMapAction = async () => {
    'use server'
    await createMindmap()
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-background px-6 h-full min-h-full relative overflow-hidden">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="inline-flex items-center justify-center px-3 py-1 mb-6 rounded-full border border-primary/10 bg-primary/5 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Creative Suite</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-foreground tracking-tighter mb-6 leading-[0.9]">
          MindSpace
        </h1>
        <p className="text-secondary text-lg font-medium opacity-50 max-w-md mx-auto leading-relaxed">
          Không gian chung khơi nguồn ý tưởng, lưu trữ ghi chép và sơ đồ tư duy.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        <form action={handleCreateNoteAction} className="h-full">
          <button
            type="submit"
            className="w-full h-full group glass rounded-ncmaz p-8 flex flex-col items-start gap-8 hover:bg-white/80 transition-all duration-500 cursor-pointer text-left hover:scale-[1.02] hover:shadow-premium"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground tracking-tight">New Note</p>
              <p className="text-sm text-secondary mt-2 opacity-70 group-hover:opacity-100 transition-opacity">Start a clean, distraction-free text document.</p>
            </div>
          </button>
        </form>

        <form action={handleCreateMapAction} className="h-full">
          <button
            type="submit"
            className="w-full h-full group glass rounded-ncmaz p-8 flex flex-col items-start gap-8 hover:bg-white/80 transition-all duration-500 cursor-pointer text-left hover:scale-[1.02] hover:shadow-premium"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-border-main flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
              <Network className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground tracking-tight">New Canvas</p>
              <p className="text-sm text-secondary mt-2 opacity-70 group-hover:opacity-100 transition-opacity">Map out your ideas visually on an infinite canvas.</p>
            </div>
          </button>
        </form>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
        <div className="w-1 h-1 rounded-full bg-primary" />
        Design System v2.0
      </div>
    </main>
  )
}
