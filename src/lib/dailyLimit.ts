const STORAGE_KEY = "yida_daily_usage";

interface DailyUsage {
  date: string; // YYYY-MM-DD
  count: number;
}

function getToday(): string {
  const now = new Date();
  // 用中国时区（东八区）
  const cnDate = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return cnDate.toISOString().split("T")[0];
}

/** 检查是否还能生成（无限制） */
export function canGenerate(): boolean {
  return true;
}

/** 记录一次生成，返回剩余次数（无限制） */
export function recordGeneration(): { remaining: number; allowed: boolean } {
  return { remaining: Infinity, allowed: true };
}
