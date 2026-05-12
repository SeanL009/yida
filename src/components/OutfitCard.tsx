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

export default function OutfitCard({ outfit, onShare }: OutfitCardProps) {
  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    // 尝试使用 Web Share API
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
      // 降级：复制到剪贴板
      try {
        await navigator.clipboard.writeText(shareText);
        alert("文案已复制到剪贴板，去小红书粘贴发布吧！📋");
      } catch {
        // 剪贴板不可用
      }
    }
  };

  return (
    <div className="bg-card-bg rounded-2xl overflow-hidden shadow-sm border border-border">
      {/* 卡片头部 */}
      <div className="bg-gradient-to-r from-primary to-primary-light p-4 text-white text-center">
        <div className="text-xs uppercase tracking-widest opacity-80">
          衣搭 · 穿搭方案
        </div>
        <h3 className="text-lg font-bold mt-1">{outfit.title}</h3>
      </div>

      {/* 搭配单品列表 */}
      <div className="p-4 space-y-2.5">
        {outfit.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0"
          >
            <span className="text-lg">
              {CATEGORY_EMOJI[item.category] || "•"}
            </span>
            <span className="text-text-muted text-xs w-10 font-medium">
              {item.category}
            </span>
            <span className="text-text-primary text-sm font-medium">
              {item.color && (
                <span className="text-text-muted font-normal">{item.color} </span>
              )}
              {item.item}
            </span>
          </div>
        ))}
      </div>

      {/* 场景标签和搭配要点 */}
      <div className="px-4 pb-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-xs bg-tag-bg text-primary-dark px-2.5 py-1 rounded-full">
            📍 {outfit.occasion}
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-tag-bg text-primary-dark px-2.5 py-1 rounded-full">
            🎨 {outfit.style}
          </span>
          {outfit.colorScheme && (
            <span className="inline-flex items-center gap-1 text-xs bg-tag-bg text-primary-dark px-2.5 py-1 rounded-full">
              🎨 {outfit.colorScheme}
            </span>
          )}
        </div>
        {outfit.tip && (
          <div className="bg-warm rounded-xl p-3">
            <p className="text-xs text-text-secondary leading-relaxed">
              💡 {outfit.tip}
            </p>
          </div>
        )}
      </div>

      {/* 分享按钮 */}
      <div className="px-4 pb-4">
        <button
          onClick={handleShare}
          className="w-full py-2.5 bg-gradient-to-r from-primary to-primary-light text-white
                     rounded-xl text-sm font-medium hover:opacity-90 transition-opacity
                     active:scale-[0.98]"
        >
          📤 分享穿搭
        </button>
      </div>
    </div>
  );
}
