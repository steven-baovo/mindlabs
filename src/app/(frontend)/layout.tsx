import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import WorkspaceLayoutSidebar from "@/components/workspace/WorkspaceLayoutSidebar";
import FloatingSaveStatus from "@/components/workspace/FloatingSaveStatus";

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WorkspaceProvider>
      <div className="flex flex-col min-h-screen bg-white overflow-hidden">
        <Header />
        <div className="flex flex-1 relative">
          <Sidebar />
          <main className="flex-1 min-w-0 lg:max-w-none h-[calc(100vh-56px)] overflow-y-auto no-scrollbar relative">
            {children}
          </main>
          <WorkspaceLayoutSidebar />
        </div>
      </div>
    </WorkspaceProvider>
  );
}
