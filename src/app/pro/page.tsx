"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProStatus, setProStatus, clearProStatus, getProToken } from "@/lib/pro";
import type { ProStatus } from "@/lib/pro";

type ActivationMode = "qr" | "code";

export default function ProPage() {
  const router = useRouter();
  const [proStatus, setProStatusState] = useState<ProStatus>({ isPro: false, expiresAt: null, daysLeft: 0 });
  const [activationMode, setActivationMode] = useState<ActivationMode>("code");
  const [activationCode, setActivationCode] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState("");
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [verifyingServer, setVerifyingServer] = useState(false);

  // 页面加载时检查 Pro 状态（包括服务端验证）
  useEffect(() => {
    const local = getProStatus();
    if (local.isPro && local.expiresAt) {
      // 有本地 token，验证服务端
      setVerifyingServer(true);
      const token = getProToken();
      if (token) {
        fetch("/api/pro/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.isPro) {
              setProStatusState({ isPro: true, expiresAt: data.expiresAt, daysLeft: local.daysLeft });
            } else {
              clearProStatus();
              setProStatusState({ isPro: false, expiresAt: null, daysLeft: 0 });
            }
          })
          .catch(() => {
            // 服务端验证失败，信任本地状态
            setProStatusState(local);
          })
          .finally(() => setVerifyingServer(false));
      } else {
        setProStatusState(local);
        setVerifyingServer(false);
      }
    }
  }, []);

  const handleActivate = async () => {
    const trimmed = activationCode.trim();
    if (!trimmed) {
      setActivationError("请输入激活码");
      return;
    }

    setIsActivating(true);
    setActivationError("");

    try {
      const res = await fetch("/api/pro/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setProStatus(data.token, data.expiresAt);
        setActivationSuccess(true);
        setProStatusState({ isPro: true, expiresAt: data.expiresAt, daysLeft: 30 });
      } else {
        setActivationError(data.error || "激活失败，请检查激活码");
      }
    } catch {
      setActivationError("网络错误，请稍后重试");
    } finally {
      setIsActivating(false);
    }
  };

  const handleReset = () => {
    router.push("/");
  };

  // 已激活状态
  if (activationSuccess || proStatus.isPro) {
    return (
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24">
        {/* 顶栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">✨</span>
            <span className="font-bold text-text-primary text-lg">衣搭</span>
          </div>
          <button onClick={handleReset} className="text-sm text-text-muted hover:text-text-primary transition-colors">
            回到首页
          </button>
        </div>

        <div className="animate-slide-up space-y-6">
          {/* 成功/已激活卡片 */}
          <div className="bg-card-bg rounded-2xl border border-border p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              {activationSuccess ? "Pro 会员激活成功！" : "已是 Pro 会员"}
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              尽情享受无限次穿搭生成
            </p>
            {proStatus.daysLeft > 0 && (
              <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
                <span className="text-lg">✨</span>
                <span className="text-sm font-semibold text-primary-dark">
                  剩余 {proStatus.daysLeft} 天
                </span>
              </div>
            )}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push("/generate")}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light text-white
                           rounded-xl font-semibold text-base hover:opacity-90 transition-all active:scale-[0.98]"
              >
                ✨ 开始无限搭配
              </button>
              <button
                onClick={() => {
                  clearProStatus();
                  setProStatusState({ isPro: false, expiresAt: null, daysLeft: 0 });
                  setActivationSuccess(false);
                }}
                className="text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                退出登录（清除本地状态）
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 加载中
  if (verifyingServer) {
    return (
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-3 border-secondary" />
            <div className="absolute inset-0 rounded-full border-3 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-text-muted">验证中...</p>
        </div>
      </div>
    );
  }

  // 非 Pro 用户：展示价格和激活
  return (
    <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-primary text-xl">✨</span>
          <span className="font-bold text-text-primary text-lg">衣搭</span>
        </div>
        <button onClick={handleReset} className="text-sm text-text-muted hover:text-text-primary transition-colors">
          回到首页
        </button>
      </div>

      <div className="space-y-6 animate-slide-up">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-xs text-primary-dark font-medium">限时特惠</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary leading-tight">
            升级 Pro 会员
          </h1>
          <p className="text-sm text-text-secondary">
            无限次生成穿搭方案，让 AI 成为你的私人搭配师
          </p>
        </div>

        {/* 价格卡片 */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 rounded-2xl border border-primary/20 p-6 text-center relative overflow-hidden">
          {/* 装饰光晕 */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="text-5xl font-bold text-text-primary">
              <span className="text-2xl align-top">¥</span>19.9
              <span className="text-base font-normal text-text-muted">/月</span>
            </div>
            <p className="text-xs text-text-muted mt-2">
              每天仅需约 0.66 元 · 无限次搭配
            </p>

            {/* 节省提示 */}
            <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1">
              <span className="text-green-600 text-xs">相比免费版价值提升 10 倍</span>
            </div>

            {/* CTA */}
            <button
              onClick={() => document.getElementById("activation-section")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-5 w-full py-3.5 bg-gradient-to-r from-primary to-primary-light text-white
                         rounded-xl font-semibold text-base hover:shadow-lg hover:shadow-primary/25
                         transition-all active:scale-[0.98] shadow-md shadow-primary/20"
            >
              🚀 立即开通 Pro
            </button>
          </div>
        </div>

        {/* 功能对比 */}
        <div className="bg-card-bg rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-1.5">
            <span>📊</span> 功能对比
          </h3>
          <div className="space-y-3">
            {[
              { feature: "每日穿搭生成", free: "3 次", pro: "无限次 ✨" },
              { feature: "AI 体型分析", free: "✓", pro: "✓" },
              { feature: "风格/场合选择", free: "✓", pro: "✓" },
              { feature: "AI 配图功能", free: "—", pro: "即将上线" },
              { feature: "专属客服", free: "—", pro: "✓" },
              { feature: "去水印", free: "—", pro: "✓" },
            ].map((item) => (
              <div key={item.feature} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <span className="text-xs text-text-primary">{item.feature}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-text-muted w-12 text-center">{item.free}</span>
                  <span className="text-[11px] text-primary-dark font-semibold w-16 text-center">{item.pro}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 激活区域 */}
        <div id="activation-section" className="bg-card-bg rounded-2xl border border-border p-5">
          {/* 切换 tab */}
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => setActivationMode("code")}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                activationMode === "code"
                  ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-sm"
                  : "bg-secondary text-text-muted hover:text-text-primary"
              }`}
            >
              🔑 激活码
            </button>
            <button
              onClick={() => setActivationMode("qr")}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                activationMode === "qr"
                  ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-sm"
                  : "bg-secondary text-text-muted hover:text-text-primary"
              }`}
            >
              📱 支付宝
            </button>
          </div>

          {activationMode === "code" ? (
            /* 激活码输入 */
            <div className="space-y-3">
              <p className="text-xs text-text-secondary">
                🎯 输入激活码开通 Pro 会员
              </p>
              <input
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value);
                  if (activationError) setActivationError("");
                }}
                placeholder="请输入激活码"
                maxLength={32}
                disabled={isActivating}
                className="w-full rounded-xl border border-border bg-white p-3 text-sm
                           text-text-primary placeholder:text-text-muted/60 outline-none text-center tracking-[0.2em]
                           focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                           disabled:opacity-50 transition-all"
              />
              <button
                onClick={handleActivate}
                disabled={isActivating || !activationCode.trim()}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white
                           rounded-xl text-sm font-semibold disabled:opacity-40
                           hover:opacity-90 transition-all active:scale-[0.98]"
              >
                {isActivating ? "验证中..." : "✨ 激活 Pro 会员"}
              </button>
              {activationError && (
                <p className="text-xs text-red-400 animate-fade-in text-center">{activationError}</p>
              )}
              <p className="text-[10px] text-text-muted text-center">
                激活码请联系客服获取 · 激活后有效期 30 天
              </p>
            </div>
          ) : (
            /* 支付宝支付 */
            <div className="space-y-4 text-center">
              <div className="bg-secondary/50 rounded-xl p-6">
                <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center border border-border">
                  <div className="text-center">
                    <span className="text-5xl">📱</span>
                    <p className="text-xs text-text-muted mt-2">支付宝收款码</p>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-3">
                  支付宝扫码支付 ¥19.9
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-text-secondary">
                  支付完成后，将订单号后 4 位发送给客服获取激活码
                </p>
                <button
                  onClick={() => setActivationMode("code")}
                  className="text-xs text-primary hover:text-primary-dark transition-colors"
                >
                  已有激活码？点击输入 →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 常见问题 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary text-center">常见问题</h3>
          {[
            { q: "Pro 会员可以退款吗？", a: "购买后 7 天内可无条件退款，联系客服处理。" },
            { q: "激活码有效期多久？", a: "激活码需在获取后 48 小时内使用，过期失效。" },
            { q: "Pro 到期后怎么办？", a: "到期后自动降级为免费版，历史数据显示不变。" },
          ].map((faq, i) => (
            <details key={i} className="bg-card-bg rounded-xl border border-border group open:border-primary/20 transition-all">
              <summary className="text-xs font-medium text-text-primary p-3 cursor-pointer list-none flex items-center justify-between">
                {faq.q}
                <svg className="w-3.5 h-3.5 text-text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-xs text-text-secondary px-3 pb-3">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
