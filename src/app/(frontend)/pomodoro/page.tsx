import FocusTimer from '@/components/focus/FocusTimer'
import FocusTasks from '@/components/focus/FocusTasks'
import FocusSettings from '@/components/focus/FocusSettings'

export default function PomodoroPage() {
  return (
    <main className="flex-1 flex flex-col items-center bg-white px-6 py-20 h-full min-h-full relative overflow-y-auto no-scrollbar">
      {/* Top Navigation - Ultra Minimal */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-16 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <h1 className="text-xl font-black text-foreground tracking-tighter uppercase">MindFocus</h1>
        </div>
        <FocusSettings />
      </div>

      {/* Center Container */}
      <div className="w-full max-w-3xl flex flex-col gap-12 relative z-10">
        {/* Main Timer */}
        <FocusTimer />

        {/* Tasks Section - Integrated & Flat */}
        <div className="mt-8 border-t border-black/[0.03] pt-12">
          <FocusTasks />
        </div>
      </div>

      {/* Footer Hint */}
      <div className="mt-20 text-[10px] font-black uppercase tracking-[0.4em] text-black/10">
        Mindlabs focus protocol v1.0
      </div>
    </main>
  )
}
