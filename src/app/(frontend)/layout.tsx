import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DevPanel from "@/components/dev/DevPanel";

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <DevPanel />
    </div>
  );
}
