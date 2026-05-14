import Header from "@/components/Header";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import WorkspaceLayoutWrapper from "@/components/workspace/WorkspaceLayoutWrapper";

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-[#fcfdfe]">
        <Header />
        <WorkspaceLayoutWrapper>
          {children}
        </WorkspaceLayoutWrapper>
      </div>
    </WorkspaceProvider>
  );
}
