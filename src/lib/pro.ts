/**
 * Pro 会员工具函数
 * 用于激活码验证和 Pro 状态管理
 */

export const ACTIVATION_CODE = "1314";
export const PRO_DURATION_DAYS = 30;
export const STORAGE_KEY = "yida_pro";

interface ProStatus {
  isPro: boolean;
  expiresAt: string | null;
  daysLeft: number;
}

interface ProData {
  token: string;
  activatedAt: string;
  expiresAt: string;
}

/** 从 localStorage 读取 Pro 状态 */
export function getProStatus(): ProStatus {
  if (typeof window === "undefined") {
    return { isPro: false, expiresAt: null, daysLeft: 0 };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isPro: false, expiresAt: null, daysLeft: 0 };

    const data: ProData = JSON.parse(raw);
    const now = Date.now();
    const expires = new Date(data.expiresAt).getTime();

    if (now >= expires) {
      localStorage.removeItem(STORAGE_KEY);
      return { isPro: false, expiresAt: null, daysLeft: 0 };
    }

    const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    return { isPro: true, expiresAt: data.expiresAt, daysLeft };
  } catch {
    return { isPro: false, expiresAt: null, daysLeft: 0 };
  }
}

/** 写入 Pro 状态到 localStorage */
export function setProStatus(token: string, expiresAt: string): void {
  if (typeof window === "undefined") return;

  const data: ProData = {
    token,
    activatedAt: new Date().toISOString(),
    expiresAt,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** 清除 Pro 状态 */
export function clearProStatus(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** 获取 Pro token */
export function getProToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: ProData = JSON.parse(raw);
    return data.token || null;
  } catch {
    return null;
  }
}
