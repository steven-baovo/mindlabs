import Link from 'next/link'
import { Zap, Search, ArrowLeft } from 'lucide-react'

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#fcfdfe] min-h-screen flex flex-col">
      {/* Clean Magazine Header */}
      <header className="border-b border-border-main/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 max-w-7xl h-16 flex items-center justify-between">
          <Link href="/journal" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Mindlabs Journal</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/journal" className="text-xs font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors">Trang chủ</Link>
            <Link href="/journal?cat=khoa-hoc" className="text-xs font-black uppercase tracking-widest text-secondary/60 hover:text-primary transition-colors">Khoa học</Link>
            <Link href="/journal?cat=tu-duy" className="text-xs font-black uppercase tracking-widest text-secondary/60 hover:text-primary transition-colors">Tư duy</Link>
          </nav>

          <div className="flex items-center gap-6">
            <button className="text-secondary/60 hover:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-secondary/60 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Workspace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
