"use client";

import { useState } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import OutfitCard from "@/components/OutfitCard";
import FeedbackForm from "@/components/FeedbackForm";
import { STYLE_DNA, OCCASIONS, COLOR_SCHEMES } from "@/lib/types";
import type { AnalysisResult, OutfitSuggestion } from "@/lib/types";

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

  const handleImageReady = async (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setError("");

    // 先显示"分析中..."状态
    setStep("generating");

    // 自动分析
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
      }
    } catch {
      setError("网络错误，请重试");
    }
  };

  const handleGenerate = async () => {
    if (!selectedStyle || !selectedOccasion) return;

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
        }),
      });
      const data = await res.json();
      if (data.outfits) {
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

  const handleReset = () => {
    setStep("upload");
    setImageDataUrl("");
    setAnalysis(null);
    setSelectedStyle("");
    setSelectedOccasion("");
    setSelectedColorScheme("随机搭配");
    setOutfits([]);
    setError("");
  };

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

      {/* 步骤指示器 */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {["上传照片", "选择风格", "生成方案"].map((label, i) => {
          const stepMap: Step[] = ["upload", "choose", "result"];
          const current = stepMap.indexOf(step);
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${
                    i <= current
                      ? "bg-primary text-white"
                      : "bg-secondary text-text-muted"
                  }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs ${
                  i <= current ? "text-text-primary font-medium" : "text-text-muted"
                }`}
              >
                {label}
              </span>
              {i < 2 && <div className="w-6 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl mb-4">
          {error}
        </div>
      )}

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
          <div className="bg-card-bg rounded-2xl p-4 border border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">✨</span>
              AI分析结果
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
                <p className="text-[9px] text-text-muted mb-0.5">脸型</p>
                <p className="text-xs font-semibold text-text-primary">{analysis.faceShape || "—"}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
                <p className="text-[9px] text-text-muted mb-0.5">体型</p>
                <p className="text-xs font-semibold text-text-primary">{analysis.bodyType || "—"}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
                <p className="text-[9px] text-text-muted mb-0.5">肤色</p>
                <p className="text-xs font-semibold text-text-primary">{analysis.skinTone || "—"}</p>
              </div>
            </div>
            {analysis.bodyProportions && (
              <p className="text-[10px] text-text-secondary text-center mb-2">{analysis.bodyProportions}</p>
            )}
            {analysis.recommendedStyles && analysis.recommendedStyles.length > 0 && (
              <div className="pt-2.5 border-t border-border">
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {analysis.recommendedStyles.map((rec, i) => (
                    <span key={i} className="text-[10px] bg-secondary text-primary-dark px-2.5 py-1 rounded-full">
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              选择风格
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {STYLE_DNA.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm transition-all
                    ${
                      selectedStyle === s.id
                        ? "border-primary bg-primary/5 text-primary-dark font-medium"
                        : "border-border bg-card-bg text-text-secondary hover:border-primary/30"
                    }`}
                >
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-xs">{s.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              选择场合
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {OCCASIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOccasion(o.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm transition-all
                    ${
                      selectedOccasion === o.id
                        ? "border-primary bg-primary/5 text-primary-dark font-medium"
                        : "border-border bg-card-bg text-text-secondary hover:border-primary/30"
                    }`}
                >
                  <span className="text-xl">{o.emoji}</span>
                  <span className="text-xs">{o.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 色系选择 */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              配色偏好 <span className="text-text-muted font-normal text-xs">（可选，默认随机）</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_SCHEMES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColorScheme(c.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm transition-all
                    ${
                      selectedColorScheme === c.id
                        ? "border-primary bg-primary/5 text-primary-dark font-medium"
                        : "border-border bg-card-bg text-text-secondary hover:border-primary/30"
                    }`}
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-[10px] leading-tight text-center">{c.id}</span>
                </button>
              ))}
            </div>
          </div>

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
      )}

      {/* Step 3: 分析中 / 生成中 */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-text-primary font-medium">
            {analysis ? "AI正在为你搭配..." : "AI正在分析你的照片..."}
          </p>
          <p className="text-text-muted text-sm mt-1">
            {analysis ? "根据你的体型和风格定制方案" : "识别脸型、身形比例和肤色"}
          </p>
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
              今日已用 {usedCount} 次
            </span>
          </div>

          <div className="grid gap-4">
            {outfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("choose")}
              className="flex-1 py-3 border border-border rounded-xl text-text-primary font-medium
                         hover:bg-secondary transition-colors text-sm"
            >
              🔄 换一换风格
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-light text-white
                         rounded-xl font-medium hover:opacity-90 transition-opacity text-sm"
            >
              📸 重新上传
            </button>
          </div>
        </div>
      )}

      {/* 反馈建议 */}
      <FeedbackForm />
    </div>
  );
}
