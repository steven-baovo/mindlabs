import Sidebar from "@/components/Sidebar";
export const dynamic = 'force-dynamic'
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import WorkspaceLayoutSidebar from "@/components/workspace/WorkspaceLayoutSidebar";
import { createClient } from '@/lib/supabase/server';

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      profile = data
    }

    return (
      <WorkspaceProvider>
        <div className="flex h-screen bg-[#f3f4f6] p-1.5 gap-1.5 overflow-hidden">
          {/* Sidebar Island */}
          <div className="flex flex-col h-full shrink-0">
            <Sidebar user={user} profile={profile} />
          </div>

          {/* Main Content Island */}
          <div className="flex-1 flex flex-col h-full bg-white rounded-2xl shadow-sm overflow-hidden border border-white/50 relative">
            <main className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar relative">
              <div className="w-full h-full">
                {children}
              </div>
            </main>
          </div>

          {/* Right Sidebar Island (conditional) */}
          <WorkspaceLayoutSidebar />
        </div>
      </WorkspaceProvider>
    );
  } catch (err) {
    console.error("Critical Layout Error:", err);
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 p-10">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Hệ thống đang bảo trì</h1>
          <p className="text-gray-600 mb-6">Đã xảy ra lỗi trong quá trình khởi tạo giao diện. Chúng tôi đang xử lý.</p>
          <pre className="text-[10px] bg-gray-50 p-4 rounded text-left overflow-auto max-h-40">
            {err instanceof Error ? err.message : String(err)}
          </pre>
        </div>
      </div>
    );
  }
}
