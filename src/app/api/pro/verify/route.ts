import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const ACTIVATION_CODE = "1314";
const PRO_DURATION_DAYS = 30;

interface ProUser {
  activatedAt: string;
  expiresAt: string;
  method: string;
}

interface ProData {
  tokens: Record<string, ProUser>;
}

/** 数据文件路径 */
function getDataPath(): string {
  return path.join(process.cwd(), "data", "pro-users.json");
}

/** 读取 Pro 用户数据 */
function readProData(): ProData {
  try {
    const raw = fs.readFileSync(getDataPath(), "utf-8");
    return JSON.parse(raw);
  } catch {
    return { tokens: {} };
  }
}

/** 写入 Pro 用户数据 */
function writeProData(data: ProData): void {
  const dir = path.dirname(getDataPath());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2), "utf-8");
}

/** 生成随机 token */
function generateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // 验证激活码
    if (code !== ACTIVATION_CODE) {
      return NextResponse.json(
        { success: false, error: "激活码无效" },
        { status: 400 }
      );
    }

    // 生成 token 和有效期
    const token = generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PRO_DURATION_DAYS * 24 * 60 * 60 * 1000);

    // 持久化存储
    const data = readProData();
    data.tokens[token] = {
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      method: "activation",
    };
    writeProData(data);

    return NextResponse.json({
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Pro verify error:", error);
    return NextResponse.json(
      { success: false, error: "验证失败" },
      { status: 500 }
    );
  }
}
