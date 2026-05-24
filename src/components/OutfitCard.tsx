"use client";

import { type OutfitSuggestion } from "@/lib/types";

interface OutfitCardProps {
  outfit: OutfitSuggestion;
  onShare?: () => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  "外套": "🧥",
  "上装": "👚",
  "下装": "👖",
  "裙子": "👗",
  "鞋子": "👟",
  "配饰": "👜",
  "包包": "👜",
  "帽子": "🧢",
  "袜子": "🧦",
  "首饰": "💍",
};

const COLOR_MAP: Record<string, string> = {
  "米色": "#f5e6d3",
  "白色": "#ffffff",
  "黑色": "#2d2d2d",
  "深蓝": "#1a2744",
  "浅蓝": "#b8d4e3",
  "蓝色": "#4a7fa5",
  "棕色": "#8b6b4a",
  "卡其": "#c3a87c",
  "灰色": "#999999",
  "浅灰": "#d4d4d4",
  "深灰": "#666666",
  "红色": "#c94a4a",
  "粉色": "#f5a0b8",
  "绿色": "#6b9e6b",
  "深绿": "#3d6b3d",
  "紫色": "#8c6fe8",
  "驼色": "#c49a6c",
  "杏色": "#e8cfa6",
  "裸色": "#e8c5b0",
  "藏青": "#1b2a4a",
  "牛仔": "#5b7fa5",
  "花纹": "#e0d8dc",
};

function colorToHex(color: string): string {
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (color.includes(key)) return hex;
  }
  return "#e0d8dc";
}

export default function OutfitCard({ outfit, onShare }: OutfitCardProps) {
  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    const shareText = `✨ 衣搭AI穿搭方案\n\n${outfit.items
      .map((item) => `${CATEGORY_EMOJI[item.category] || "•"} ${item.category}：${item.color ? item.color + " " : ""}${item.item}`)
      .join("\n")}\n\n🏷️ 风格：${outfit.style} ｜ 场合：${outfit.occasion}${outfit.colorScheme ? ` ｜ 配色：${outfit.colorScheme}` : ""}\n💡 ${outfit.tip}\n\n—— 来自「衣搭」AI穿搭助手`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // 用户取消分享
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert("文案已复制到剪贴板，去小红书粘贴发布吧！📋");
      } catch {
        // 剪贴板不可用
      }
    }
  };

  return (
    <div className="bg-card-bg rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow duration-300">
      {/* 卡片头部 */}
      <div className="bg-gradient-to-r from-primary to-primary-light p-4 text-white">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-widest opacity-75">
            衣搭 · AI 搭配方案
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
            方案 {outfit.id}
          </span>
        </div>
        <h3 className="text-lg font-bold">{outfit.title}</h3>
      </div>

      {/* 搭配单品列表 */}
      <div className="p-4">
        <div className="divide-y divide-border/40">
          {outfit.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              {/* 分类图标圆圈 */}
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <span className="text-base" role="img" aria-label={item.category}>{CATEGORY_EMOJI[item.category] || "•"}</span>
              </div>

              {/* 单品详情 */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-text-muted">{item.category}</p>
                <p className="text-sm font-medium text-text-primary truncate">
                  {item.color && (
                    <span className="text-text-secondary font-normal">{item.color} </span>
                  )}
                  {item.item}
                </p>
              </div>

              {/* 颜色小圆点 */}
              {item.color && (
                <div
                  className="w-4 h-4 rounded-full border border-border/50 shrink-0"
                  style={{ backgroundColor: colorToHex(item.color) }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 标签 + 穿搭提示 */}
      <div className="px-4 pb-4 space-y-3">
        {/* 标签行（水平滚动） */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <span className="inline-flex items-center gap-1 text-[10px] bg-tag-bg text-primary-dark px-2.5 py-1 rounded-full whitespace-nowrap">
            📍 {outfit.occasion}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-tag-bg text-primary-dark px-2.5 py-1 rounded-full whitespace-nowrap">
            🎨 {outfit.style}
          </span>
          {outfit.colorScheme && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-tag-bg text-primary-dark px-2.5 py-1 rounded-full whitespace-nowrap">
              🎨 {outfit.colorScheme}
            </span>
          )}
        </div>

        {/* 穿搭提示 */}
        {outfit.tip && (
          <div className="bg-warm rounded-xl p-3 border border-border/30">
            <div className="flex items-start gap-2">
              <span className="text-sm leading-none mt-0.5" role="img" aria-label="穿搭提示">💡</span>
              <p className="text-xs text-text-secondary leading-relaxed">{outfit.tip}</p>
            </div>
          </div>
        )}
      </div>

      {/* 分享按钮 */}
      <div className="px-4 pb-4">
        <button
          onClick={handleShare}
          className="group w-full py-2.5 bg-gradient-to-r from-primary to-primary-light text-white
                     rounded-xl text-sm font-medium
                     hover:shadow-md hover:shadow-primary/25 transition-all duration-200
                     active:scale-[0.97] flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          分享穿搭到小红书
        </button>
      </div>
    </div>
  );
}
