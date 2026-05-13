"use client";

export const ACTIVATION_CODE = "1314";
export const PRO_DURATION_DAYS = 30;
const STORAGE_KEY = "yida_pro";

interface ProData {
  token: string;
  activatedAt: string;
  expiresAt: string;
}

export interface ProStatus {
  isPro: boolean;
  expiresAt: string | null;
  daysLeft: number;
}

/** 从 localStorage 读取 Pro 状态 */
export function getProStatus(): ProStatus {
  if (typeof window === "undefined") {
    return { isPro: false, expiresAt: null, daysLeft: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isPro: false, expiresAt: null, daysLeft: 0 };

    const data = JSON.parse(raw) as ProData;
    const expires = new Date(data.expiresAt);
    const now = new Date();

    if (expires <= now) {
      // 已过期，自动清除
      localStorage.removeItem(STORAGE_KEY);
      return { isPro: false, expiresAt: null, daysLeft: 0 };
    }

    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { isPro: true, expiresAt: data.expiresAt, daysLeft };
  } catch {
    return { isPro: false, expiresAt: null, daysLeft: 0 };
  }
}

/** 写入 localStorage Pro 状态 */
export function setProStatus(token: string, expiresAt: string): void {
  if (typeof window === "undefined") return;
  try {
    const data: ProData = {
      token,
      activatedAt: new Date().toISOString(),
      expiresAt,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/** 清除 Pro 状态 */
export function clearProStatus(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** 获取 Pro token（用于服务端验证） */
export function getProToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ProData;
    return data.token || null;
  } catch {
    return null;
  }
}
