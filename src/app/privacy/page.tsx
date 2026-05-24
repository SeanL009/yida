/**
 * 隐私政策
 * 依据《中华人民共和国个人信息保护法》制定
 */
import Link from "next/link";

export const metadata = {
  title: "隐私政策 - 衣搭",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
      {/* 返回 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回首页
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mb-2">隐私政策</h1>
      <p className="text-xs text-text-muted mb-8">更新日期：2026 年 5 月</p>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">一、总则</h2>
          <p>
            衣搭（以下简称"我们"）深知个人信息对您的重要性，并会全力保护您的个人信息安全。
            我们依据《中华人民共和国个人信息保护法》《中华人民共和国网络安全法》等法律法规，
            制定本隐私政策，向您说明我们如何收集、使用、存储和保护您的个人信息。
          </p>
          <p className="mt-2">
            使用衣搭服务前，请仔细阅读并充分理解本隐私政策。如您使用我们的服务，即表示您同意本隐私政策的全部内容。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">二、我们收集的信息</h2>

          <h3 className="text-sm font-medium text-text-primary mt-3 mb-1">1. 您主动提供的信息</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>照片</strong>：您上传的全身照或半身照，用于 AI 分析脸型、体型和肤色。照片可能包含面部特征等生物识别信息。</li>
            <li><strong>反馈信息</strong>：您通过反馈表单提交的昵称、联系方式（QQ/微信/邮箱）和意见建议。</li>
          </ul>

          <h3 className="text-sm font-medium text-text-primary mt-3 mb-1">2. 设备信息</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>位置信息</strong>：经您授权后，我们会获取您的位置信息用于提供当地天气和穿搭建议。您拒绝提供不影响核心功能使用。</li>
            <li><strong>浏览器信息</strong>：浏览器类型、操作系统等基本设备信息，用于优化服务体验。</li>
          </ul>

          <h3 className="text-sm font-medium text-text-primary mt-3 mb-1">3. 支付信息</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>当您使用微信支付时，支付过程由微信支付完成，我们不会收集您的银行卡号、支付密码等敏感支付信息。</li>
            <li>我们会存储订单编号、支付金额和支付状态，用于确认您的付费权益。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">三、信息的使用</h2>
          <p>我们收集的信息用于以下目的：</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>照片</strong>：发送至通义千问（DashScope）API 进行 AI 分析，识别体型、脸型和肤色特征，以生成个性化的穿搭方案。</li>
            <li><strong>反馈信息</strong>：回复您的建议和问题，改进服务质量。</li>
            <li><strong>位置信息</strong>：获取当地天气温度，为您推荐当季合适的穿搭。</li>
            <li><strong>订单信息</strong>：确认您的付费状态，提供对应的 Pro/付费功能。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">四、信息的存储和保护</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>照片</strong>：您的照片仅在 AI 分析过程中临时处理，<strong>不会被永久存储在服务器上</strong>。分析完成后，原始照片数据即被丢弃。</li>
            <li><strong>分析结果</strong>：AI 分析后的文本结果（脸型、体型、肤色等）仅在您当前会话中使用，不会长期保存。</li>
            <li><strong>反馈信息</strong>：存储在本站服务器上，仅用于客服回复。</li>
            <li><strong>数据加密</strong>：我们采用 HTTPS 加密传输所有数据，防止信息在传输过程中被窃取。</li>
            <li><strong>访问控制</strong>：服务器数据仅限授权人员访问，并采取必要的安全措施防止数据泄露。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">五、信息的共享</h2>
          <p>我们不会向第三方出售您的个人信息。仅在以下情况下可能与第三方共享：</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>AI 服务提供商</strong>：您的照片将发送至阿里云通义千问（DashScope）进行 AI 分析。该服务商受数据保护协议约束，不得将您的数据用于其他目的。</li>
            <li><strong>支付服务商</strong>：微信支付（财付通）处理您的支付交易，受其隐私政策的约束。</li>
            <li><strong>法律法规要求</strong>：当法律法规、监管机构或司法机关要求时，我们依法提供必要信息。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">六、您的权利</h2>
          <p>根据《个人信息保护法》，您享有以下权利：</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>知情权</strong>：了解我们如何收集和使用您的个人信息。</li>
            <li><strong>删除权</strong>：要求删除您的个人信息。您可以通过反馈渠道联系我们删除存储的反馈信息。</li>
            <li><strong>撤回同意</strong>：您可以通过停止使用服务来撤回对本隐私政策的同意。</li>
            <li><strong>投诉举报</strong>：如认为我们违反法律法规，可以向相关监管部门投诉。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">七、未成年人保护</h2>
          <p>
            衣搭服务面向 18 岁以上用户。如您是未成年人，请在监护人指导下使用本服务。
            我们不会故意收集未成年人的个人信息。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">八、隐私政策的更新</h2>
          <p>
            我们可能会适时更新本隐私政策。重大变更时，我们会在网站显著位置通知您。
            修改后的隐私政策自发布之日起生效。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">九、联系方式</h2>
          <p>
            如您对本隐私政策有任何疑问，或需要行使您的个人信息相关权利，
            请通过反馈表单联系我们，或发送邮件至我们提供的联系方式。
          </p>
        </section>

        <section className="border-t border-border pt-6 mt-8">
          <p className="text-xs text-text-muted">
            主体名称：衣搭 AI 穿搭助手<br />
            ICP 备案号：粤ICP备2026050469号-1
          </p>
        </section>
      </div>
    </main>
  );
}
