"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-xs border-b border-border/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-12">
        <Link
          href="/"
          prefetch={false}
          className="flex items-center gap-1.5 text-sm font-bold text-text-primary"
        >
          <span className="text-primary">✨</span>
          <span>衣搭</span>
        </Link>

        {/* 桌面导航链接（md 以上显示） */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/generate"
            prefetch={false}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            搭配
          </Link>
          <Link
            href="/about"
            prefetch={false}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            关于
          </Link>
          <Link
            href="/faq"
            prefetch={false}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            常见问题
          </Link>
          <Link
            href="/generate"
            prefetch={false}
            className="text-xs font-semibold text-primary border border-primary/40 rounded-full px-4 py-1.5
                       hover:bg-primary/5 hover:border-primary transition-all duration-200"
          >
            开始搭配
          </Link>
        </div>

        {/* 移动端菜单按钮 + CTA */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/generate"
            prefetch={false}
            className="text-xs font-semibold text-primary border border-primary/40 rounded-full px-3.5 py-1.5
                       hover:bg-primary/5 hover:border-primary transition-all duration-200"
          >
            开始搭配
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            aria-label="菜单"
          >
            <svg className={`w-5 h-5 text-text-primary transition-transform duration-200 ${menuOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-md border-b border-border/40 animate-slide-down">
          <div className="max-w-lg mx-auto px-4 py-3 space-y-1">
            <Link
              href="/generate"
              prefetch={false}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm text-text-primary hover:bg-secondary transition-colors"
            >
              ✨ 开始搭配
            </Link>
            <Link
              href="/about"
              prefetch={false}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm text-text-secondary hover:bg-secondary hover:text-text-primary transition-colors"
            >
              关于我们
            </Link>
            <Link
              href="/faq"
              prefetch={false}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm text-text-secondary hover:bg-secondary hover:text-text-primary transition-colors"
            >
              常见问题
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
