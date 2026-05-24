import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";

const SITE_URL = "https://jiulant.cn";
const SITE_NAME = "衣搭 - AI穿搭助手";

export const metadata: Metadata = {
  title: {
    default: "衣搭 - AI穿搭助手 | 穿出你的高级感",
    template: "%s - 衣搭",
  },
  description:
    "上传照片，AI为你智能搭配穿搭方案。适合通勤、约会、旅行等各种场景，让你的衣柜不再闲置。",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "衣搭",
    title: "衣搭 - AI穿搭助手 | 穿出你的高级感",
    description:
      "上传照片，AI为你智能搭配穿搭方案。适合通勤、约会、旅行等各种场景，让你的衣柜不再闲置。",
    url: SITE_URL,
    images: [
      {
        url: "/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "衣搭 - AI穿搭助手",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "衣搭 - AI穿搭助手 | 穿出你的高级感",
    description:
      "上传照片，AI为你智能搭配穿搭方案。适合通勤、约会、旅行等各种场景。",
    images: ["/og-cover.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const icpBeian = process.env.ICP_BEIAN || "";

  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-warm font-sans">
        {/* Schema.org 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "衣搭 AI穿搭助手",
              url: SITE_URL,
              description:
                "上传照片，AI为你智能搭配穿搭方案。适合通勤、约会、旅行等各种场景。",
              applicationCategory: "FashionApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "CNY",
              },
              author: {
                "@type": "Organization",
                name: "衣搭",
              },
            }),
          }}
        />
        <Navbar />
        {children}
        {icpBeian && (
          <footer className="py-6 text-center border-t border-border/30 mt-6">
            <div className="max-w-sm mx-auto px-4 space-y-3">
              {/* 品牌 */}
              <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-text-primary">
                <span className="text-primary">✨</span>
                <span>衣搭</span>
              </div>

              {/* 链接 */}
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
                <Link href="/about" className="text-text-secondary hover:text-text-primary transition-colors">
                  关于我们
                </Link>
                <span className="text-text-muted/30 select-none">·</span>
                <Link href="/privacy" className="text-text-secondary hover:text-text-primary transition-colors">
                  隐私政策
                </Link>
                <span className="text-text-muted/30 select-none">·</span>
                <Link href="/terms" className="text-text-secondary hover:text-text-primary transition-colors">
                  服务协议
                </Link>
                <span className="text-text-muted/30 select-none">·</span>
                <Link href="/faq" className="text-text-secondary hover:text-text-primary transition-colors">
                  常见问题
                </Link>
              </div>

              {/* 联系方式 + ICP */}
              <div className="flex flex-col items-center gap-1 text-xs text-text-secondary">
                <span>联系邮箱：sean009@qq.com</span>
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-muted transition-colors"
                >
                  {icpBeian}
                </a>
              </div>
            </div>
          </footer>
        )}
      </body>
    </html>
  );
}
