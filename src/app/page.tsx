"use client";

import Link from "next/link";
import FeedbackForm from "@/components/FeedbackForm";
import { useInView } from "@/hooks/useInView";

/* 动画包装器 — 滚动到视口时触发入场动画 */
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>({ triggerOnce: true });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* ============ Hero ============ */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden">
        {/* 简化装饰背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-warm via-white to-warm" />
        <div className="absolute top-[10%] right-[-10%] w-[300px] h-[300px] bg-gradient-to-br from-primary/15 via-primary-light/10 to-transparent rounded-full blur-[80px]" />
        <div className="absolute bottom-[20%] left-[-15%] w-[250px] h-[250px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-[70px]" />

        <div className="relative z-10 max-w-sm mx-auto space-y-8">
          {/* 品牌标签 */}
          <div className="animate-fade-up delay-100 inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-xs border border-border/60">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-xs text-primary-dark font-medium tracking-wide">
              AI 智能穿搭
            </span>
          </div>

          {/* 主标题 */}
          <h1 className="animate-fade-up delay-200 text-[2rem] font-bold text-text-primary leading-[1.15] tracking-tight">
            上传一张照片
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
              穿出你的高级感
            </span>
          </h1>

          <p className="animate-fade-up delay-300 text-text-secondary text-sm leading-relaxed max-w-[260px] mx-auto">
            AI 根据你的脸型、体型和肤色
            <br />
            3秒生成专属穿搭方案
          </p>

          {/* CTA */}
          <div className="animate-fade-up delay-400 flex flex-col items-center gap-3 pt-1">
            <Link
              href="/generate"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light
                         text-white px-9 py-3.5 rounded-full font-semibold text-base
                         hover:shadow-lg hover:shadow-primary/30 transition-all duration-300
                         active:scale-[0.97] shadow-md shadow-primary/20"
            >
              ✨ 免费开始搭配
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-text-muted text-xs">无需注册 · 免费使用</p>
          </div>

          {/* 浮动的预览卡片 */}
          <div className="animate-scale-up delay-500 pt-4 animate-float">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border/60 p-4 text-left max-w-[280px] mx-auto">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm shadow-sm">
                  ✨
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-text-muted">今日推荐 · 通勤穿搭</p>
                  <p className="text-sm font-semibold text-text-primary">温柔知性风</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { emoji: "🧥", label: "外套", value: "米色长款风衣" },
                  { emoji: "👚", label: "内搭", value: "白色真丝衬衫" },
                  { emoji: "👖", label: "下装", value: "深蓝直筒牛仔裤" },
                  { emoji: "👟", label: "鞋子", value: "米色尖头低跟鞋" },
                  { emoji: "👜", label: "配饰", value: "棕色托特包" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 py-0.5">
                    <span className="text-sm">{item.emoji}</span>
                    <span className="text-[10px] text-text-muted w-7">{item.label}</span>
                    <span className="text-xs text-text-primary font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 使用流程（时间线样式） ============ */}
      <section className="px-6 py-14 bg-white">
        <div className="max-w-sm mx-auto">
          <AnimatedSection>
            <div className="text-center mb-10">
              <h2 className="text-xl font-bold text-text-primary">三步搞定每日穿搭</h2>
              <p className="text-sm text-text-muted mt-2">不再为每天穿什么烦恼</p>
            </div>
          </AnimatedSection>

          <div className="space-y-0">
            {[
              {
                step: "01",
                icon: "📸",
                title: "上传照片",
                desc: "正面全身照，AI精准分析你的脸型、体型和肤色",
                color: "from-primary/20 to-primary/5",
              },
              {
                step: "02",
                icon: "✨",
                title: "AI智能搭配",
                desc: "根据你的特征和偏好，生成1套完整的穿搭方案",
                color: "from-accent/20 to-accent/5",
              },
              {
                step: "03",
                icon: "📱",
                title: "分享灵感",
                desc: "一键复制穿搭文案，分享到小红书收获点赞",
                color: "from-primary/20 to-primary/5",
              },
            ].map((item, i) => (
              <div key={i}>
                <AnimatedSection delay={i * 150}>
                  <div className="flex items-start gap-4 pb-6">
                    <div className="relative flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-sm`}>
                        <span className="text-xl">{item.icon}</span>
                      </div>
                      {/* 步骤之间的虚线连接 */}
                      {i < 2 && (
                        <div className="mt-1 w-0.5 h-6 border-l-2 border-dashed border-border/60" />
                      )}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-primary tracking-wider">{item.step}</span>
                        <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
                {/* 最后一项下方不留连接线，使用 pb-0 替代 */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 风格展示 ============ */}
      <section className="px-6 py-14">
        <div className="max-w-sm mx-auto">
          <AnimatedSection>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-text-primary">你的风格，我们都有</h2>
              <p className="text-sm text-text-muted mt-2">8大风格 DNA，覆盖日常所有场景</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-4 gap-3">
            {[
              { emoji: "🧘", name: "简约休闲" },
              { emoji: "🌸", name: "甜美温柔" },
              { emoji: "💼", name: "职场通勤" },
              { emoji: "⚡", name: "运动活力" },
              { emoji: "🏮", name: "新中式" },
              { emoji: "🔥", name: "欧美街头" },
              { emoji: "📷", name: "复古文艺" },
              { emoji: "✨", name: "优雅气质" },
            ].map((style, i) => (
              <div
                key={style.name}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/70 border border-border/50
                           hover:border-primary/30 hover:shadow-sm hover:scale-[1.03] transition-all duration-200
                           animate-fade-up"
                style={{ animationDelay: `${(i % 4) * 80 + Math.floor(i / 4) * 120}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg group-hover:scale-110">
                  {style.emoji}
                </div>
                <span className="text-[10px] text-text-secondary font-medium text-center leading-tight">
                  {style.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 为什么选我们 ============ */}
      <section className="px-6 py-14 bg-white">
        <div className="max-w-sm mx-auto">
          <AnimatedSection>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-text-primary">为什么选衣搭</h2>
            </div>
          </AnimatedSection>

          <div className="grid gap-3">
            {[
              {
                icon: "🎯",
                title: "真实参考级",
                desc: "不做过度美化，给你真实能穿的搭配方案，照着买照着穿",
              },
              {
                icon: "🧬",
                title: "AI 量身定制",
                desc: "根据你的脸型、体型、肤色和场景，千人千面精准推荐",
              },
              {
                icon: "📲",
                title: "小红书友好",
                desc: "一键复制精美穿搭文案，带水印分享，轻松获得点赞",
              },
            ].map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 150}>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-warm border border-border/50 relative overflow-hidden">
                  {/* 左边渐变装饰条 */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary to-primary-light rounded-l-xl" />
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0 ml-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-0.5">{feature.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 最终CTA ============ */}
      <AnimatedSection>
        <section className="px-6 py-16 text-center">
          <div className="max-w-sm mx-auto space-y-5">
            <div className="text-4xl">👗</div>
            <h2 className="text-xl font-bold text-text-primary">
              准备好改变你的衣柜了吗？
            </h2>
            <p className="text-sm text-text-secondary">
              让AI成为你的私人穿搭顾问
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light
                         text-white px-10 py-4 rounded-full font-semibold text-base
                         hover:shadow-lg hover:shadow-primary/30 hover:shadow-xl hover:shadow-primary/25
                         transition-all duration-300 active:scale-[0.97] shadow-md shadow-primary/20"
            >
              ✨ 开始免费搭配
            </Link>
          </div>
        </section>
      </AnimatedSection>

      {/* ============ 反馈建议 ============ */}
      <section className="px-6 py-6">
        <div className="max-w-sm mx-auto">
          <FeedbackForm />
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="text-center py-8 px-6">
        <div className="max-w-sm mx-auto space-y-3 animate-fade-in">
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs text-text-muted">衣搭 · AI穿搭助手</span>
            <span className="w-px h-3 bg-border" />
            <span className="text-xs text-text-muted">© 2026</span>
          </div>
          <p className="text-[10px] text-text-muted">
            让每个女生都能轻松穿出高级感
          </p>
        </div>
      </footer>
    </div>
  );
}
