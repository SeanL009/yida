# 衣搭 - AI穿搭助手

## 项目简介
AI女性穿搭卡片生成工具，面向国内小红书用户。
用户上传照片 → AI分析体型/肤色 → 选择风格/场合 → 生成3套穿搭卡片 → 分享小红书

## 技术栈
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- 通义千问 Qwen-VL-Max（照片分析）+ Qwen-Turbo（穿搭生成）
- Vercel 部署

## 目录结构
- `/src/app/page.tsx` - Landing Page
- `/src/app/generate/page.tsx` - 穿搭生成页（核心功能）
- `/src/app/api/analyze/route.ts` - AI分析照片API
- `/src/app/api/generate/route.ts` - AI生成穿搭方案API
- `/src/components/PhotoUpload.tsx` - 照片上传组件
- `/src/components/OutfitCard.tsx` - 穿搭卡片组件
- `/src/lib/openai.ts` - 通义千问客户端 + 业务逻辑（使用 OpenAI SDK + DashScope 兼容模式）

## 开发命令
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本

## 环境变量
- `DASHSCOPE_API_KEY` - 阿里云通义千问 API Key（必需，在 dashscope.aliyun.com 获取）

## 产品定位
- 竞品过度美化/电商导向，我们强调"真实参考级"穿搭建议
- 用户：18-30岁一二线城市女性
- 分发：小红书裂变

## 变现计划
- 免费：每日3次生成
- Pro ¥19.9/月：无限次 + AI配图功能（后续加入）
