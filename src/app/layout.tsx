import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${lora.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
