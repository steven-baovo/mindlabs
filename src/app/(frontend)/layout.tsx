import Sidebar from "@/components/Sidebar";
export const dynamic = 'force-dynamic'
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import WorkspaceLayoutSidebar from "@/components/workspace/WorkspaceLayoutSidebar";
import { createClient } from '@/lib/supabase/server';
import { FocusProvider } from "@/contexts/FocusContext";

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    profile = data
  }

  return (
    <FocusProvider>
      <WorkspaceProvider>
        <div className="flex h-screen bg-[#f3f4f6] p-1.5 gap-1.5 overflow-hidden">
          {/* Sidebar Island */}
          <div className="flex flex-col h-full shrink-0">
            <Sidebar user={user} profile={profile} />
          </div>

          {/* Main Content Island */}
          <div className="flex-1 flex flex-col h-full bg-white rounded-2xl overflow-hidden relative">
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
    </FocusProvider>
  );
}
