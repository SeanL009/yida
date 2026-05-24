"use client";

import { useState, useRef } from "react";

interface PhotoUploadProps {
  onImageReady: (dataUrl: string, file: File) => void;
  disabled?: boolean;
}

/** 判断是否为 HEIC 文件（iPhone 默认格式） */
function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
}

/** HEIC → JPEG 转换（动态 import，避免 SSR 时 window 未定义） */
async function convertHeicToJpeg(file: File): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });
  // heic2any 可能返回 Blob 或 Blob[]
  return Array.isArray(result) ? result[0] : result;
}

/** 女性身形参考图 SVG */
function PoseGuide() {
  return (
    <svg viewBox="0 0 100 200" className="w-20 h-40 animate-float" style={{ animationDuration: "3s" }} fill="none">
      {/* 头 */}
      <circle cx="50" cy="18" r="12" className="stroke-primary-dark" strokeWidth="1.5" fill="#fdf0f3" />
      <circle cx="46" cy="17" r="1.2" className="fill-text-primary" />
      <circle cx="54" cy="17" r="1.2" className="fill-text-primary" />
      <path d="M44 14.5 Q46 13.5 48 14.5" className="stroke-text-primary" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M52 14.5 Q54 13.5 56 14.5" className="stroke-text-primary" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M50 19 L50 21" className="stroke-text-muted" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M47 23 Q50 24.5 53 23" className="stroke-text-primary" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <line x1="50" y1="30" x2="50" y2="36" className="stroke-primary-dark" strokeWidth="1.5" />
      <path d="M34 36 Q34 32 38 36 L40 58 L44 74 L56 74 L60 58 L62 36 Q66 32 66 36 L62 40 Q62 56 58 68 Q54 78 50 78 Q46 78 42 68 Q38 56 38 40 Z"
            className="fill-secondary stroke-primary-dark" strokeWidth="1.2" />
      <path d="M36 44 L24 72 L26 76 L38 56" className="stroke-primary-dark" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M64 44 L76 72 L74 76 L62 56" className="stroke-primary-dark" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M44 78 L42 120 Q42 122 44 122 L56 122 Q58 122 58 120 L56 78"
            className="fill-tag-bg stroke-primary-dark" strokeWidth="1.2" />
      <line x1="45" y1="122" x2="41" y2="180" className="stroke-primary-dark" strokeWidth="2" strokeLinecap="round" />
      <line x1="55" y1="122" x2="59" y2="180" className="stroke-primary-dark" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="180" x2="47" y2="180" className="stroke-primary-dark" strokeWidth="2" strokeLinecap="round" />
      <line x1="53" y1="180" x2="65" y2="180" className="stroke-primary-dark" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="36" x2="14" y2="78" className="stroke-text-muted" strokeWidth="0.8" strokeDasharray="2 2" />
      <text x="8" y="60" fontSize="5" className="fill-text-muted">上身</text>
      <line x1="14" y1="78" x2="14" y2="180" className="stroke-text-muted" strokeWidth="0.8" strokeDasharray="2 2" />
      <text x="8" y="132" fontSize="5" className="fill-text-muted">腿长</text>
      <line x1="24" y1="10" x2="34" y2="10" className="stroke-text-muted" strokeWidth="0.8" strokeDasharray="2 2" />
      <line x1="66" y1="10" x2="76" y2="10" className="stroke-text-muted" strokeWidth="0.8" strokeDasharray="2 2" />
      <text x="38" y="10" fontSize="4" className="fill-text-muted">肩宽</text>
    </svg>
  );
}

export default function PhotoUpload({
  onImageReady,
  disabled,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [isConverting, setIsConverting] = useState(false);

  const handleFile = async (file: File) => {
    setError("");
    setIsConverting(false);

    // HEIC 检测（iPhone 默认格式）
    if (isHeicFile(file)) {
      setIsConverting(true);
      try {
        const jpegBlob = await convertHeicToJpeg(file);
        // 用转换后的 JPEG 重建 File 对象
        const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
        file = new File([jpegBlob], newName, { type: "image/jpeg" });
      } catch (e: any) {
        setError("HEIC 转换失败，请尝试将照片转为 JPG 后重试");
        setIsConverting(false);
        return;
      }
      setIsConverting(false);
    }

    if (!file.type.startsWith("image/")) {
      setError("请选择图片格式的照片（JPG / PNG / HEIC / WebP）");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("图片太大，请选择 5MB 以内的照片");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageReady(result, file);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full space-y-4">
      {/* 上传错误提示 */}
      {error && (
        <div className="bg-red-50 text-red-500 text-xs p-2.5 rounded-xl animate-fade-in">
          {error}
        </div>
      )}

      {!preview && (
        /* 拍照指南 */
        <div className="bg-card-bg rounded-2xl border border-border p-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
            <span>📸</span> 拍照指南
          </h3>
          <div className="flex items-start gap-4">
            <div className="shrink-0 flex flex-col items-center gap-1">
              <div className="bg-secondary/50 rounded-xl p-2">
                <PoseGuide />
              </div>
              <span className="text-[10px] text-text-muted">参考姿势</span>
            </div>
            <div className="flex-1 space-y-2.5 pt-1">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">①</span>
                <div>
                  <p className="text-xs font-medium text-text-primary">正面全身照，自然站姿</p>
                  <p className="text-[10px] text-text-muted">手机与人保持 1.5-2 米距离</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">②</span>
                <div>
                  <p className="text-xs font-medium text-text-primary">穿修身衣物，看清身形</p>
                  <p className="text-[10px] text-text-muted">避免宽松衣物遮挡身体线条</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">③</span>
                <div>
                  <p className="text-xs font-medium text-text-primary">露出脸部，AI识别脸型风格</p>
                  <p className="text-[10px] text-text-muted">正面清晰即可</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!preview ? (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
              transition-all duration-200
              ${isDragging
                ? "border-primary bg-primary/5 shadow-inner scale-[1.01]"
                : "border-border hover:border-primary hover:bg-secondary/30"
              }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200
                ${isConverting ? "bg-primary/10 animate-pulse-soft" : isDragging ? "bg-primary/10" : "bg-secondary"}`}>
                {isConverting ? (
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-3 border-secondary" />
                    <div className="absolute inset-0 rounded-full border-3 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <svg
                    className={`w-8 h-8 transition-colors duration-200 ${isDragging ? "text-primary" : "text-primary"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-text-primary font-medium">
                  {isConverting ? "正在转换 HEIC 照片..." : isDragging ? "松手以上传照片" : "点击或拖拽上传照片"}
                </p>
                <p className="text-text-muted text-sm mt-1">
                  {isConverting ? "iPhone 照片自动转为 JPG 格式" : "按照上方指南拍一张照片，AI 帮你精准搭配"}
                </p>
              </div>
              <span className="text-xs text-text-muted bg-secondary px-3 py-1 rounded-full">
                支持 JPG / PNG / HEIC / WebP
              </span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.heic,.heif,.HEIC,.HEIF"
              onChange={handleChange}
              className="hidden"
              disabled={disabled || isConverting}
            />
          </div>
          {/* 隐私说明 */}
          <p className="text-[10px] text-text-muted/60 text-center mt-2.5 leading-relaxed">
            您的照片仅用于本次 AI 分析，分析完成后即丢弃，不会保存到服务器
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-border animate-scale-up">
          <img
            src={preview}
            alt="上传的照片"
            className="w-full max-h-80 object-contain"
          />

          {/* "已上传" 徽章 */}
          <div className="absolute top-3 left-3 bg-green-500/80 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            已上传
          </div>

          <button
            onClick={() => {
              setPreview(null);
              setFileName("");
              setError("");
            }}
            disabled={disabled}
            className="absolute top-3 right-3 w-7 h-7 bg-black/40 text-white rounded-full
                       flex items-center justify-center hover:bg-black/60 transition-all
                       text-xs backdrop-blur-sm"
          >
            ✕
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent p-3 pt-6">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-white text-xs font-medium truncate">{fileName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
