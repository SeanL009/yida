import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface PaymentOrder {
  tradeOrderId: string;
  totalFee: number;       // 单位：元
  title: string;
  status: "pending" | "paid" | "completed" | "expired";
  createdAt: string;
  paidAt?: string;
  payjsOrderId?: string;
  transactionId?: string;
}

/** 订单数据文件路径 */
function getOrdersPath(): string {
  return path.join(process.cwd(), "data", "orders.json");
}

/** 读取所有订单 */
function readOrders(): Record<string, PaymentOrder> {
  try {
    const raw = fs.readFileSync(getOrdersPath(), "utf-8");
    return JSON.parse(raw).orders || {};
  } catch {
    return {};
  }
}

/** 写入所有订单 */
function writeOrders(orders: Record<string, PaymentOrder>): void {
  const dir = path.dirname(getOrdersPath());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(getOrdersPath(), JSON.stringify({ orders }, null, 2), "utf-8");
}

/** 生成商户订单号: yida_{时间戳}_{4位随机数} */
export function generateOrderId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 6);
  return `yida_${ts}_${rand}`;
}

/** 创建订单并持久化 */
export function createOrder(
  tradeOrderId: string,
  totalFee: number,
  title: string
): PaymentOrder {
  const orders = readOrders();
  const order: PaymentOrder = {
    tradeOrderId,
    totalFee,
    title,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders[tradeOrderId] = order;
  writeOrders(orders);
  return order;
}

/** 更新订单状态 */
export function updateOrderStatus(
  tradeOrderId: string,
  status: PaymentOrder["status"],
  extra?: Partial<PaymentOrder>
): PaymentOrder | null {
  const orders = readOrders();
  const order = orders[tradeOrderId];
  if (!order) return null;

  order.status = status;
  if (extra) Object.assign(order, extra);
  orders[tradeOrderId] = order;
  writeOrders(orders);
  return order;
}

/** 查询订单 */
export function getOrder(tradeOrderId: string): PaymentOrder | null {
  const orders = readOrders();
  return orders[tradeOrderId] || null;
}

// ======== PayJS 支付相关 ========

/**
 * PayJS 签名算法
 * 1. 移除 sign 字段
 * 2. 按 key ASCII 升序排序
 * 3. 拼接 key1=value1&key2=value2&key={商户密钥}
 * 4. MD5 → 大写
 */
export function payjsSign(
  params: Record<string, string | number>,
  key: string
): string {
  const sorted: Record<string, string | number> = {};
  Object.keys(params)
    .filter((k) => k !== "sign" && params[k] !== null && params[k] !== "")
    .sort()
    .forEach((k) => {
      sorted[k] = params[k];
    });

  const str = Object.entries(sorted)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return crypto.createHash("md5").update(`${str}&key=${key}`).digest("hex").toUpperCase();
}

/** 验证 PayJS 回调签名 */
export function payjsVerifySign(
  params: Record<string, string | number>,
  key: string
): boolean {
  const received = String(params.sign || "");
  if (!received) return false;
  const calculated = payjsSign(params, key);
  return calculated === received;
}

/** PayJS 配置 */
export const PAYJS_CONFIG = {
  get mchid() {
    return process.env.PAYJS_MCHID || "";
  },
  get key() {
    return process.env.PAYJS_KEY || "";
  },
  get notifyUrl() {
    return process.env.PAYJS_NOTIFY_URL || "https://jiulant.cn/api/payment/notify";
  },
  /** Native 扫码支付 */
  nativeEndpoint: "https://payjs.cn/api/native",
  /** 收银台模式 */
  cashierEndpoint: "https://payjs.cn/api/cashier",
};

/**
 * 调用 PayJS Native 扫码支付
 * 返回二维码 URL 和 payjs 订单号
 */
export async function payjsNativePay(params: {
  mchid: string;
  total_fee: number;   // 单位：分
  out_trade_no: string;
  body?: string;
  attach?: string;
  notify_url?: string;
  sign: string;
}): Promise<{
  return_code: number;
  return_msg: string;
  payjs_order_id: string;
  code_url: string;
  qrcode: string;
}> {
  const resp = await fetch(PAYJS_CONFIG.nativeEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return resp.json();
}

/**
 * 生成收银台 URL（微信内打开可直接支付）
 */
export function buildCashierUrl(params: Record<string, string | number>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => search.set(k, String(v)));
  return `${PAYJS_CONFIG.cashierEndpoint}?${search.toString()}`;
}
