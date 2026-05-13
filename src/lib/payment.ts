import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface PaymentOrder {
  tradeOrderId: string;
  totalFee: number;
  title: string;
  status: "pending" | "paid" | "completed" | "expired";
  createdAt: string;
  paidAt?: string;
  openOrderId?: string;
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

/**
 * 生成虎皮椒签名
 * 规则：所有非空参数按 key ASCII 排序 → key=value&... 拼接 → 末尾拼 AppSecret → MD5
 */
export function generateSign(
  params: Record<string, string | number>,
  appSecret: string
): string {
  const keys = Object.keys(params)
    .filter((k) => k !== "hash" && params[k] !== null && params[k] !== "")
    .sort();

  const str = keys.map((k) => `${k}=${params[k]}`).join("&") + appSecret;
  return crypto.createHash("md5").update(str).digest("hex");
}

/**
 * 验证虎皮椒回调签名
 */
export function verifySign(
  params: Record<string, string | number>,
  appSecret: string
): boolean {
  const receivedHash = String(params.hash || "");
  if (!receivedHash) return false;
  const calculated = generateSign(params, appSecret);
  return calculated === receivedHash;
}

/** 虎皮椒支付网关配置 */
export const XUNHU_CONFIG = {
  get endpoint() {
    return process.env.XUNHU_ENDPOINT || "https://api.xunhupay.com/payment/do.html";
  },
  get appid() {
    return process.env.XUNHU_APPID || "";
  },
  get appSecret() {
    return process.env.XUNHU_APPSECRET || "";
  },
  get notifyUrl() {
    return process.env.XUNHU_NOTIFY_URL || "https://yida.sean.my/api/payment/notify";
  },
};
