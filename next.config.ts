import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // nodemailer 是原生 Node.js 模块，需要排除在 Turbopack 打包之外
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
