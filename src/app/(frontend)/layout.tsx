import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className="flex-1 w-full lg:max-w-none">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
