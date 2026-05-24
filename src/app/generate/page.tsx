"use client";

import { useState, useRef, useEffect } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import OutfitCard from "@/components/OutfitCard";
import FeedbackForm from "@/components/FeedbackForm";
import { STYLE_DNA, OCCASIONS, COLOR_SCHEMES, SEASONS } from "@/lib/types";
import type { AnalysisResult, OutfitSuggestion } from "@/lib/types";
import { recordGeneration, canGenerate, getRemainingGenerations } from "@/lib/dailyLimit";

type Step = "upload" | "choose" | "generating" | "result";

export default function GeneratePage() {
  const [step, setStep] = useState<Step>("upload");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [selectedColorScheme, setSelectedColorScheme] = useState<string>("随机搭配");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>([]);
  const [error, setError] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [dailyRemaining, setDailyRemaining] = useState(3);
  const [showLimitReached, setShowLimitReached] = useState(false);

  // 检查每日剩余次数
  useEffect(() => {
    setDailyRemaining(getRemainingGenerations());
  }, []);

  // 穿搭照片生成
  const [showImagePayment, setShowImagePayment] = useState(false);
  const [imageGenCode, setImageGenCode] = useState("");
  const [isImageActivating, setIsImageActivating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState("");
  const [imageGenError, setImageGenError] = useState("");
  const [isActivated, setIsActivated] = useState(false);

  // 微信支付
  const [paymentOrderId, setPaymentOrderId] = useState("");
  const [paymentCodeUrl, setPaymentCodeUrl] = useState("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isPollingPayment, setIsPollingPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const paymentIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // 检查每日限制
    if (!canGenerate()) {
      setShowLimitReached(true);
      return;
    }

    recordGeneration();
    setDailyRemaining(getRemainingGenerations());

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
          season: selectedSeason,
          count: 1,
        }),
      });
      const data = await res.json();
      if (data.outfits && data.outfits.length > 0) {
        setOutfits(data.outfits);
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

    // 检查每日限制
    if (!canGenerate()) {
      setShowLimitReached(true);
      return;
    }

    recordGeneration();
    setDailyRemaining(getRemainingGenerations());
    setIsRegenerating(true);
    setError("");

    // 清除之前生成的穿搭照片，让用户可以为新搭配重新生成
    setGeneratedImageUrl("");
    setGeneratedImagePrompt("");
    setShowImagePayment(false);
    setImageGenError("");
    // 清除支付轮询
    if (paymentIntervalRef.current) {
      clearInterval(paymentIntervalRef.current);
      paymentIntervalRef.current = null;
    }
    setIsPollingPayment(false);
    setPaymentCodeUrl("");
    setPaymentOrderId("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          style: selectedStyle,
          occasion: selectedOccasion,
          colorScheme: selectedColorScheme,
          season: selectedSeason,
          count: 1,
          variation: true,
        }),
      });
      const data = await res.json();
      if (data.outfits && data.outfits.length > 0) {
        setOutfits(data.outfits);
      } else {
        setError(data.error || "生成失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setIsRegenerating(false);
    }
  };

  /** 激活并生成穿搭照片 */
  const handleActivateAndGenerateImage = async () => {
    const trimmed = imageGenCode.trim();
    if (!trimmed) {
      setImageGenError("请输入激活码");
      return;
    }

    setIsImageActivating(true);
    setImageGenError("");

    try {
      // 验证激活码（复用 Pro 的 verify API）
      const verifyRes = await fetch("/api/pro/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setImageGenError("激活码无效");
        setIsImageActivating(false);
        return;
      }

      // 激活成功 → 标记已激活，开始生成
      setIsActivated(true);
      setShowImagePayment(false);
      await doGenerateImage();
    } catch {
      setImageGenError("验证失败，请稍后重试");
    } finally {
      setIsImageActivating(false);
    }
  };

  /** 创建微信支付订单 */
  const handleCreateWeChatPayment = async () => {
    if (isCreatingPayment) return;

    setIsCreatingPayment(true);
    setImageGenError("");

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "衣搭 - AI穿搭照片" }),
      });
      const data = await res.json();

      if (data.success && data.codeUrl) {
        setPaymentOrderId(data.orderId);
        setPaymentCodeUrl(data.codeUrl);
        setIsPollingPayment(true);
      } else {
        setImageGenError(data.error || "创建支付失败");
      }
    } catch {
      setImageGenError("网络错误，请稍后重试");
    } finally {
      setIsCreatingPayment(false);
    }
  };

  /** 轮询支付状态 */
  useEffect(() => {
    if (!isPollingPayment || !paymentOrderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payment/status?order_id=${paymentOrderId}`
        );
        const data = await res.json();
        if (data.paid) {
          clearInterval(interval);
          paymentIntervalRef.current = null;
          setIsPollingPayment(false);
          setIsPaid(true);
          setShowImagePayment(false);
        }
      } catch {
        // 轮询失败静默处理
      }
    }, 2000);

    paymentIntervalRef.current = interval;

    return () => {
      if (paymentIntervalRef.current) {
        clearInterval(paymentIntervalRef.current);
        paymentIntervalRef.current = null;
      }
    };
  }, [isPollingPayment, paymentOrderId]);

  /** 直接生成穿搭照片（已付费/已激活后调用） */
  const doGenerateImage = async () => {
    if (isGeneratingImage || !analysis || outfits.length === 0) return;

    setIsGeneratingImage(true);
    setImageGenError("");
    setShowImagePayment(false);
    setGeneratedImageUrl("");

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          style: selectedStyle,
          occasion: selectedOccasion,
          colorScheme: selectedColorScheme,
          season: selectedSeason,
          items: outfits[0].items,
          userImage: imageDataUrl,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setGeneratedImageUrl(data.imageUrl);
        setGeneratedImagePrompt(data.prompt || "");
      } else {
        setImageGenError(data.error || "生成失败");
      }
    } catch {
      setImageGenError("网络错误，请稍后重试");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  /** 保存穿搭照片到本地 */
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveImage = async () => {
    if (isSaving || !generatedImageUrl) return;
    setIsSaving(true);

    try {
      // 先尝试 fetch 下载（跨域图片可能受限）
      const response = await fetch(generatedImageUrl, {
        mode: "cors",
        cache: "no-cache",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `yida-outfit-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // fallback：在新标签页打开，用户可手动保存
        window.open(generatedImageUrl, "_blank");
      }
    } catch {
      // fetch 失败时（如跨域限制）在新标签打开
      window.open(generatedImageUrl, "_blank");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setImageDataUrl("");
    setAnalysis(null);
    setSelectedStyle("");
    setSelectedOccasion("");
    setSelectedColorScheme("随机搭配");
    setSelectedSeason("");
    setOutfits([]);
    setError("");
    // 清除支付/激活状态
    setShowImagePayment(false);
    setGeneratedImageUrl("");
    setGeneratedImagePrompt("");
    setImageGenError("");
    setIsActivated(false);
    setIsPaid(false);
    setPaymentCodeUrl("");
    setPaymentOrderId("");
    setIsPollingPayment(false);
    setImageGenCode("");
    if (paymentIntervalRef.current) {
      clearInterval(paymentIntervalRef.current);
      paymentIntervalRef.current = null;
    }
  };

  const stepMap: Step[] = ["upload", "choose", "result"];
  const currentIdx = stepMap.indexOf(step);

  return (
    <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-primary text-xl">✨</span>
          <span className="font-bold text-text-primary text-lg">衣搭</span>
          {dailyRemaining < 3 && (
            <span className="text-[10px] text-text-muted bg-secondary px-2 py-0.5 rounded-full">
              今日剩余 {dailyRemaining} 次
            </span>
          )}
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          重新开始
        </button>
      </div>

      {/* ===== 步骤指示器（优化版） ===== */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {[
          { num: 1, label: "上传照片", key: "upload" as Step, hint: "📸" },
          { num: 2, label: "选择风格", key: "choose" as Step, hint: "🧘🌸💼🔥" },
          { num: 3, label: "生成方案", key: "result" as Step, hint: "👗✨" },
        ].map((s, i) => {
          const isActive = i <= currentIdx;
          const isCurrent = i === currentIdx;
          const isPast = i < currentIdx;

          return (
            <div key={s.num} className="flex items-center">
              {/* 步骤圆圈 */}
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-500 ease-out
                    ${
                      isActive
                        ? "bg-gradient-to-br from-primary to-primary-light text-white shadow-md shadow-primary/25"
                        : "bg-secondary text-text-muted"
                    }
                    ${isCurrent ? "ring-4 ring-primary/20 scale-110 animate-pulse-ring" : ""}
                  `}
                >
                  {isPast ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={isCurrent ? "animate-fade-in" : ""}>{s.num}</span>
                  )}
                </div>
                <span
                  className={`text-[10px] ${
                    isActive ? "text-text-primary font-medium" : "text-text-muted"
                  }`}
                >
                  {s.label}
                </span>
                {/* 步骤预览缩略图 — 未到达的步骤淡出显示，已完成的保持可见 */}
                <span
                  className={`leading-none transition-all duration-300 ${
                    !isActive
                      ? "opacity-35 text-[8px]"
                      : isPast
                        ? "opacity-60 text-[8px]"
                        : "opacity-0 h-0 overflow-hidden"
                  }`}
                >
                  {s.hint}
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

      {/* 每日限制已用完 */}
      {showLimitReached && (
        <div className="bg-card-bg rounded-2xl border border-border p-6 text-center animate-scale-up mb-4">
          <div className="text-4xl mb-3">⏰</div>
          <h3 className="text-base font-bold text-text-primary mb-1">今日免费次数已用完</h3>
          <p className="text-xs text-text-muted mb-4">
            每天可免费生成 3 套穿搭方案，明天再来吧
          </p>
          <button
            onClick={() => setShowLimitReached(false)}
            className="block mx-auto mt-3 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            关闭
          </button>
        </div>
      )}

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

            {/* 季节选择 */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                季节 <span className="text-text-muted font-normal text-xs">（可选，推荐当季搭配）</span>
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {SEASONS.map((s) => {
                  const sel = selectedSeason === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSeason(sel ? "" : s.id)}
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

            {/* 生成按钮 */}
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
            </div>
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
            <h2 className="text-lg font-bold text-text-primary mb-2">
              ✨ 你的穿搭方案
            </h2>

            {/* 单套穿搭卡片 */}
            {outfits.length > 0 && (
              <div className="animate-slide-up" key={outfits[0].id}>
                <OutfitCard outfit={outfits[0]} />

                {/* 生成穿搭照片 */}
                <div className="mt-3">
                  {generatedImageUrl ? (
                    /* 已生成照片展示 */
                    <div className="bg-card-bg rounded-2xl overflow-hidden border border-border animate-scale-up">
                      <div className="relative">
                        <img
                          src={generatedImageUrl}
                          alt="AI生成的穿搭照片"
                          className="w-full object-contain max-h-[500px] bg-white"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                          📸 AI 穿搭照片
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-text-muted">
                            {generatedImagePrompt ? "AI 根据穿搭方案生成" : ""}
                          </span>
                          <button
                            onClick={handleSaveImage}
                            disabled={isSaving}
                            className="flex items-center gap-1 text-xs text-white bg-primary hover:bg-primary-dark
                                       px-3 py-1.5 rounded-lg font-medium transition-all active:scale-95
                                       disabled:opacity-60"
                          >
                            {isSaving ? (
                              <>
                                <span className="relative w-3.5 h-3.5">
                                  <span className="absolute inset-0 rounded-full border-2 border-white/30" />
                                  <span className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                </span>
                                保存中...
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                保存图片
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-text-muted text-center">
                          长按图片可保存到手机相册
                        </p>
                      </div>
                    </div>
                  ) : isGeneratingImage ? (
                    /* 生成中 */
                    <div className="bg-card-bg rounded-2xl border border-border p-8 text-center animate-fade-in">
                      <div className="relative w-14 h-14 mx-auto">
                        <div className="absolute inset-0 rounded-full border-3 border-secondary" />
                        <div className="absolute inset-0 rounded-full border-3 border-primary border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-xl">🎨</div>
                      </div>
                      <p className="text-sm text-text-primary font-medium mt-3">AI 正在生成穿搭照片...</p>
                      <p className="text-[12px] text-text-secondary mt-1">大约需要 10-15 秒</p>
                    </div>
                  ) : showImagePayment ? (
                    /* 支付流程：微信支付 Native 二维码 + 激活码备用 */
                    <div className="bg-card-bg rounded-2xl border border-border p-4 animate-fade-in">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">📸</span>
                        <span className="text-sm font-semibold text-text-primary">生成穿搭照片</span>
                        <span className="text-xs bg-gradient-to-r from-primary to-primary-light text-white px-2 py-0.5 rounded-full font-medium">¥0.99</span>
                      </div>

                      {paymentCodeUrl ? (
                        /* 已创建微信支付订单：展示二维码 */
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(paymentCodeUrl)}`}
                              alt="微信支付二维码"
                              className="w-56 h-56 object-contain rounded-xl border border-border bg-white"
                            />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-sm font-semibold text-text-primary">
                              微信扫码支付 ¥0.99
                            </p>
                            <p className="text-xs text-text-muted">
                              请使用微信扫描二维码完成支付
                            </p>
                          </div>

                          {isPollingPayment && (
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-text-muted">
                              <span className="relative w-4 h-4">
                                <span className="absolute inset-0 rounded-full border-2 border-secondary" />
                                <span className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                              </span>
                              等待支付中...
                            </div>
                          )}

                          {/* 激活码备用入口 */}
                          <details className="group">
                            <summary className="text-[10px] text-text-muted/70 hover:text-text-muted cursor-pointer list-none text-center transition-colors">
                              支付遇到问题？使用激活码
                            </summary>
                            <div className="mt-3 flex gap-2">
                              <input
                                value={imageGenCode}
                                onChange={(e) => {
                                  setImageGenCode(e.target.value);
                                  if (imageGenError) setImageGenError("");
                                }}
                                placeholder="输入激活码"
                                maxLength={32}
                                disabled={isImageActivating}
                                className="flex-1 rounded-xl border border-border bg-white p-2.5 text-sm
                                           text-text-primary placeholder:text-text-muted/60 outline-none text-center
                                           focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                                           disabled:opacity-50 transition-all"
                              />
                              <button
                                onClick={handleActivateAndGenerateImage}
                                disabled={isImageActivating || !imageGenCode.trim()}
                                className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white
                                           rounded-xl text-sm font-semibold disabled:opacity-40
                                           hover:opacity-90 transition-all active:scale-[0.98]"
                              >
                                {isImageActivating ? "验证中..." : "验证并生成"}
                              </button>
                            </div>
                          </details>

                          {imageGenError && (
                            <p className="text-xs text-red-400 text-center animate-fade-in">{imageGenError}</p>
                          )}

                          <button
                            onClick={() => {
                              setShowImagePayment(false);
                              setPaymentCodeUrl("");
                              if (paymentIntervalRef.current) {
                                clearInterval(paymentIntervalRef.current);
                                paymentIntervalRef.current = null;
                              }
                              setIsPollingPayment(false);
                            }}
                            className="w-full py-2 border border-border rounded-xl text-xs text-text-muted
                                       hover:text-text-primary transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        /* 未创建订单：选项 — 微信支付 或 传统收款码+激活码 */
                        <div className="space-y-4">
                          {/* 微信支付按钮 */}
                          <button
                            onClick={handleCreateWeChatPayment}
                            disabled={isCreatingPayment}
                            className="w-full py-3.5 bg-gradient-to-r from-[#07C160] to-[#06AD56] text-white
                                       rounded-xl text-sm font-semibold disabled:opacity-40
                                       hover:opacity-90 transition-all active:scale-[0.98]
                                       flex items-center justify-center gap-2 shadow-sm"
                          >
                            {isCreatingPayment ? (
                              <>
                                <span className="relative w-4 h-4">
                                  <span className="absolute inset-0 rounded-full border-2 border-white/30" />
                                  <span className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                </span>
                                创建订单中...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8.5 13.5l2.5-4 2.5 4H11v3h-1v-3H8.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                </svg>
                                微信支付 ¥0.99
                              </>
                            )}
                          </button>

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-[10px]">
                              <span className="bg-card-bg px-2 text-text-muted">或</span>
                            </div>
                          </div>

                          {/* 传统收款码 + 激活码 */}
                          <details className="group">
                            <summary className="text-xs text-text-muted hover:text-text-primary cursor-pointer list-none text-center transition-colors">
                              使用已有收款码 + 激活码
                            </summary>
                            <div className="mt-3 space-y-3">
                              <div className="flex justify-center">
                                <img
                                  src="/wechat-qr.png"
                                  alt="微信收款码"
                                  className="w-40 h-40 object-contain rounded-xl border border-border"
                                />
                              </div>
                              <p className="text-xs text-text-muted text-center mb-2">
                                支付后输入激活码
                              </p>
                              <div className="flex gap-2">
                                <input
                                  value={imageGenCode}
                                  onChange={(e) => {
                                    setImageGenCode(e.target.value);
                                    if (imageGenError) setImageGenError("");
                                  }}
                                  placeholder="输入激活码"
                                  maxLength={32}
                                  disabled={isImageActivating}
                                  className="flex-1 rounded-xl border border-border bg-white p-2.5 text-sm
                                             text-text-primary placeholder:text-text-muted/60 outline-none text-center
                                             focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                                             disabled:opacity-50 transition-all"
                                />
                                <button
                                  onClick={handleActivateAndGenerateImage}
                                  disabled={isImageActivating || !imageGenCode.trim()}
                                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white
                                             rounded-xl text-sm font-semibold disabled:opacity-40
                                             hover:opacity-90 transition-all active:scale-[0.98]"
                                >
                                  {isImageActivating ? "验证中..." : "验证并生成"}
                                </button>
                              </div>
                            </div>
                          </details>

                          <button
                            onClick={() => setShowImagePayment(false)}
                            className="w-full py-2 border border-border rounded-xl text-xs text-text-muted
                                       hover:text-text-primary transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      )}
                    </div>
                  ) : isPaid ? (
                    /* 已支付：直接生成 */
                    <button
                      onClick={doGenerateImage}
                      disabled={isGeneratingImage}
                      className="w-full py-3 border-2 border-dashed border-primary/30 rounded-xl
                                 text-sm font-medium text-primary hover:border-primary/60
                                 hover:bg-primary/5 transition-all active:scale-[0.98]
                                 flex items-center justify-center gap-2"
                    >
                      {isGeneratingImage ? (
                        <>
                          <span className="relative w-4 h-4">
                            <span className="absolute inset-0 rounded-full border-2 border-primary/30" />
                            <span className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          </span>
                          生成中...
                        </>
                      ) : (
                        <>
                          <span>📸</span>
                          生成穿搭照片
                          <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">已支付</span>
                        </>
                      )}
                    </button>
                  ) : isActivated ? (
                    /* 已激活：直接生成 */
                    <button
                      onClick={doGenerateImage}
                      disabled={isGeneratingImage}
                      className="w-full py-3 border-2 border-dashed border-primary/30 rounded-xl
                                 text-sm font-medium text-primary hover:border-primary/60
                                 hover:bg-primary/5 transition-all active:scale-[0.98]
                                 flex items-center justify-center gap-2"
                    >
                      {isGeneratingImage ? (
                        <>
                          <span className="relative w-4 h-4">
                            <span className="absolute inset-0 rounded-full border-2 border-primary/30" />
                            <span className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          </span>
                          生成中...
                        </>
                      ) : (
                        <>
                          <span>📸</span>
                          生成穿搭照片
                          <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">已激活</span>
                        </>
                      )}
                    </button>
                  ) : (
                    /* 生成按钮（未支付） */
                    <button
                      onClick={() => setShowImagePayment(true)}
                      className="w-full py-3 border-2 border-dashed border-primary/30 rounded-xl
                                 text-sm font-medium text-primary hover:border-primary/60
                                 hover:bg-primary/5 transition-all active:scale-[0.98]
                                 flex items-center justify-center gap-2"
                    >
                      <span>📸</span>
                      生成穿搭照片
                      <span className="text-[10px] bg-primary/10 text-primary-dark px-1.5 py-0.5 rounded">¥0.99</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 操作按钮组 */}
            <div className="space-y-2.5">
              <div className="flex gap-2.5">
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
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

          </div>
        )}
      </div>

      <FeedbackForm />
    </main>
  );
}
