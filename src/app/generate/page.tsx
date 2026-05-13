"use client";

import { useState, useEffect } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import OutfitCard from "@/components/OutfitCard";
import FeedbackForm from "@/components/FeedbackForm";
import { STYLE_DNA, OCCASIONS, COLOR_SCHEMES } from "@/lib/types";
import type { AnalysisResult, OutfitSuggestion } from "@/lib/types";
import {
  canGenerate,
  recordGeneration,
  getRemainingUses,
  DAILY_LIMIT,
} from "@/lib/dailyLimit";
import { getProStatus, getProToken } from "@/lib/pro";
import Link from "next/link";

type Step = "upload" | "choose" | "generating" | "result";

export default function GeneratePage() {
  const [step, setStep] = useState<Step>("upload");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [selectedColorScheme, setSelectedColorScheme] = useState<string>("随机搭配");
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>([]);
  const [error, setError] = useState<string>("");
  const [usedCount, setUsedCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [proDaysLeft, setProDaysLeft] = useState(0);
  const [serverProVerified, setServerProVerified] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    // 检查本地 Pro 状态
    const pro = getProStatus();
    if (pro.isPro) {
      // 服务端验证 token
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
              setIsPro(true);
              setProDaysLeft(pro.daysLeft);
            }
          })
          .catch(() => {
            // 离线时信任本地状态
            setIsPro(true);
            setProDaysLeft(pro.daysLeft);
          })
          .finally(() => setServerProVerified(true));
      } else {
        setIsPro(true);
        setProDaysLeft(pro.daysLeft);
        setServerProVerified(true);
      }
    } else {
      setServerProVerified(true);
    }

    if (!pro.isPro) {
      setUsedCount(DAILY_LIMIT - getRemainingUses());
      setLimitReached(!canGenerate());
    }
  }, []);

  const handleImageReady = async (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setError("");
    setStep("generating");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        setStep("choose");
      } else {
        setError(data.error || "分析失败");
        setStep("upload");
      }
    } catch {
      setError("网络错误，请重试");
      setStep("upload");
    }
  };

  const handleGenerate = async () => {
    if (!selectedStyle || !selectedOccasion) return;

    const check = recordGeneration();
    if (!check.allowed) {
      setLimitReached(true);
      return;
    }

    setStep("generating");
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          style: selectedStyle,
          occasion: selectedOccasion,
          colorScheme: selectedColorScheme,
          count: 1,
        }),
      });
      const data = await res.json();
      if (data.outfits && data.outfits.length > 0) {
        setOutfits(data.outfits);
        setUsedCount((c) => c + 1);
        setStep("result");
      } else {
        setError(data.error || "生成失败");
        setStep("choose");
      }
    } catch {
      setError("网络错误，请重试");
      setStep("choose");
    }
  };

  /** 更换一套穿搭：相同风格/场合/配色，重新生成一套不同的 */
  const handleRegenerate = async () => {
    if (isRegenerating) return;

    // 非 Pro 用户需要消耗次数
    if (!isPro) {
      const check = recordGeneration();
      if (!check.allowed) {
        setLimitReached(true);
        return;
      }
    }

    setIsRegenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          style: selectedStyle,
          occasion: selectedOccasion,
          colorScheme: selectedColorScheme,
          count: 1,
          variation: true,
        }),
      });
      const data = await res.json();
      if (data.outfits && data.outfits.length > 0) {
        setOutfits(data.outfits);
        if (!isPro) setUsedCount((c) => c + 1);
      } else {
        setError(data.error || "生成失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setImageDataUrl("");
    setAnalysis(null);
    setSelectedStyle("");
    setSelectedOccasion("");
    setSelectedColorScheme("随机搭配");
    setOutfits([]);
    setError("");
    setLimitReached(!canGenerate());
  };

  const stepMap: Step[] = ["upload", "choose", "result"];
  const currentIdx = stepMap.indexOf(step);

  return (
    <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-primary text-xl">✨</span>
          <span className="font-bold text-text-primary text-lg">衣搭</span>
          {isPro && (
            <Link
              href="/pro"
              className="text-[10px] bg-gradient-to-r from-primary to-primary-light text-white px-2 py-0.5 rounded-full font-medium animate-fade-in"
            >
              ✨ Pro {proDaysLeft > 0 ? `${proDaysLeft}天` : ""}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isPro && (
            <Link
              href="/pro"
              className="text-[10px] bg-gradient-to-r from-primary to-primary-light text-white px-2.5 py-1 rounded-full font-medium hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
            >
              ✨ Pro
            </Link>
          )}
          <button
            onClick={handleReset}
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            重新开始
          </button>
        </div>
      </div>

      {/* ===== 步骤指示器（优化版） ===== */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {[
          { num: 1, label: "上传照片", key: "upload" as Step },
          { num: 2, label: "选择风格", key: "choose" as Step },
          { num: 3, label: "生成方案", key: "result" as Step },
        ].map((s, i) => {
          const isActive = i <= currentIdx;
          const isCurrent = i === currentIdx;
          const isPast = i < currentIdx;

          return (
            <div key={s.num} className="flex items-center">
              {/* 步骤圆圈 */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-500 ease-out
                    ${
                      isActive
                        ? "bg-gradient-to-br from-primary to-primary-light text-white shadow-md shadow-primary/25"
                        : "bg-secondary text-text-muted"
                    }
                    ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}
                  `}
                >
                  {isPast ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`text-[10px] ${
                    isActive ? "text-text-primary font-medium" : "text-text-muted"
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {/* 连接线（渐变色填充） */}
              {i < 2 && (
                <div className="w-10 md:w-16 h-0.5 mx-1 relative">
                  <div className="absolute inset-0 bg-border rounded-full" />
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${
                        currentIdx > i ? 100 : currentIdx === i && step === "generating" ? 50 : 0
                      }%`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl mb-4 animate-fade-in">
          {error}
        </div>
      )}

      {/* ===== 步骤内容容器（key 触发切换动画） ===== */}
      <div key={step} className="animate-slide-up">
        {/* Step 1: 上传 */}
        {step === "upload" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary text-center">
              上传你的照片
            </h2>
            <p className="text-text-secondary text-sm text-center">
              上传一张全身照或半身照，AI将根据你的体型和风格给出穿搭建议
            </p>
            <PhotoUpload onImageReady={handleImageReady} />
          </div>
        )}

        {/* Step 2: 选择风格和场合 */}
        {step === "choose" && analysis && (
          <div className="space-y-6">
            {/* AI 分析结果（优化版） */}
            <div className="bg-card-bg rounded-2xl p-4 border border-border">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">✨</span>
                AI分析结果
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "脸型", value: analysis.faceShape, icon: "👩" },
                  { label: "体型", value: analysis.bodyType, icon: "🧍‍♀️" },
                  { label: "肤色", value: analysis.skinTone, icon: "✋" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-gradient-to-b from-secondary/80 to-secondary/30 rounded-xl p-3 text-center border border-border/30"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-[9px] text-text-muted mt-1">{item.label}</p>
                    <p className="text-xs font-semibold text-text-primary mt-0.5">
                      {item.value || "—"}
                    </p>
                  </div>
                ))}
              </div>
              {analysis.bodyProportions && (
                <p className="text-[10px] text-text-secondary text-center mt-2">
                  {analysis.bodyProportions}
                </p>
              )}
              {analysis.recommendedStyles && analysis.recommendedStyles.length > 0 && (
                <div className="pt-2.5 mt-2.5 border-t border-border">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {analysis.recommendedStyles.map((rec, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-secondary text-primary-dark px-2.5 py-1 rounded-full animate-fade-up"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 风格选择 */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">选择风格</h3>
              <div className="grid grid-cols-4 gap-2">
                {STYLE_DNA.map((s) => {
                  const sel = selectedStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStyle(s.id)}
                      className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border text-sm
                        transition-all duration-200 active:scale-95
                        ${sel
                          ? "border-primary bg-gradient-to-b from-primary/8 to-primary/3 text-primary-dark font-medium shadow-sm"
                          : "border-border bg-card-bg text-text-secondary hover:border-primary/30 hover:shadow-xs"
                        }`}
                    >
                      {sel && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <span className="text-xl">{s.emoji}</span>
                      <span className="text-xs">{s.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 场合选择 */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">选择场合</h3>
              <div className="grid grid-cols-4 gap-2">
                {OCCASIONS.map((o) => {
                  const sel = selectedOccasion === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOccasion(o.id)}
                      className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border text-sm
                        transition-all duration-200 active:scale-95
                        ${sel
                          ? "border-primary bg-gradient-to-b from-primary/8 to-primary/3 text-primary-dark font-medium shadow-sm"
                          : "border-border bg-card-bg text-text-secondary hover:border-primary/30 hover:shadow-xs"
                        }`}
                    >
                      {sel && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <span className="text-xl">{o.emoji}</span>
                      <span className="text-xs">{o.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 配色偏好 */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                配色偏好 <span className="text-text-muted font-normal text-xs">（可选，默认随机）</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_SCHEMES.map((c) => {
                  const sel = selectedColorScheme === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedColorScheme(c.id)}
                      className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border text-sm
                        transition-all duration-200 active:scale-95
                        ${sel
                          ? "border-primary bg-gradient-to-b from-primary/8 to-primary/3 text-primary-dark font-medium shadow-sm"
                          : "border-border bg-card-bg text-text-secondary hover:border-primary/30 hover:shadow-xs"
                        }`}
                    >
                      {sel && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <span className="text-xl">{c.emoji}</span>
                      <span className="text-[10px] leading-tight text-center">{c.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 生成按钮 / 已用完 */}
            {limitReached && !isPro ? (
              <div className="bg-card-bg rounded-2xl border border-border p-5 text-center space-y-3">
                <div className="text-3xl">😅</div>
                <p className="text-text-primary font-semibold">今日免费次数已用完</p>
                <p className="text-text-muted text-sm">
                  每天免费 {DAILY_LIMIT} 次，明天再来吧
                </p>
                <Link
                  href="/pro"
                  className="inline-flex items-center gap-1.5 mt-2 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white
                             rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98] shadow-sm"
                >
                  🚀 ¥19.9 升级 Pro · 无限次生成
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleGenerate}
                  disabled={!selectedStyle || !selectedOccasion}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light text-white
                             rounded-xl font-semibold text-base disabled:opacity-40
                             hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  ✨ AI生成穿搭方案
                </button>
                <p className="text-center text-[11px] text-text-muted">
                  今日剩余 {DAILY_LIMIT - usedCount} 次免费生成
                  {!isPro && (
                    <Link href="/pro" className="text-primary hover:text-primary-dark ml-1">
                      升级 Pro 享无限次
                    </Link>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: 分析中 / 生成中（骨架屏） */}
        {step === "generating" && (
          <div className="animate-fade-in space-y-4">
            <div className="flex flex-col items-center justify-center py-10">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-3 border-secondary" />
                <div className="absolute inset-0 rounded-full border-3 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">{analysis ? "✨" : "🔍"}</span>
                </div>
              </div>
              <p className="text-text-primary font-medium mt-4">
                {analysis ? "AI正在为你搭配..." : "AI正在分析你的照片..."}
              </p>
              <p className="text-text-muted text-sm mt-1">
                {analysis ? "根据你的体型和风格定制方案" : "识别脸型、身形比例和肤色"}
              </p>
            </div>

            {/* 骨架屏：预览1张卡片 */}
            <div className="opacity-50">
              <div className="bg-card-bg rounded-2xl overflow-hidden shadow-sm border border-border">
                <div className="bg-gradient-to-r from-primary/60 to-primary-light/60 p-4">
                  <div className="skeleton h-3 w-24 mx-auto" />
                  <div className="skeleton h-4 w-32 mx-auto mt-2" />
                </div>
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="skeleton h-2 w-12" />
                        <div className="skeleton h-3 w-28" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: 结果 */}
        {step === "result" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                ✨ 你的穿搭方案
              </h2>
              <span className="text-xs text-text-muted bg-secondary px-2.5 py-1 rounded-full">
                {isPro ? "✨ Pro 无限次" : `今日 ${DAILY_LIMIT - usedCount}/${DAILY_LIMIT} 次剩余`}
              </span>
            </div>

            {/* 单套穿搭卡片 */}
            {outfits.length > 0 && (
              <div className="animate-slide-up" key={outfits[0].id}>
                <OutfitCard outfit={outfits[0]} />
              </div>
            )}

            {/* 操作按钮组 */}
            <div className="space-y-2.5">
              <div className="flex gap-2.5">
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating || (limitReached && !isPro)}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-light text-white
                             rounded-xl text-sm font-semibold hover:opacity-90 transition-all
                             active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {isRegenerating ? (
                    <>
                      <span className="relative w-4 h-4">
                        <span className="absolute inset-0 rounded-full border-2 border-white/30" />
                        <span className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      </span>
                      生成中...
                    </>
                  ) : (
                    <>🎲 换一套穿搭</>
                  )}
                </button>
                <button
                  onClick={() => setStep("choose")}
                  className="flex-1 py-3 border border-border rounded-xl text-text-primary font-medium
                             hover:bg-secondary transition-colors text-sm active:scale-[0.98]"
                >
                  🔄 换风格/场合
                </button>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-2.5 border border-border/60 rounded-xl text-text-muted
                           hover:text-text-primary hover:bg-secondary/50 transition-all text-xs"
              >
                📸 重新上传照片
              </button>
            </div>

            {/* 非 Pro 用户的剩余次数提示 */}
            {!isPro && (
              <p className="text-center text-[11px] text-text-muted">
                今日剩余 {DAILY_LIMIT - usedCount} 次
                <Link href="/pro" className="text-primary hover:text-primary-dark ml-1">
                  升级 Pro 享无限次更换
                </Link>
              </p>
            )}
          </div>
        )}
      </div>

      <FeedbackForm />
    </div>
  );
}
