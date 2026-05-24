"use client";

import Link from "next/link";
import FeedbackForm from "@/components/FeedbackForm";
import ShowcaseSection from "@/components/ShowcaseSection";
import CountUp from "@/components/CountUp";
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

/** 获取当前季节 */
function getCurrentSeason(): { id: string; emoji: string; label: string } {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return { id: "春季", emoji: "🌷", label: "春日" };
  if (m >= 6 && m <= 8) return { id: "夏季", emoji: "☀️", label: "夏日" };
  if (m >= 9 && m <= 11) return { id: "秋季", emoji: "🍂", label: "秋日" };
  return { id: "冬季", emoji: "❄️", label: "冬日" };
}

/** 各季节推荐穿搭 */
const SEASONAL_OUTFITS: Record<string, { style: string; occasion: string; tag: string; items: Array<{ emoji: string; label: string; value: string }> }> = {
  "春季": {
    style: "元气通勤风",
    occasion: "日常通勤",
    tag: "春季",
    items: [
      { emoji: "🧥", label: "外套", value: "卡其色风衣" },
      { emoji: "👚", label: "上装", value: "条纹针织衫" },
      { emoji: "👖", label: "下装", value: "米白直筒裤" },
      { emoji: "👟", label: "鞋子", value: "帆布小白鞋" },
      { emoji: "👜", label: "配饰", value: "编织托特包" },
    ],
  },
  "夏季": {
    style: "清新清爽风",
    occasion: "日常通勤",
    tag: "夏季",
    items: [
      { emoji: "👚", label: "上装", value: "白色亚麻衬衫" },
      { emoji: "👗", label: "下装", value: "浅蓝 A 字裙" },
      { emoji: "👡", label: "鞋子", value: "米色平底凉鞋" },
      { emoji: "🕶️", label: "配饰", value: "草编包 + 墨镜" },
      { emoji: "🧴", label: "防晒", value: "防晒开衫" },
    ],
  },
  "秋季": {
    style: "温柔气质风",
    occasion: "日常通勤",
    tag: "秋季",
    items: [
      { emoji: "🧥", label: "外套", value: "燕麦色西装" },
      { emoji: "👚", label: "内搭", value: "奶茶色打底衫" },
      { emoji: "👖", label: "下装", value: "深灰阔腿裤" },
      { emoji: "👢", label: "鞋子", value: "棕色切尔西靴" },
      { emoji: "👜", label: "配饰", value: "大号托特包" },
    ],
  },
  "冬季": {
    style: "温暖优雅风",
    occasion: "日常通勤",
    tag: "冬季",
    items: [
      { emoji: "🧥", label: "外套", value: "驼色羊毛大衣" },
      { emoji: "🥿", label: "内搭", value: "黑色高领毛衣" },
      { emoji: "👖", label: "下装", value: "加绒直筒牛仔裤" },
      { emoji: "👢", label: "鞋子", value: "短靴" },
      { emoji: "🧣", label: "配饰", value: "羊绒围巾" },
    ],
  },
};

export default function Home() {
  const season = getCurrentSeason();
  const outfit = SEASONAL_OUTFITS[season.id];

  return (
    <main className="flex-1 flex flex-col">
      {/* ============ Hero ============ */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden">
        {/* 简化装饰背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-warm via-white to-warm" />
        <div className="absolute top-[5%] right-[-10%] w-[300px] h-[300px] bg-gradient-to-br from-primary/15 via-primary-light/10 to-transparent rounded-full blur-[80px]" />
        <div className="absolute bottom-[15%] left-[-15%] w-[250px] h-[250px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-[70px]" />

        <div className="relative z-10 max-w-sm mx-auto w-full space-y-6">
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
            秒级生成专属穿搭方案
          </p>

          {/* CTA */}
          <div className="animate-fade-up delay-400 flex flex-col items-center gap-3 pt-1">
            <Link
              href="/generate"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light
                         text-white px-9 py-3.5 rounded-full font-semibold text-base
                         hover:shadow-lg hover:shadow-primary/30 transition-all duration-300
                         active:scale-[0.97] shadow-md shadow-primary/20 animate-shimmer-cta"
            >
              ✨ 免费开始搭配
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-text-muted text-xs">无需注册 · 免费使用</p>
          </div>

          {/* Before/After 对比卡片 — 直观展示效果 */}
          <div className="animate-scale-up delay-[600ms]">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border/60 p-3 text-left">
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <span className="text-[9px] text-text-muted tracking-wider font-medium">真实用户效果对比</span>
                <span className="text-[8px] bg-primary/10 text-primary-dark px-2 py-0.5 rounded-full">AI 搭配</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Before */}
                <div className="rounded-xl overflow-hidden bg-gradient-to-b from-secondary to-secondary/30 text-center relative">
                  <div className="aspect-[3/4] relative">
                    <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30 grayscale">
                      👩
                    </div>
                    <div className="absolute top-1.5 left-1.5 bg-black/40 text-white text-[7px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                      搭配前
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-[9px] text-text-secondary font-medium">日常随意穿搭</p>
                    <p className="text-[8px] text-text-muted">梨形身材 · 圆脸</p>
                  </div>
                </div>
                {/* After */}
                <div className="rounded-xl overflow-hidden bg-gradient-to-b from-primary/15 via-primary-light/10 to-primary/5 text-center relative ring-1 ring-primary/20">
                  <div className="aspect-[3/4] relative">
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      👩‍💼
                    </div>
                    <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-primary to-primary-light text-white text-[7px] px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm backdrop-blur-sm">
                      <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI 搭配
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-[9px] text-primary-dark font-medium">职场通勤风</p>
                    <p className="text-[8px] text-text-muted">V领衬衫 + 高腰西裤</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2.5 text-[8px] text-text-muted/60">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span>AI 3秒生成专属方案</span>
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
                        <span className="text-xl" role="img" aria-label={item.title}>{item.icon}</span>
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

      {/* ============ 风格展示（深色区，页面对比节奏） ============ */}
      <section className="px-6 py-14 bg-gradient-to-b from-primary/8 via-primary/4 to-transparent">
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
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card-bg/90 border border-primary/10
                           hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 hover:scale-[1.05]
                           hover:-translate-y-0.5 transition-all duration-200 cursor-default
                           animate-fade-up"
                style={{ animationDelay: `${(i % 4) * 80 + Math.floor(i / 4) * 120}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center text-lg" role="img" aria-label={style.name}>
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
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">为什么选衣搭</h2>
            </div>
          </AnimatedSection>

          {/* 社会证明 — 数字统计（滚动计数） */}
          <AnimatedSection delay={50}>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { end: 10000, suffix: "+", label: "已服务用户", icon: "👩" },
                { end: 98, suffix: "%", label: "好评率", icon: "⭐" },
                { end: 50000, suffix: "+", label: "穿搭方案", icon: "👗" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gradient-to-b from-primary/8 to-primary/3 rounded-xl p-3 text-center border border-primary/10"
                >
                  <span className="text-lg" role="img" aria-label={stat.label}>{stat.icon}</span>
                  <p className="text-lg font-bold text-primary mt-0.5">
                    <CountUp end={stat.end} suffix={stat.suffix} />
                  </p>
                  <p className="text-[9px] text-text-muted mt-0.5">{stat.label}</p>
                </div>
              ))}
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
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0 ml-1" role="img" aria-label={feature.title}>
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

          {/* 分享预览 — 展示带水印的分享卡片效果 */}
          <AnimatedSection delay={450}>
            <div className="mt-6 bg-card-bg rounded-2xl border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary-light p-3 text-white text-center">
                <span className="text-[10px] uppercase tracking-widest opacity-75">
                  衣搭 · AI 搭配方案
                </span>
                <p className="text-sm font-bold mt-0.5">春日通勤穿搭</p>
              </div>
              <div className="p-3 space-y-2">
                {[
                  { emoji: "👚", cat: "上装", text: "米色 V领雪纺衬衫" },
                  { emoji: "👖", cat: "下装", text: "深灰 高腰阔腿西裤" },
                  { emoji: "🧥", cat: "外套", text: "卡其 及膝风衣" },
                  { emoji: "👟", cat: "鞋子", text: "米色 尖头粗跟鞋" },
                  { emoji: "👜", cat: "配饰", text: "棕色 法棍包" },
                ].map((item) => (
                  <div key={item.cat} className="flex items-center gap-2 py-1">
                    <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-sm shrink-0" role="img" aria-label={item.cat}>
                      {item.emoji}
                    </div>
                    <span className="text-[9px] text-text-muted w-7">{item.cat}</span>
                    <span className="text-xs text-text-primary truncate">{item.text}</span>
                    <div className="w-3 h-3 rounded-full border border-border/40 shrink-0 ml-auto" style={{ backgroundColor: "#f5e6d3" }} />
                  </div>
                ))}
              </div>
              <div className="px-3 pb-3">
                <div className="bg-warm rounded-xl p-2.5 border border-border/30">
                  <div className="flex items-start gap-1.5">
                    <span className="text-xs leading-none mt-0.5" role="img" aria-label="穿搭提示">💡</span>
                    <p className="text-[10px] text-text-secondary leading-relaxed">
                      梨形身材上浅下深搭配平衡视觉比例，V领拉长颈部线条
                    </p>
                  </div>
                </div>
              </div>
              {/* 水印标签 */}
              <div className="px-3 pb-3">
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-muted/70 border-t border-border/30 pt-2">
                  <span role="img" aria-label="品牌标志">✨</span>
                  <span>来自「衣搭」AI穿搭助手</span>
                </div>
              </div>
              {/* 分享文案示范 */}
              <div className="border-t border-border/40 bg-secondary/20 px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] text-text-muted">📋 一键复制文案</span>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-border/40 text-[10px] text-text-secondary leading-relaxed font-mono">
                  ✨ 衣搭AI穿搭方案{'\n\n'}
                  👚 上装：米色 V领雪纺衬衫{'\n'}
                  👖 下装：深灰 高腰阔腿西裤{'\n'}
                  🧥 外套：卡其 及膝风衣{'\n'}
                  👟 鞋子：米色 尖头粗跟鞋{'\n'}
                  👜 配饰：棕色 法棍包{'\n\n'}
                  🏷️ 风格：职场通勤 ｜ 场合：日常通勤 ｜ 配色：中性色{'\n'}
                  💡 梨形身材上浅下深搭配平衡视觉比例{'\n\n'}
                  —— 来自「衣搭」AI穿搭助手
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="text-[10px] bg-primary/10 text-primary-dark px-2 py-0.5 rounded-full">复制</span>
                  <span className="text-[10px] text-text-muted">→</span>
                  <span className="text-[10px] bg-[#ff2d55]/10 text-[#ff2d55] px-2 py-0.5 rounded-full">粘贴到小红书</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ AI 方案展示 + 风格参考 + 用户评价 ============ */}
      <ShowcaseSection />

      {/* ============ 最终CTA ============ */}
      <AnimatedSection>
        <section className="px-6 py-16 text-center">
          <div className="max-w-sm mx-auto space-y-5">
            <div className="text-4xl" role="img" aria-label="穿搭">👗</div>
            <h2 className="text-xl font-bold text-text-primary">
              准备好改变你的衣柜了吗？
            </h2>
            <p className="text-sm text-text-secondary">
              让AI成为你的私人穿搭顾问
            </p>
            <Link
              href="/generate"
              prefetch={false}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light
                         text-white px-10 py-4 rounded-full font-semibold text-base
                         hover:shadow-lg hover:shadow-primary/30 hover:shadow-xl hover:shadow-primary/25
                         transition-all duration-300 active:scale-[0.97] shadow-md shadow-primary/20 animate-shimmer-cta"
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

    </main>
  );
}
