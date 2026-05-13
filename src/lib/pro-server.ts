import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "pro-users.json");

interface ProUserEntry {
  activatedAt: string;
  expiresAt: string;
  method: string;
}

interface ProDatabase {
  tokens: Record<string, ProUserEntry>;
}

const PRO_DURATION_DAYS = 30;

/** 确保 data 目录和文件存在 */
function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ tokens: {} }), "utf-8");
  }
}

/** 读取数据库 */
function readDb(): ProDatabase {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as ProDatabase;
  } catch {
    return { tokens: {} };
  }
}

/** 写入数据库 */
function writeDb(db: ProDatabase): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

/** 生成随机 token */
function generateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

/** 验证激活码并激活 Pro，返回 token 和过期时间 */
export function activatePro(code: string): { success: boolean; token?: string; expiresAt?: string; error?: string } {
  // MVP: 固定激活码 "YIDAPRO2026"，空字符串也允许（开发模式）
  if (code !== "YIDAPRO2026" && code !== "") {
    return { success: false, error: "激活码无效" };
  }

  const db = readDb();
  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PRO_DURATION_DAYS * 24 * 60 * 60 * 1000);

  db.tokens[token] = {
    activatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    method: code === "" ? "dev" : "activation_code",
  };

  writeDb(db);

  return { success: true, token, expiresAt: expiresAt.toISOString() };
}

/** 验证 token 是否有效 */
export function verifyToken(token: string): { isValid: boolean; expiresAt?: string } {
  const db = readDb();
  const entry = db.tokens[token];

  if (!entry) {
    return { isValid: false };
  }

  const now = new Date();
  const expires = new Date(entry.expiresAt);

  if (expires <= now) {
    // 过期了，清理
    delete db.tokens[token];
    writeDb(db);
    return { isValid: false };
  }

  return { isValid: true, expiresAt: entry.expiresAt };
}
