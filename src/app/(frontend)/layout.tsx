import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex w-full items-start overflow-hidden">
        <Sidebar />
        <main className="flex-1 w-full lg:max-w-none h-[calc(100vh-56px)] overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
