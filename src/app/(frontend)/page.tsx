import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Zap, Brain, Clock, Sparkles, ArrowRight, FileText, Calendar, BookOpen } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // 1. Nếu ĐÃ ĐĂNG NHẬP -> Hiện Command Center
  if (session) {
    const user = session.user
    const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Bạn'

    // Mock data cho các file gần đây
    const recentFiles = [
      { id: 1, title: 'Kế hoạch phát triển Mindlabs', type: 'note', updated: '2 giờ trước' },
      { id: 2, title: 'Sơ đồ tư duy Hệ sinh thái', type: 'map', updated: 'Hôm qua' },
      { id: 3, title: 'Ghi chú cuộc họp', type: 'note', updated: '3 ngày trước' },
    ]

    return (
      <div className="w-full bg-[#fcfdfe] min-h-screen pb-20">
        <div className="container mx-auto px-6 max-w-7xl pt-16">
          {/* Greeting */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">
              Chào buổi chiều, <span className="text-primary">{displayName}</span>!
            </h1>
            <p className="text-secondary font-medium opacity-70">Hôm nay bạn muốn tập trung vào việc gì?</p>
          </div>

          {/* Grid Layout cho Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Cột chính: Công cụ và File */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Widget Mở nhanh */}
              <div className="bg-white rounded-[32px] border border-border-main/50 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Tài liệu gần đây</h2>
                  <Link href="/workspace" className="text-xs font-bold text-primary hover:underline">
                    Xem tất cả
                  </Link>
                </div>
                
                <div className="flex flex-col gap-3">
                  {recentFiles.map((file) => (
                    <Link key={file.id} href={`/mindspace/${file.id}`} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-border-main/50 group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          {file.type === 'note' ? (
                            <FileText className="w-5 h-5 text-secondary/70 group-hover:text-primary transition-colors" />
                          ) : (
                            <Zap className="w-5 h-5 text-secondary/70 group-hover:text-primary transition-colors" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{file.title}</h3>
                          <span className="text-[11px] text-secondary/50 font-medium">{file.updated}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-secondary/30 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Grid 2 cột cho các công cụ khác */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* MindAI Quick Ask */}
                <div className="bg-white rounded-[32px] border border-border-main/50 p-8 flex flex-col justify-between h-64">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                      <Brain className="w-6 h-6 text-secondary/40" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Hỏi MindAI</h3>
                    <p className="text-xs text-secondary opacity-70">Mở rộng ý tưởng hoặc tóm tắt kiến thức ngay lập tức.</p>
                  </div>
                  <Link href="/mindai" className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2 group">
                    Bắt đầu chat <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Planner Quick Access */}
                <div className="bg-white rounded-[32px] border border-border-main/50 p-8 flex flex-col justify-between h-64">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                      <Calendar className="w-6 h-6 text-secondary/40" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Lên kế hoạch</h3>
                    <p className="text-xs text-secondary opacity-70">Sắp xếp công việc và tối ưu hóa thời gian trong ngày.</p>
                  </div>
                  <Link href="/clarity" className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2 group">
                    Mở Planner <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Cột phụ: Pomodoro và Journal */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* Widget Pomodoro */}
              <div className="bg-[#0a0a0a] text-white rounded-[32px] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">MindFocus</span>
                  </div>
                  <h3 className="text-2xl font-black mb-2 tracking-tighter">Sẵn sàng tập trung?</h3>
                  <p className="text-xs text-white/60 mb-8 font-medium">Bắt đầu một phiên Pomodoro 25 phút để hoàn thành công việc.</p>
                  <Link href="/pomodoro" className="inline-block w-full text-center py-4 bg-primary text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all -primary/20">
                    Bật Timer Ngay
                  </Link>
                </div>
              </div>

              {/* Widget Journal */}
              <div className="bg-white rounded-[32px] border border-border-main/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-secondary/40" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-secondary/40">Góc Đọc</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Đọc nghiên cứu mới</h3>
                <p className="text-xs text-secondary opacity-70 mb-6">Nâng cấp tư duy với các bài viết chuyên sâu trên Mindlabs Journal.</p>
                <Link href="/journal" className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2 group">
                  Vào Journal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. Nếu CHƯA ĐĂNG NHẬP -> Hiện Landing Page
  return (
    <div className="w-full bg-[#fcfdfe] min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 container mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-[100px] -z-10" />
        
        <div className="flex items-center gap-2 mb-6">
          <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 border border-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Chào mừng đến với Mindlabs</span>
          </div>
        </div>

        <h1 className="text-6xl lg:text-7xl font-black text-foreground tracking-tighter leading-none mb-6">
          Nâng Cấp <span className="text-primary">Tâm Trí</span>,<br/>Tối Ưu <span className="text-secondary/60">Hiệu Suất</span>
        </h1>
        
        <p className="text-xl text-secondary font-medium max-w-2xl mb-12 opacity-80">
          Mindlabs là hệ sinh thái công cụ hỗ trợ tư duy, tập trung và phát triển bản thân dựa trên khoa học nhận thức.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/workspace" className="group relative px-8 py-4 bg-foreground text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:pr-12 active:scale-95 -primary/20">
            <span className="relative z-10">Khám phá Workspace</span>
            <div className="absolute right-0 top-0 h-full w-0 group-hover:w-10 bg-primary transition-all duration-500 flex items-center justify-center">
               <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </Link>
          <Link href="/journal" className="px-8 py-4 glass text-[11px] font-black uppercase tracking-[0.3em] text-foreground hover:bg-black/5 transition-all rounded-full border border-border-main">
            Đọc Nghiên Cứu
          </Link>
        </div>
      </section>

      {/* Products Bento Grid */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-4">Hệ sinh thái Mindlabs</h2>
          <p className="text-secondary font-medium opacity-70">Các công cụ được thiết kế để tối ưu hóa từng khía cạnh trong công việc của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Pomodoro */}
          <div className="group relative p-10 rounded-[32px] bg-white border border-border-main/50 hover: hover:-translate-y-2 transition-all duration-500 overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Clock className="w-6 h-6 text-secondary/40 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Công cụ</span>
              <h3 className="text-2xl font-bold text-foreground mt-2 mb-3">MindPomodoro</h3>
              <p className="text-sm text-secondary opacity-70 mb-6">Phương pháp Pomodoro nâng cao giúp bạn duy trì sự tập trung sâu và quản lý thời gian hiệu quả.</p>
              <Link href="/pomodoro" className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                Trải nghiệm <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* MindAI */}
          <div className="group relative p-10 rounded-[32px] bg-white border border-border-main/50 hover: hover:-translate-y-2 transition-all duration-500 overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Brain className="w-6 h-6 text-secondary/40 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Trí tuệ nhân tạo</span>
              <h3 className="text-2xl font-bold text-foreground mt-2 mb-3">MindAI</h3>
              <p className="text-sm text-secondary opacity-70 mb-6">Trợ lý AI đồng hành cùng tư duy, giúp bạn tóm tắt kiến thức và mở rộng ý tưởng.</p>
              <Link href="/mindai" className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                Trải nghiệm <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Mindspace */}
          <div className="group relative p-10 rounded-[32px] bg-white border border-border-main/50 hover: hover:-translate-y-2 transition-all duration-500 overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Zap className="w-6 h-6 text-secondary/40 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Không gian</span>
              <h3 className="text-2xl font-bold text-foreground mt-2 mb-3">Mindspace</h3>
              <p className="text-sm text-secondary opacity-70 mb-6">Không gian làm việc tối giản, giúp bạn tổ chức tài liệu và ghi chú một cách khoa học.</p>
              <Link href="/mindspace" className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                Trải nghiệm <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0a0a0a] rounded-[48px] mx-4 lg:mx-8 my-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-8 lg:px-16 max-w-7xl relative z-10 text-center text-white">
          <h2 className="text-5xl lg:text-6xl font-black mb-6 tracking-tighter leading-none">
            Sẵn sàng nâng cấp <br/> <span className="text-primary">tư duy của bạn?</span>
          </h2>
          <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto font-medium">
            Bắt đầu hành trình tối ưu hóa hiệu suất ngay hôm nay với các công cụ chuyên sâu.
          </p>
          <Link href="/auth/register" className="inline-block px-12 py-5 bg-primary text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all -primary/30">
            Bắt đầu miễn phí
          </Link>
        </div>
      </section>
    </div>
  )
}
