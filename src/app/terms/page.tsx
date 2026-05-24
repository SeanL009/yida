/**
 * 用户服务协议
 */
import Link from "next/link";

export const metadata = {
  title: "用户服务协议 - 衣搭",
};

export default function TermsPage() {
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

      <h1 className="text-2xl font-bold text-text-primary mb-2">用户服务协议</h1>
      <p className="text-xs text-text-muted mb-8">更新日期：2026 年 5 月</p>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">一、协议说明</h2>
          <p>
            欢迎使用衣搭（以下简称"本服务"）。本协议是您与本服务运营者之间关于使用本服务的法律协议。
            使用本服务前，请仔细阅读并充分理解本协议的全部内容。
            如您不同意本协议的任何条款，请立即停止使用本服务。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">二、服务内容</h2>
          <p>衣搭是一款基于 AI 技术的穿搭建议生成工具，主要提供以下服务：</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>AI 照片分析</strong>：上传照片后，AI 分析您的脸型、体型和肤色。</li>
            <li><strong>穿搭方案生成</strong>：根据分析结果和您选择的风格、场合，生成个性化的穿搭建议。</li>
            <li><strong>穿搭照片生成</strong>（付费功能）：AI 根据穿搭方案生成穿搭效果照片。</li>
            <li>我们保留根据业务发展调整、更新服务内容的权利。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">三、用户账户</h2>
          <p>本服务当前采用无需注册的使用模式：</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>您无需注册账户即可使用基础功能。</li>
            <li>每日生成次数以浏览器本地存储为准，清除浏览器数据可能导致次数重置。</li>
            <li>付费权益记录在服务器端，更换设备后请联系我们恢复。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">四、用户行为规范</h2>
          <p>使用本服务时，您同意：</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>上传的照片应为本人照片或已获得本人授权的照片。</li>
            <li>不得上传违法、违规、侵犯他人权益的照片。</li>
            <li>不得利用本服务生成违法、违规内容。</li>
            <li>不得以任何方式干扰本服务的正常运行。</li>
            <li>不得尝试破解、逆向工程本服务的任何部分。</li>
          </ul>
          <p className="mt-2">
            如您违反上述规定，我们有权立即停止向您提供服务，并保留追究法律责任的权利。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">五、知识产权</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>衣搭网站、品牌标识、界面设计等的知识产权归运营者所有。</li>
            <li>AI 生成的穿搭方案和内容的知识产权归您所有，但您同意授权我们在展示案例等场景中匿名使用。</li>
            <li>您上传的照片的版权归您或原权利人所有。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">六、付费服务</h2>

          <h3 className="text-sm font-medium text-text-primary mt-3 mb-1">1. 费用说明</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>本服务提供免费和付费两种模式。</li>
            <li>付费项目包括：穿搭照片生成（按次计费 ¥0.99/次）等。</li>
            <li>所有价格以网站实际标价为准，我们保留调整价格的权利。</li>
          </ul>

          <h3 className="text-sm font-medium text-text-primary mt-3 mb-1">2. 支付方式</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>通过微信支付完成付费。</li>
            <li>支付行为受微信支付用户协议约束。</li>
          </ul>

          <h3 className="text-sm font-medium text-text-primary mt-3 mb-1">3. 退款政策</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>穿搭照片生成为数字服务，一经生成即视为服务已完成，不支持退款。</li>
            <li>如因系统故障导致您支付后无法获得相应服务，请联系我们核实后退款。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">七、免责声明</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>本服务提供的穿搭建议仅供参考，不构成专业时尚建议。</li>
            <li>AI 生成结果可能存在偏差，我们努力优化但无法保证 100% 准确。</li>
            <li>因不可抗力（如网络中断、服务器故障等）导致服务中断，我们不承担责任。</li>
            <li>在法律允许的最大范围内，我们对因使用本服务产生的间接损失不承担责任。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">八、协议变更与终止</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>我们可能会适时修改本协议，修改后的协议在网站上公布即生效。</li>
            <li>如您不同意修改后的协议，请停止使用本服务。</li>
            <li>我们保留在必要时终止本服务的权利，届时将提前公告通知。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">九、法律适用与争议解决</h2>
          <p>
            本协议的订立、执行和解释适用中华人民共和国法律。
            因本协议引起的争议，双方应友好协商解决；协商不成的，提交服务运营者所在地有管辖权的人民法院诉讼解决。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary mb-2">十、联系方式</h2>
          <p>
            如您对本协议有任何疑问或建议，可通过网站底部的反馈表单联系我们。
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
