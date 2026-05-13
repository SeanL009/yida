"use client";

import { useState, useRef } from "react";

export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const cooldownRef = useRef(false);

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
        setStatus("success");
        setMessage("");
        setContact("");
      } else {
        setErrorText(data.error || "提交失败");
        setStatus("error");
      }
    } catch {
      setErrorText("网络错误，请稍后重试");
      setStatus("error");
    }
  };

  const charCount = message.length;
  const countColor =
    charCount > 480 ? "text-red-400" : charCount > 380 ? "text-orange-400" : "text-text-muted/70";

  return (
    <div className="border-t border-border/40 pt-8 mt-8">
      <div className="bg-card-bg rounded-2xl border border-border p-5 animate-fade-up">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-base">💡</span>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">我有个小建议 / 留下联系方式</h3>
            <p className="text-[11px] text-text-muted">你的反馈是我们进步的动力，留下联系方式便于我们联系你</p>
          </div>
        </div>

        {/* 成功状态 */}
        {status === "success" ? (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center animate-scale-up">
            <p className="text-green-600 text-sm font-medium">感谢你的建议！我们会认真阅读 ❤️</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-2 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              再写一条
            </button>
          </div>
        ) : (
          <>
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
                         text-text-primary placeholder:text-text-muted/60 outline-none
                         focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:scale-[1.01]
                         disabled:opacity-50 transition-all"
            />

            {/* 联系方式 */}
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="微信号 / 手机号 / QQ（选填）"
              maxLength={100}
              disabled={status === "sending"}
              className="w-full rounded-xl border border-border bg-white p-3 text-sm
                         text-text-primary placeholder:text-text-muted/60 outline-none
                         focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                         disabled:opacity-50 transition-all mt-2.5"
            />

            {/* 底部：字数 + 提交按钮 */}
            <div className="flex items-center justify-between mt-2.5">
              <span className={`text-[10px] transition-colors ${countColor}`}>
                {charCount}/500
              </span>
              <button
                onClick={handleSubmit}
                disabled={status === "sending" || !message.trim()}
                className="px-5 py-2 bg-gradient-to-r from-primary to-primary-light text-white
                           rounded-lg text-sm font-medium disabled:opacity-40
                           hover:opacity-90 transition-all active:scale-[0.97]"
              >
                {status === "sending" ? "提交中..." : "提交反馈"}
              </button>
            </div>

            {/* 错误提示 */}
            {errorText && (
              <p className="mt-2 text-xs text-red-400 animate-fade-in">{errorText}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
