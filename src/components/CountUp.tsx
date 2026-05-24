"use client";

import { useState, useEffect, useRef } from "react";

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  decimals?: number;
}

/** 数字滚动动画 — 从 0 滚动到目标值，进入视口时触发 */
export default function CountUp({
  end,
  suffix = "",
  duration = 1500,
  decimals = 0,
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          setInView(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - Math.pow(1 - progress, 2);
      const current = Math.round(eased * end);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  const display = decimals > 0 ? count.toFixed(decimals) : count.toLocaleString();

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}
