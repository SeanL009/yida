"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProStatus } from "@/lib/pro";

export default function Navbar() {
  const [isPro, setIsPro] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const pro = getProStatus();
    setIsPro(pro.isPro);
    setDaysLeft(pro.daysLeft);

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

        <div className="flex items-center gap-2">
          <Link
            href="/generate"
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            搭配
          </Link>
          <Link
            href="/pro"
            className={`text-xs font-medium rounded-full px-2.5 py-1 transition-all ${
              isPro
                ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-sm"
                : "text-primary hover:bg-secondary"
            }`}
          >
            {isPro ? `✨ Pro ${daysLeft > 0 ? `${daysLeft}天` : ""}` : "✨ Pro"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
