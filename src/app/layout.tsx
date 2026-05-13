import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "衣搭 - AI穿搭助手 | 穿出你的高级感",
  description:
    "上传照片，AI为你智能搭配穿搭方案。适合通勤、约会、旅行等各种场景，让你的衣柜不再闲置。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-warm font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
