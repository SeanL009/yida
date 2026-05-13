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
  { id: "韩系穿搭", emoji: "🇰🇷" },
  { id: "法式慵懒", emoji: "🇫🇷" },
  { id: "日系清新", emoji: "🍃" },
  { id: "学院风", emoji: "👩‍🎓" },
  { id: "轻熟风", emoji: "🤵" },
  { id: "辣妹风", emoji: "🌶️" },
  { id: "波西米亚", emoji: "🧣" },
  { id: "街头复古", emoji: "🧢" },
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
  { id: "逛展/看展", emoji: "🖼️" },
  { id: "拍照打卡", emoji: "📸" },
  { id: "游乐园", emoji: "🎢" },
  { id: "音乐节", emoji: "🎵" },
  { id: "户外露营", emoji: "⛺" },
  { id: "校园日常", emoji: "📚" },
  { id: "海边度假", emoji: "🌊" },
  { id: "生日派对", emoji: "🎂" },
  { id: "早午餐", emoji: "🥐" },
  { id: "随机搭配", emoji: "🎲" },
];

export const COLOR_SCHEMES = [
  { id: "暖色系", emoji: "🧡" },
  { id: "冷色系", emoji: "💙" },
  { id: "中性色", emoji: "🩶" },
  { id: "大地色系", emoji: "🤎" },
  { id: "甜美粉色系", emoji: "💗" },
  { id: "莫兰迪色系", emoji: "🎨" },
  { id: "多巴胺配色", emoji: "🎯" },
  { id: "奶油色系", emoji: "🍦" },
  { id: "黑白色系", emoji: "⚫" },
  { id: "蓝白配色", emoji: "💎" },
  { id: "复古撞色", emoji: "🎪" },
  { id: "随机搭配", emoji: "🎲" },
];

export const SEASONS = [
  { id: "春季", emoji: "🌷" },
  { id: "夏季", emoji: "☀️" },
  { id: "秋季", emoji: "🍂" },
  { id: "冬季", emoji: "❄️" },
];
