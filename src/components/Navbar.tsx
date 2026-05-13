"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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
          className="flex items-center gap-1.5 text-sm font-bold text-text-primary"
        >
          <span className="text-primary">✨</span>
          <span>衣搭</span>
        </Link>

        <Link
          href="/generate"
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          搭配
        </Link>
      </div>
    </nav>
  );
}
