import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import DevPanel from "@/components/dev/DevPanel";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["vietnamese", "latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["vietnamese", "latin"],
});

export const metadata: Metadata = {
  title: "Mindlabs",
  description: "Khám phá các nội dung giá trị được thiết kế để nâng cao sức khỏe tinh thần và thể chất của bạn.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  // Always include your email as a hardcoded fallback for now to ensure access
  const isAdmin = user?.email && (adminEmails.includes(user.email.toLowerCase()) || user.email === 'voquocbao1999@gmail.com')

  return (
    <html
      lang="vi"
      className={`${inter.variable} ${lora.variable} antialiased`}
    >
      <body>
        {children}
        <DevPanel isAdmin={isAdmin || process.env.NODE_ENV === 'development'} />
      </body>
    </html>
  );
}
