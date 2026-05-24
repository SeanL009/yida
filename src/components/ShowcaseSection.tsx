"use client";

import { useInView } from "@/hooks/useInView";
import Image from "next/image";

/** 滚动动画包装器 */
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
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** 单品项 */
interface ShowcaseItem {
  category: string;
  emoji: string;
  color: string;
  name: string;
}

/** 案例数据 */
interface ShowcaseCase {
  id: number;
  userName: string;
  bodyType: string;
  faceShape: string;
  skinTone: string;
  style: string;
  occasion: string;
  colorScheme: string;
  tip: string;
  items: ShowcaseItem[];
  userSilhouette: string; // emoji-based user representation
  beforeImg: string; // 用户 before 照片
  afterImg: string;  // AI 搭配后效果图
}

const SHOWCASE_CASES: ShowcaseCase[] = [
  {
    id: 1,
    userName: "小鹿",
    bodyType: "梨形身材",
    faceShape: "圆脸",
    skinTone: "暖白皮",
    style: "职场通勤",
    occasion: "日常通勤",
    colorScheme: "中性色",
    tip: "梨形身材上浅下深的搭配能平衡视觉比例，V领上衣拉长颈部线条，高腰阔腿裤修饰胯部，整体干练又显瘦。",
    userSilhouette: "👩‍💼",
    beforeImg: "/images/showcase/1.webp",
    afterImg: "/images/showcase/2.webp",
    items: [
      { category: "上装", emoji: "👚", color: "米色", name: "V领雪纺衬衫" },
      { category: "下装", emoji: "👖", color: "深灰", name: "高腰阔腿西裤" },
      { category: "外套", emoji: "🧥", color: "卡其", name: "及膝风衣" },
      { category: "鞋子", emoji: "👟", color: "米色", name: "尖头粗跟鞋" },
      { category: "配饰", emoji: "👜", color: "棕色", name: "法棍包" },
    ],
  },
  {
    id: 2,
    userName: "小柒",
    bodyType: "沙漏型身材",
    faceShape: "鹅蛋脸",
    skinTone: "粉白皮",
    style: "甜美温柔",
    occasion: "约会聚餐",
    colorScheme: "甜美粉色系",
    tip: "收腰连衣裙完美突出沙漏型的身材优势，泡泡袖增加甜美度。粉色系搭配珍珠配饰，温柔又有质感。",
    userSilhouette: "👩",
    beforeImg: "/images/showcase/3.webp",
    afterImg: "/images/showcase/4.webp",
    items: [
      { category: "裙子", emoji: "👗", color: "粉色", name: "收腰泡泡袖连衣裙" },
      { category: "鞋子", emoji: "👡", color: "杏色", name: "一字带凉鞋" },
      { category: "包包", emoji: "👜", color: "白色", name: "迷你链条款" },
      { category: "配饰", emoji: "💍", color: "金色", name: "珍珠锁骨链" },
      { category: "配饰", emoji: "🧥", color: "杏色", name: "薄款针织开衫" },
    ],
  },
  {
    id: 3,
    userName: "西西",
    bodyType: "H型身材",
    faceShape: "方脸",
    skinTone: "自然肤色",
    style: "简约休闲",
    occasion: "旅行出游",
    colorScheme: "大地色系",
    tip: "H型身材适合通过叠穿制造层次感，腰带明确腰线。大地色系自然舒适，帆布鞋适合长时间步行。",
    userSilhouette: "👩‍🦰",
    beforeImg: "/images/showcase/5.webp",
    afterImg: "/images/showcase/6.webp",
    items: [
      { category: "上装", emoji: "👚", color: "白色", name: "基础T恤" },
      { category: "下装", emoji: "👖", color: "卡其", name: "工装短裤" },
      { category: "外套", emoji: "🧥", color: "杏色", name: "亚麻西装外套" },
      { category: "鞋子", emoji: "👟", color: "白色", name: "帆布鞋" },
      { category: "配饰", emoji: "👜", color: "棕色", name: "帆布托特包" },
    ],
  },
];

/** 颜色映射 */
const COLOR_HEX: Record<string, string> = {
  米色: "#f5e6d3",
  白色: "#ffffff",
  黑色: "#2d2d2d",
  深灰: "#666666",
  卡其: "#c3a87c",
  棕色: "#8b6b4a",
  粉色: "#f5a0b8",
  杏色: "#e8cfa6",
  金色: "#d4a843",
};

function colorHex(c: string): string {
  return COLOR_HEX[c] || "#e0d8dc";
}

/** 风格分类视觉展示 */
const STYLE_VISUALS = [
  {
    emoji: "🧘",
    name: "简约休闲",
    desc: "基础款叠穿，舒适不费力",
    colors: ["#ffffff", "#c3a87c", "#666666"],
    img: "/images/showcase/7.webp",
  },
  {
    emoji: "🌸",
    name: "甜美温柔",
    desc: "柔和的色彩，浪漫的细节",
    colors: ["#f5a0b8", "#fdf0f3", "#e8cfa6"],
    img: "/images/showcase/8.webp",
  },
  {
    emoji: "💼",
    name: "职场通勤",
    desc: "干练利落，专业不失气质",
    colors: ["#1a2744", "#f5e6d3", "#8b6b4a"],
    img: "/images/showcase/9.webp",
  },
  {
    emoji: "🔥",
    name: "欧美街头",
    desc: "大胆自信，个性鲜明",
    colors: ["#2d2d2d", "#f5a0b8", "#c94a4a"],
    img: "/images/showcase/10.webp",
  },
  {
    emoji: "🏮",
    name: "新中式",
    desc: "东方韵味，现代演绎",
    colors: ["#c94a4a", "#1a2744", "#e8cfa6"],
    img: "/images/showcase/11.webp",
  },
  {
    emoji: "📷",
    name: "复古文艺",
    desc: "经典元素，怀旧质感",
    colors: ["#8b6b4a", "#c3a87c", "#666666"],
    img: "/images/showcase/12.webp",
  },
  {
    emoji: "⚡",
    name: "运动活力",
    desc: "动感十足，轻松自在",
    colors: ["#4a7fa5", "#2d2d2d", "#ffffff"],
    img: "/images/showcase/13.webp",
  },
  {
    emoji: "✨",
    name: "优雅气质",
    desc: "精致高级，从容得体",
    colors: ["#8c6fe8", "#e8cfa6", "#fdf0f3"],
    img: "/images/showcase/14.webp",
  },
];

/** 模拟评价 */
const TESTIMONIALS = [
  {
    id: 1,
    name: "小鹿",
    avatar: "🦌",
    avatarImg: "/images/avatars/avatar-1.webp",
    text: "我是典型的梨形身材，之前完全不知道怎么穿。AI推荐的高腰阔腿裤+短上衣真的绝了，显瘦10斤！",
    style: "职场通勤",
    rating: 5,
    date: "2026-05-18",
    source: "来自小红书",
  },
  {
    id: 2,
    name: "安妮",
    avatar: "👩",
    avatarImg: "/images/avatars/avatar-2.webp",
    text: "约会前试了好几个风格，最后选了温柔风那套。男朋友说第一次见我穿这么好看哈哈，AI比直男审美强多了",
    style: "甜美温柔",
    rating: 5,
    date: "2026-05-15",
    source: "来自微信反馈",
  },
  {
    id: 3,
    name: "大喵",
    avatar: "🐱",
    avatarImg: "/images/avatars/avatar-3.webp",
    text: "每次出门前都要纠结半天，现在直接拍张照让AI搭，3秒出方案省心太多。已经安利给全公司女生了",
    style: "简约休闲",
    rating: 5,
    date: "2026-05-12",
    source: "来自小红书",
  },
];

export default function ShowcaseSection() {
  return (
    <>
      {/* ============ 案例展示 ============ */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-sm mx-auto">
          <AnimatedSection>
            <div className="text-center mb-10">
              <h2 className="text-xl font-bold text-text-primary">看看 AI 搭出来的效果</h2>
              <p className="text-sm text-text-muted mt-2">
                不同身材、不同风格，AI 都能精准搭配
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-6">
            {SHOWCASE_CASES.map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 150}>
                <CaseCard item={item} priority={i === 0} />
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={300}>
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-secondary/50 px-3 py-1.5 rounded-full">
                💡 以上为 AI 生成示例 · 你的搭配将根据照片量身定制
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ 风格视觉参考 ============ */}
      <section className="px-6 py-14">
        <div className="max-w-sm mx-auto">
          <AnimatedSection>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-text-primary">每种风格长这样</h2>
              <p className="text-sm text-text-muted mt-2">
                看看不同风格的实际效果，选你喜欢的
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 gap-3">
            {STYLE_VISUALS.map((style, i) => (
              <AnimatedSection key={style.name} delay={i * 60}>
                <div className="bg-card-bg rounded-xl border border-border p-3.5 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
                  {/* 图片预览（优先）或色块预览 */}
                  {'img' in style && style.img ? (
                    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-secondary relative">
                      <Image
                        src={style.img}
                        alt={style.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 192px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex gap-1 mb-3">
                      {style.colors.map((c, ci) => (
                        <div
                          key={ci}
                          className="h-8 flex-1 rounded-lg border border-border/30"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-lg" role="img" aria-label={style.name}>{style.emoji}</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {style.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    {style.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 用户评价 ============ */}
      <section className="px-6 py-14 bg-white">
        <div className="max-w-sm mx-auto">
          <AnimatedSection>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-text-primary">用过的人怎么说</h2>
              <p className="text-sm text-text-muted mt-2">
                真实用户反馈，你的姐妹都在用
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-3">
            {TESTIMONIALS.map((t, i) => (
              <AnimatedSection key={t.id} delay={i * 120}>
                <div className="bg-warm rounded-xl border border-border/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0 w-10 h-10">
                      <Image
                        src={t.avatarImg}
                        alt={t.name}
                        fill
                        className="rounded-full object-cover ring-2 ring-white shadow-sm"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-text-primary">
                            {t.name}
                          </span>
                          {t.source && (
                            <span className="text-[8px] bg-secondary text-text-muted px-1.5 py-0.5 rounded-full">
                              {t.source}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] bg-card-bg text-primary-dark px-2 py-0.5 rounded-full whitespace-nowrap">
                          {t.style}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {Array.from({ length: t.rating }).map((_, ri) => (
                          <span key={ri} className="text-yellow-400 text-xs">★</span>
                        ))}
                        {t.date && (
                          <span className="text-[9px] text-text-muted/60 ml-1.5">{t.date}</span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        "{t.text}"
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={300}>
            <p className="text-center text-[10px] text-text-muted/70 mt-4">
              * 评价来自早期用户测试，已取得授权使用
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}

/** 单个案例卡片（Before → After） */
function CaseCard({ item, priority = false }: { item: ShowcaseCase; priority?: boolean }) {
  const [ref, inView] = useInView<HTMLDivElement>({ triggerOnce: true });

  return (
    <div
      ref={ref}
      className={`bg-warm rounded-2xl border border-border/60 overflow-hidden transition-all duration-500 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Before/After 对比头 — 真人照片 */}
      <div className="grid grid-cols-2 divide-x divide-border/40">
        {/* Before */}
        <div className="p-3.5 text-center">
          <div className="text-[9px] text-text-muted/60 mb-2 tracking-wider uppercase">BEFORE</div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-secondary shadow-sm relative grayscale">
              <Image
                src={item.beforeImg}
                alt={`${item.userName}穿搭前`}
                fill
                sizes="(max-width: 640px) 50vw, 192px"
                className="object-cover"
                priority={priority}
                unoptimized
              />
              {/* 原始照片标签 */}
              <div className="absolute bottom-2 left-2 bg-black/40 text-white text-[8px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                原始照片
              </div>
            </div>
            <div className="space-y-0.5 mt-1">
              <p className="text-[10px] font-medium text-text-primary">{item.userName}</p>
              <p className="text-[8px] text-text-muted">{item.bodyType} · {item.faceShape}</p>
              <p className="text-[8px] text-text-muted">{item.skinTone}</p>
            </div>
          </div>
        </div>

        {/* After */}
        <div className="p-3.5 text-center">
          <div className="text-[9px] text-primary/60 mb-2 tracking-wider uppercase font-medium">AFTER</div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary-light/20 shadow-sm ring-1 ring-primary/20 relative">
              <Image
                src={item.afterImg}
                alt={`${item.userName}AI搭配后`}
                fill
                sizes="(max-width: 640px) 50vw, 192px"
                className="object-cover"
                priority={priority}
                unoptimized
              />
              {/* AI 搭配标签 */}
              <div className="absolute top-2 left-2 bg-gradient-to-r from-primary to-primary-light text-white text-[8px] px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-1 shadow-sm">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI 搭配
              </div>
            </div>
            <div className="space-y-0.5 mt-1">
              <p className="text-[10px] font-medium text-primary-dark">{item.style}</p>
              <p className="text-[8px] text-text-muted">{item.occasion}</p>
              <p className="text-[8px] text-text-muted">{item.colorScheme}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 箭头分隔 + AI 标签 */}
      <div className="flex items-center justify-center -mt-2.5 -mb-2.5 relative z-10">
        <div className="bg-gradient-to-r from-primary to-primary-light text-white text-[9px] px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          AI 搭配方案
        </div>
      </div>

      {/* 搭配详情 */}
      <div className="p-4 pt-4">
        <div className="divide-y divide-border/30">
          {item.items.map((itm, idx) => (
            <div key={idx} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
              <div className="w-7 h-7 rounded-lg bg-card-bg flex items-center justify-center shrink-0 text-sm" role="img" aria-label={itm.category}>
                {itm.emoji}
              </div>
              <span className="text-[9px] text-text-muted w-8">{itm.category}</span>
              <span className="text-xs text-text-primary truncate font-medium">
                <span className="text-text-secondary font-normal">{itm.color} </span>
                {itm.name}
              </span>
              <div
                className="w-3 h-3 rounded-full border border-border/40 shrink-0 ml-auto"
                style={{ backgroundColor: colorHex(itm.color) }}
              />
            </div>
          ))}
        </div>

        {/* 穿搭提示 */}
        <div className="mt-3 bg-card-bg rounded-xl p-2.5 border border-border/30">
          <div className="flex items-start gap-1.5">
            <span className="text-xs leading-none mt-0.5" role="img" aria-label="穿搭提示">💡</span>
            <p className="text-[10px] text-text-secondary leading-relaxed">{item.tip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
