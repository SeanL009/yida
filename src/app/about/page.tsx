import Link from "next/link";

export const metadata = {
  title: "关于我们 - 衣搭",
};

export default function AboutPage() {
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

      <h1 className="text-2xl font-bold text-text-primary mb-2">关于衣搭</h1>
      <p className="text-xs text-text-muted mb-8">让每个女生都能轻松穿出高级感</p>

      <div className="space-y-5 text-sm text-text-secondary leading-relaxed">
        <section className="bg-card-bg rounded-2xl border border-border p-5">
          <h2 className="text-base font-semibold text-text-primary mb-2">我们是谁</h2>
          <p>
            衣搭是一款基于 AI 技术的穿搭助手，专注于为女性提供个性化穿搭方案。
            用户上传照片后，AI 会分析脸型、体型、肤色等特征，结合选择风格和场合，
            智能推荐完整的穿搭方案。
          </p>
        </section>

        <section className="bg-card-bg rounded-2xl border border-border p-5">
          <h2 className="text-base font-semibold text-text-primary mb-2">我们的理念</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary shrink-0">🎯</span>
              <span><strong>真实参考级</strong>——不做过度美化，给你真实能穿的搭配</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary shrink-0">🧬</span>
              <span><strong>千人千面</strong>——根据你的独特特征进行精准推荐</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary shrink-0">📱</span>
              <span><strong>小红书友好</strong>——生成文案一键分享，收获点赞</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary shrink-0">🔒</span>
              <span><strong>隐私优先</strong>——照片用完即弃，不保存到服务器</span>
            </li>
          </ul>
        </section>

        <section className="bg-card-bg rounded-2xl border border-border p-5">
          <h2 className="text-base font-semibold text-text-primary mb-2">联系我们</h2>
          <p className="mb-2">如有任何问题或建议，欢迎通过以下方式联系我们：</p>
          <ul className="space-y-1">
            <li>📧 邮箱：<span className="text-primary">sean009@qq.com</span></li>
            <li>💬 网站底部反馈表单</li>
          </ul>
        </section>

        <section className="border-t border-border pt-5">
          <p className="text-xs text-text-muted">
            主体名称：衣搭 AI 穿搭助手<br />
            ICP 备案号：粤ICP备2026050469号-1
          </p>
        </section>
      </div>
    </main>
  );
}
