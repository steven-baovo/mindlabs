import type { Metadata } from "next";
export const dynamic = 'force-dynamic'
import { Inter } from "next/font/google";
import "./globals.css";

import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  variable: "--font-inter",
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
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
      <html
        lang="vi"
        className={`${inter.variable} antialiased`}
      >
        <body>
          {children}
        </body>
      </html>
    );
  } catch (err) {
    console.error("Root Layout Error:", err);
    return (
      <html lang="vi">
        <body>
          <div className="flex items-center justify-center h-screen bg-gray-50 p-10">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md w-full text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi Hệ Thống</h1>
              <p className="text-gray-600 mb-6">Không thể khởi tạo ứng dụng. Vui lòng liên hệ quản trị viên.</p>
              <pre className="text-[10px] bg-gray-50 p-4 rounded text-left overflow-auto max-h-40">
                {err instanceof Error ? err.message : String(err)}
              </pre>
            </div>
          </div>
        </body>
      </html>
    );
  }
}
