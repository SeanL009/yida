import Link from "next/link";

export const metadata = {
  title: "常见问题 - 衣搭",
};

const FAQS = [
  {
    q: "衣搭是免费的吗？",
    a: "基础功能免费。每天可免费生成 3 套穿搭方案。生成穿搭照片为付费功能（¥0.99/次）。",
  },
  {
    q: "上传的照片会被保存吗？",
    a: "不会。您的照片仅用于本次 AI 分析，分析完成后即丢弃，不会保存到服务器。详情请查看隐私政策。",
  },
  {
    q: "AI 分析准确吗？需要什么样的照片？",
    a: "建议上传正面全身照，穿修身衣物，手机与人保持 1.5-2 米距离。照片越清晰、姿势越标准，AI 分析结果越准确。",
  },
  {
    q: "支持哪些图片格式？",
    a: "支持 JPG、PNG、HEIC（iPhone 默认格式）和 WebP。HEIC 文件会自动转换为 JPG 处理。单张不超过 5MB。",
  },
  {
    q: "为什么我的照片上传失败？",
    a: "常见原因：文件超过 5MB、格式不支持（如 GIF、BMP）、网络问题。请检查后重试。",
  },
  {
    q: "穿搭方案可以保存和分享吗？",
    a: '可以的。每套穿搭方案都配有「分享到小红书」按钮，点击即可复制穿搭文案粘贴到小红书等平台。',
  },
  {
    q: "穿搭照片生成是什么？怎么收费？",
    a: "这是一个付费增值功能，AI 根据穿搭方案生成一张效果照片（类似买家秀）。¥0.99/次，通过微信支付。",
  },
  {
    q: "支付遇到问题怎么办？",
    a: "我们支持微信支付。如支付失败，请检查网络后重试。如扣款成功但未获得服务，请联系我们退款。",
  },
  {
    q: "穿搭建议靠谱吗？",
    a: "衣搭的搭配基于 AI 分析您的体型、肤色、风格偏好和场合需求，参考了时尚穿搭原则。但最终搭配选择仍由您决定，建议结合个人喜好调整。",
  },
  {
    q: "我可以在手机上使用吗？",
    a: "当然。衣搭完全适配手机浏览器，无需下载 App。直接访问 jiulant.cn 即可使用。",
  },
];

export default function FAQPage() {
  return (
    <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回首页
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mb-2">常见问题</h1>
      <p className="text-xs text-text-muted mb-8">关于衣搭，你可能想了解这些</p>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <details
            key={i}
            className="group bg-card-bg rounded-2xl border border-border overflow-hidden transition-all"
          >
            <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-text-primary list-none hover:bg-secondary/30 transition-colors">
              <span className="pr-4">{faq.q}</span>
              <svg
                className="w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-4 border-t border-border/40">
              <p className="text-sm text-text-secondary leading-relaxed pt-3">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-text-muted">
          还有问题？通过网站底部反馈表单联系我们
        </p>
      </div>
    </main>
  );
}
