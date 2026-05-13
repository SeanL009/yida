"use client";

import { useState, useEffect, useRef } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import OutfitCard from "@/components/OutfitCard";
import FeedbackForm from "@/components/FeedbackForm";
import { STYLE_DNA, OCCASIONS, COLOR_SCHEMES, SEASONS } from "@/lib/types";
import type { AnalysisResult, OutfitSuggestion } from "@/lib/types";
import { recordGeneration } from "@/lib/dailyLimit";

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

  // 穿搭照片生成
  const [showImagePayment, setShowImagePayment] = useState(false);
  const [imageGenCode, setImageGenCode] = useState("");
  const [isImageActivating, setIsImageActivating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState("");
  const [imageGenError, setImageGenError] = useState("");
  // 支付
  const [paymentOrderId, setPaymentOrderId] = useState("");
  const [paymentQrCode, setPaymentQrCode] = useState("");
  const [paymentCashierUrl, setPaymentCashierUrl] = useState("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isPollingPayment, setIsPollingPayment] = useState(false);
  const [showActivationCode, setShowActivationCode] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const paymentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    recordGeneration();

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

    recordGeneration();
    setIsRegenerating(true);
    setError("");

    // 清除之前生成的穿搭照片，让用户可以为新搭配重新生成
    setGeneratedImageUrl("");
    setGeneratedImagePrompt("");
    setShowImagePayment(false);
    setImageGenError("");
    // 清除支付轮询（已有订单的不清除已支付状态）
    if (paymentIntervalRef.current) {
      clearInterval(paymentIntervalRef.current);
      paymentIntervalRef.current = null;
    }
    setIsPollingPayment(false);
    setPaymentQrCode("");
    setPaymentOrderId("");
    setPaymentCashierUrl("");

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

      // 激活成功 → 开始生成
      await doGenerateImage();
    } catch {
      setImageGenError("验证失败，请稍后重试");
      setIsImageActivating(false);
    }
  };

  /** 创建 PayJS 支付订单并开始轮询 */
  const handleCreatePayment = async () => {
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

      if (!res.ok || !data.success) {
        setImageGenError(data.error || "创建支付订单失败");
        setIsCreatingPayment(false);
        return;
      }

      setPaymentOrderId(data.orderId);
      // PayJS 返回 base64 二维码图片
      setPaymentQrCode(data.qrcode ? `data:image/png;base64,${data.qrcode}` : data.codeUrl);
      setPaymentCashierUrl(data.cashierUrl || "");
      setIsCreatingPayment(false);
      setIsPollingPayment(true);

      // 开始轮询支付状态（每 2 秒）
      paymentIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/payment/status?order_id=${data.orderId}`
          );
          const statusData = await statusRes.json();

          if (statusData.paid) {
            if (paymentIntervalRef.current) {
              clearInterval(paymentIntervalRef.current);
              paymentIntervalRef.current = null;
            }
            setIsPollingPayment(false);
            setIsPaid(true);
            setShowImagePayment(false);
            // 支付成功，自动生成照片
            await doGenerateImage();
          }
        } catch {
          // 轮询失败不处理，下一次继续
        }
      }, 2000);
    } catch {
      setImageGenError("网络错误，请稍后重试");
      setIsCreatingPayment(false);
    }
  };

  /** 组件卸载时清理轮询 */
  useEffect(() => {
    return () => {
      if (paymentIntervalRef.current) {
        clearInterval(paymentIntervalRef.current);
      }
    };
  }, []);

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
                      <p className="text-[11px] text-text-muted mt-1">大约需要 10-15 秒</p>
                    </div>
                  ) : showImagePayment ? (
                    /* 支付 / 激活 */
                    <div className="bg-card-bg rounded-2xl border border-border p-4 animate-fade-in">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">📸</span>
                        <span className="text-sm font-semibold text-text-primary">生成穿搭照片</span>
                        <span className="text-xs bg-gradient-to-r from-primary to-primary-light text-white px-2 py-0.5 rounded-full font-medium">¥0.99</span>
                      </div>

                      {paymentQrCode ? (
                        /* 已创建订单：展示收款码 */
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <img
                              src={paymentQrCode}
                              alt="微信收款码"
                              className="w-48 h-48 object-contain rounded-xl border border-border"
                            />
                          </div>
                          <p className="text-sm text-text-primary font-medium text-center">
                            微信扫码支付
                          </p>
                          {paymentCashierUrl && (
                            <a
                              href={paymentCashierUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block w-full py-2.5 bg-[#07C160] text-white rounded-xl
                                         text-sm font-semibold text-center hover:opacity-90
                                         transition-all active:scale-[0.98]"
                            >
                              微信内直接支付 ↗
                            </a>
                          )}
                          <p className="text-xs text-text-muted text-center">
                            截图保存二维码 → 微信扫一扫 → 从相册选择
                          </p>
                          {isPollingPayment ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                              <span className="relative w-4 h-4">
                                <span className="absolute inset-0 rounded-full border-2 border-secondary" />
                                <span className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                              </span>
                              等待支付中...
                            </div>
                          ) : (
                            <p className="text-xs text-green-500 text-center font-medium">✅ 支付成功</p>
                          )}
                          {imageGenError && (
                            <p className="text-xs text-red-400 text-center animate-fade-in">{imageGenError}</p>
                          )}
                          <button
                            onClick={() => {
                              setShowImagePayment(false);
                              setPaymentQrCode("");
                              setPaymentOrderId("");
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

                          {/* 激活码入口（折叠，管理员用） */}
                          <div className="pt-1">
                            <button
                              onClick={() => setShowActivationCode(!showActivationCode)}
                              className="text-[10px] text-text-muted/50 hover:text-text-muted transition-colors"
                            >
                              {showActivationCode ? "收起" : "管理员入口"}
                            </button>
                            {showActivationCode && (
                              <div className="mt-2 flex gap-2">
                                <input
                                  value={imageGenCode}
                                  onChange={(e) => {
                                    setImageGenCode(e.target.value);
                                    if (imageGenError) setImageGenError("");
                                  }}
                                  placeholder="激活码"
                                  maxLength={32}
                                  disabled={isImageActivating}
                                  className="flex-1 rounded-xl border border-border bg-white p-2 text-xs
                                             text-text-primary placeholder:text-text-muted/60 outline-none text-center
                                             focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                                             disabled:opacity-50 transition-all"
                                />
                                <button
                                  onClick={handleActivateAndGenerateImage}
                                  disabled={isImageActivating || !imageGenCode.trim()}
                                  className="px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white
                                             rounded-xl text-xs font-semibold disabled:opacity-40
                                             hover:opacity-90 transition-all active:scale-[0.98]"
                                >
                                  {isImageActivating ? "验证中..." : "生成"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* 未创建订单：显示创建按钮 */
                        <div className="space-y-3">
                          <p className="text-xs text-text-secondary text-center">
                            支付 ¥0.99 即可生成穿搭照片，本会话内不限次数
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowImagePayment(false)}
                              className="flex-1 py-2.5 border border-border rounded-xl text-xs text-text-muted
                                         hover:text-text-primary transition-colors"
                            >
                              取消
                            </button>
                            <button
                              onClick={handleCreatePayment}
                              disabled={isCreatingPayment}
                              className="flex-1 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white
                                         rounded-xl text-xs font-semibold disabled:opacity-40
                                         hover:opacity-90 transition-all active:scale-[0.98]"
                            >
                              {isCreatingPayment ? (
                                <>
                                  <span className="relative inline-block w-3.5 h-3.5 mr-1 align-middle">
                                    <span className="absolute inset-0 rounded-full border-2 border-white/30" />
                                    <span className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                  </span>
                                  创建中...
                                </>
                              ) : (
                                "💳 扫码支付 ¥0.99"
                              )}
                            </button>
                          </div>
                          {imageGenError && (
                            <p className="text-xs text-red-400 text-center animate-fade-in">{imageGenError}</p>
                          )}

                          {/* 激活码入口（折叠） */}
                          <div className="pt-1 text-center">
                            <button
                              onClick={() => setShowActivationCode(!showActivationCode)}
                              className="text-[10px] text-text-muted/50 hover:text-text-muted transition-colors"
                            >
                              {showActivationCode ? "收起" : "管理员入口"}
                            </button>
                            {showActivationCode && (
                              <div className="mt-2 flex gap-2">
                                <input
                                  value={imageGenCode}
                                  onChange={(e) => {
                                    setImageGenCode(e.target.value);
                                    if (imageGenError) setImageGenError("");
                                  }}
                                  placeholder="激活码"
                                  maxLength={32}
                                  disabled={isImageActivating}
                                  className="flex-1 rounded-xl border border-border bg-white p-2 text-xs
                                             text-text-primary placeholder:text-text-muted/60 outline-none text-center
                                             focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                                             disabled:opacity-50 transition-all"
                                />
                                <button
                                  onClick={handleActivateAndGenerateImage}
                                  disabled={isImageActivating || !imageGenCode.trim()}
                                  className="px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white
                                             rounded-xl text-xs font-semibold disabled:opacity-40
                                             hover:opacity-90 transition-all active:scale-[0.98]"
                                >
                                  {isImageActivating ? "验证中..." : "生成"}
                                </button>
                              </div>
                            )}
                          </div>
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
    </div>
  );
}
