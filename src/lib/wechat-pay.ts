/**
 * 微信支付 API v3 工具函数
 * Native 扫码支付 + 订单查询
 * 注意：签名通过 openssl 命令完成（Node.js crypto.sign 在 OpenSSL 3.x 下输出与微信不兼容）
 */
import { execSync } from "child_process";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";

const APPID = process.env.WECHAT_APPID!;
const MCHID = process.env.WECHAT_MCHID!;
const NOTIFY_URL = process.env.WECHAT_NOTIFY_URL!;

const CERT_DIR = path.join(process.cwd(), "cert");
const PRIVATE_KEY_PATH = path.join(CERT_DIR, "apiclient_key.pem");
const MERCHANT_CERT_PATH = path.join(CERT_DIR, "apiclient_cert.pem");

// 缓存私钥和序列号
let merchantSerialNoCache: string | null = null;

function getMerchantSerialNo(): string {
  if (!merchantSerialNoCache) {
    const certPem = fs.readFileSync(MERCHANT_CERT_PATH, "utf-8");
    const cert = new crypto.X509Certificate(certPem);
    merchantSerialNoCache = cert.serialNumber.replace(/:/g, "");
  }
  return merchantSerialNoCache;
}

/**
 * 构建签名串
 * HTTP方法\nURL\n时间戳\n随机串\n请求体\n
 */
function buildSignStr(
  method: string,
  urlPath: string,
  timestamp: string,
  nonce: string,
  body: string
): string {
  return `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${body}\n`;
}

/** 生成签名（使用 openssl 命令，与微信支付 API v3 兼容） */
function sign(signStr: string): string {
  const tmpFile = path.join(os.tmpdir(), `wxpay_sign_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.txt`);
  try {
    fs.writeFileSync(tmpFile, signStr, "utf-8");
    const result = execSync(
      `openssl dgst -sha256 -sign ${PRIVATE_KEY_PATH} < ${tmpFile} | openssl base64 -A`,
      { encoding: "utf-8", timeout: 5000 }
    );
    return result.trim();
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

/**
 * 构建 Authorization 请求头
 *
 * WeChat Pay API v3 要求格式：
 *   Authorization: WECHATPAY2-SHA256-RSA2048 mchid="<mchid>",nonce_str="<nonce>",timestamp="<ts>",serial_no="<serial>",signature="<sig>"
 *
 * 注意：
 *   - scheme 后是空格（不是逗号）
 *   - 参数之间使用逗号分隔，无空格
 *   - 参数顺序：mchid, nonce_str, timestamp, serial_no, signature
 */
function buildAuthHeader(
  method: string,
  urlPath: string,
  body: string
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const signStr = buildSignStr(method, urlPath, timestamp, nonce, body);
  const signature = sign(signStr);

  const params = [
    `mchid="${MCHID}"`,
    `nonce_str="${nonce}"`,
    `timestamp="${timestamp}"`,
    `serial_no="${getMerchantSerialNo()}"`,
    `signature="${signature}"`,
  ];

  return `WECHATPAY2-SHA256-RSA2048 ${params.join(",")}`;
}

/**
 * 创建 Native 扫码支付订单
 * 返回 code_url（二维码链接）
 */
export async function createNativePayment(
  outTradeNo: string,
  totalFee: number,          // 单位：分
  description: string
): Promise<{ success: boolean; codeUrl?: string; error?: string }> {
  const urlPath = "/v3/pay/transactions/native";
  const bodyObj = {
    appid: APPID,
    mchid: MCHID,
    description,
    out_trade_no: outTradeNo,
    notify_url: NOTIFY_URL,
    amount: {
      total: totalFee,
      currency: "CNY",
    },
  };
  const body = JSON.stringify(bodyObj);
  const auth = buildAuthHeader("POST", urlPath, body);

  try {
    const res = await fetch(`https://api.mch.weixin.qq.com${urlPath}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "yida/1.0",
      },
      body,
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (res.ok && data.code_url) {
      return { success: true, codeUrl: data.code_url };
    }

    // 日志输出完整错误信息以辅助排查
    console.error("[WeChatPay] API Error:", {
      status: res.status,
      code: data.code,
      message: data.message,
      detail: data.detail,
      raw: text.substring(0, 500),
    });

    return {
      success: false,
      error: data.message || `微信支付错误(${data.code || res.status})`,
    };
  } catch (err: any) {
    console.error("[WeChatPay] Request failed:", err.message);
    return { success: false, error: `请求微信支付失败: ${err.message}` };
  }
}

/**
 * 查询订单支付状态
 * trade_state: SUCCESS / NOTPAY / CLOSED / PAYERROR / REFUND
 */
export async function queryOrder(
  outTradeNo: string
): Promise<{ tradeState: string; paid: boolean }> {
  const urlPath = `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${MCHID}`;
  const auth = buildAuthHeader("GET", urlPath, "");

  try {
    const res = await fetch(`https://api.mch.weixin.qq.com${urlPath}`, {
      headers: {
        Authorization: auth,
        Accept: "application/json",
        "User-Agent": "yida/1.0",
      },
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = {}; }

    if (!res.ok) {
      console.error("[WeChatPay] Query order failed:", {
        status: res.status,
        code: data.code,
        message: data.message,
        raw: text.substring(0, 500),
      });
    }

    return {
      tradeState: data.trade_state || "NOTPAY",
      paid: data.trade_state === "SUCCESS",
    };
  } catch (err: any) {
    console.error("[WeChatPay] Query request failed:", err.message);
    return { tradeState: "NOTPAY", paid: false };
  }
}
