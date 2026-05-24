"use client";

import { useState, useRef, useEffect } from "react";

interface Toast {
  id: number;
  type: "success" | "error";
  text: string;
}

export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [errorText, setErrorText] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const cooldownRef = useRef(false);
  const toastIdRef = useRef(0);

  /** 显示 Toast 通知，3 秒后自动消失 */
  const showToast = (type: "success" | "error", text: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setErrorText("请写点建议再提交哦~");
      return;
    }
    if (trimmed.length > 500) {
      setErrorText("建议不能超过500字");
      return;
    }

    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, 5000);

    setStatus("sending");
    setErrorText("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, contact: contact.trim() || "" }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", "感谢你的建议！我们会认真阅读 ❤️");
        setMessage("");
        setContact("");
      } else {
        setErrorText(data.error || "提交失败");
        showToast("error", data.error || "提交失败，请稍后重试");
      }
    } catch {
      setErrorText("网络错误，请稍后重试");
      showToast("error", "网络错误，请稍后重试");
    } finally {
      setStatus("idle");
    }
  };

  const charCount = message.length;
  const countColor =
    charCount > 480 ? "text-red-400" : charCount > 380 ? "text-orange-400" : "text-text-muted/60";

  return (
    <div className="border-t border-border/40 pt-6 mt-8">
      {/* Toast 通知 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-down pointer-events-auto px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm
              ${t.type === "success"
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
              }`}
          >
            {t.text}
          </div>
        ))}
      </div>

      <div className="bg-card-bg rounded-2xl border border-border p-5 animate-fade-up">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-base" role="img" aria-label="建议">💡</span>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">我有个小建议</h3>
            <p className="text-[12px] text-text-secondary">
              你的反馈是我们进步的动力，留下联系方式便于我们联系你
            </p>
          </div>
        </div>

        {/* 输入框 */}
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errorText) setErrorText("");
          }}
          placeholder="说说你对衣搭的想法、功能建议或遇到的问题..."
          rows={3}
          maxLength={500}
          disabled={status === "sending"}
          className="w-full resize-none rounded-xl border border-border bg-white p-3 text-sm
                     text-text-primary placeholder:text-text-muted/50 outline-none
                     focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                     disabled:opacity-50 transition-all"
        />

        {/* 联系方式 */}
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="e.g. 微信号：yourname 或 手机号：138xxxx"
          maxLength={100}
          disabled={status === "sending"}
          className="w-full rounded-xl border border-border bg-white p-3 text-sm
                     text-text-primary placeholder:text-text-muted/50 outline-none
                     focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                     disabled:opacity-50 transition-all mt-2.5"
        />

        {/* 底部：字数 + 提交按钮 */}
        <div className="flex items-center justify-between mt-2.5">
          <span className={`text-[10px] font-mono transition-colors ${countColor}`}>
            {charCount > 0 ? `${charCount}/500` : ""}
          </span>
          <button
            onClick={handleSubmit}
            disabled={status === "sending" || !message.trim()}
            className="px-5 py-2 bg-gradient-to-r from-primary to-primary-light text-white
                       rounded-lg text-sm font-medium disabled:opacity-40
                       hover:opacity-90 transition-all active:scale-[0.97]"
          >
            {status === "sending" ? (
              <span className="flex items-center gap-1.5">
                <span className="relative w-3.5 h-3.5">
                  <span className="absolute inset-0 rounded-full border-2 border-white/30" />
                  <span className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" />
                </span>
                提交中...
              </span>
            ) : (
              "提交反馈"
            )}
          </button>
        </div>

        {/* 错误提示 */}
        {errorText && (
          <p className="mt-2 text-xs text-red-400 animate-fade-in">{errorText}</p>
        )}
      </div>
    </div>
  );
}
