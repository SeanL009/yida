# 衣搭 · AI穿搭助手

上传照片，AI 为你智能搭配穿搭方案。适合通勤、约会、旅行等各种场景。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **样式**: Tailwind CSS v4
- **AI**: OpenAI GPT-4o-mini Vision API
- **部署**: Vercel

## 本地开发

### 前置条件

1. Node.js 18+
2. OpenAI API Key（[点此获取](https://platform.openai.com/api-keys)）

### 启动步骤

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量文件
cp .env.local.example .env.local

# 3. 编辑 .env.local，填入你的 OpenAI API Key
#    OPENAI_API_KEY=sk-your-key-here

# 4. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 查看效果。

### 构建生产版本

```bash
npm run build
npm start
```

## 部署到 Vercel

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/yida)

### 手动部署

1. 把代码推送到 GitHub 仓库
2. 登录 [Vercel](https://vercel.com)（推荐用 GitHub 登录）
3. 点击 "Add New" → "Project"
4. 导入你的 GitHub 仓库
5. 在 Environment Variables 中添加 `OPENAI_API_KEY`
6. 点击 Deploy

部署完成后，Vercel 会自动给你的项目分配域名。

## 项目结构

```
src/
├── app/
│   ├── page.tsx          # 首页
│   ├── layout.tsx        # 布局
│   ├── globals.css       # 全局样式
│   ├── generate/
│   │   └── page.tsx      # 穿搭生成页
│   └── api/
│       ├── analyze/route.ts
│       └── generate/route.ts
├── components/
│   ├── PhotoUpload.tsx
│   └── OutfitCard.tsx
└── lib/
    ├── types.ts
    └── openai.ts
```

## 变现计划

| 类型 | 价格 | 说明 |
|------|------|------|
| 免费 | ¥0 | 每日 3 次生成 |
| 次卡 | ¥9.9/10次 | 按需购买 |
| 月卡 | ¥19.9/月 | 无限次 |
