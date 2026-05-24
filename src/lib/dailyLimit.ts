const STORAGE_KEY = "yida_daily_usage";
const FREE_DAILY_LIMIT = 3;

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

function readUsage(): DailyUsage {
  if (typeof window === "undefined") {
    return { date: getToday(), count: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), count: 0 };
    const data: DailyUsage = JSON.parse(raw);
    if (data.date !== getToday()) {
      return { date: getToday(), count: 0 };
    }
    return data;
  } catch {
    return { date: getToday(), count: 0 };
  }
}

function writeUsage(usage: DailyUsage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

/** 检查今日是否还能生成 */
export function canGenerate(): boolean {
  const usage = readUsage();
  return usage.count < FREE_DAILY_LIMIT;
}

/** 获取今日剩余次数 */
export function getRemainingGenerations(): number {
  const usage = readUsage();
  return Math.max(0, FREE_DAILY_LIMIT - usage.count);
}

/** 记录一次生成，返回剩余次数 */
export function recordGeneration(): { remaining: number; allowed: boolean } {
  const usage = readUsage();
  if (usage.count >= FREE_DAILY_LIMIT) {
    return { remaining: 0, allowed: false };
  }

  usage.count += 1;
  writeUsage(usage);

  const remaining = FREE_DAILY_LIMIT - usage.count;
  return { remaining, allowed: true };
}
