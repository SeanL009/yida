import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "衣搭 - AI穿搭助手 | 每天三套，穿出高级感",
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
        {children}
      </body>
    </html>
  );
}
