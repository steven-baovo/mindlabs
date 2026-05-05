import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DevPanel from "@/components/dev/DevPanel";
import { createClient } from "@/lib/supabase/server";

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  const isAdmin = user?.email && adminEmails.includes(user.email.toLowerCase())

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* DevPanel is only injected for admins or in local development */}
      {(process.env.NODE_ENV === 'development' || isAdmin) && <DevPanel />}
    </div>
  );
}
