export interface OutfitItem {
  category: string;
  item: string;
  color?: string;
}

export interface OutfitSuggestion {
  id: number;
  title: string;
  items: OutfitItem[];
  style: string;
  occasion: string;
  colorScheme: string;
  tip: string;
}

export interface AnalysisResult {
  faceShape: string;
  bodyType: string;
  bodyProportions: string;
  skinTone: string;
  stylePreference: string;
  description: string;
  recommendedStyles: string[];
}

export const STYLE_DNA = [
  { id: "简约休闲", emoji: "🧘" },
  { id: "甜美温柔", emoji: "🌸" },
  { id: "职场通勤", emoji: "💼" },
  { id: "运动活力", emoji: "⚡" },
  { id: "新中式", emoji: "🏮" },
  { id: "欧美街头", emoji: "🔥" },
  { id: "复古文艺", emoji: "📷" },
  { id: "优雅气质", emoji: "✨" },
  { id: "随机搭配", emoji: "🎲" },
];

export const OCCASIONS = [
  { id: "日常通勤", emoji: "🚇" },
  { id: "约会聚餐", emoji: "💕" },
  { id: "面试见客户", emoji: "📋" },
  { id: "旅行出游", emoji: "✈️" },
  { id: "运动健身", emoji: "🏃" },
  { id: "闺蜜下午茶", emoji: "☕" },
  { id: "参加婚礼", emoji: "🎉" },
  { id: "居家休闲", emoji: "🏠" },
  { id: "随机搭配", emoji: "🎲" },
];

export const COLOR_SCHEMES = [
  { id: "暖色系（红橙棕）", emoji: "🧡" },
  { id: "冷色系（蓝绿紫）", emoji: "💙" },
  { id: "中性色（黑白灰）", emoji: "🩶" },
  { id: "大地色系", emoji: "🤎" },
  { id: "甜美粉色系", emoji: "💗" },
  { id: "随机搭配", emoji: "🎲" },
];
