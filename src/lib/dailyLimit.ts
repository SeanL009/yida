import { getProStatus } from "./pro";

const STORAGE_KEY = "yida_daily_usage";
const DAILY_LIMIT = 3;

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

function getUsage(): DailyUsage {
  if (typeof window === "undefined") {
    return { date: getToday(), count: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as DailyUsage;
      if (data.date === getToday()) {
        return data;
      }
    }
  } catch {
    // ignore
  }
  return { date: getToday(), count: 0 };
}

function saveUsage(usage: DailyUsage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // ignore
  }
}

/** 今天还有几次可用 */
export function getRemainingUses(): number {
  const pro = getProStatus();
  if (pro.isPro) return Infinity;

  const usage = getUsage();
  return Math.max(0, DAILY_LIMIT - usage.count);
}

/** 检查是否还能生成 */
export function canGenerate(): boolean {
  const pro = getProStatus();
  if (pro.isPro) return true;

  return getRemainingUses() > 0;
}

/** 记录一次生成，返回剩余次数 */
export function recordGeneration(): { remaining: number; allowed: boolean } {
  // Pro 用户永远允许，不消耗次数
  const pro = getProStatus();
  if (pro.isPro) {
    return { remaining: Infinity, allowed: true };
  }

  const usage = getUsage();
  if (usage.count >= DAILY_LIMIT) {
    return { remaining: 0, allowed: false };
  }
  usage.count += 1;
  saveUsage(usage);
  return { remaining: DAILY_LIMIT - usage.count, allowed: true };
}

export { DAILY_LIMIT };
