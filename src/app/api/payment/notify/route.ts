import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatus } from "@/lib/payment";

/**
 * 微信支付 API v3 异步回调通知
 *
 * WeChat Pay 支付成功后 POST 到此地址
 * 必须在 5 秒内返回，否则会重试（最多 9 次）
 *
 * 响应格式：
 *   成功: {"code":"SUCCESS","message":"成功"}
 *   失败: {"code":"FAIL","message":"失败原因"}
 */

const API_V3_KEY = process.env.WECHAT_API_V3_KEY || "";

/**
 * AEAD-AES-256-GCM 解密微信支付回调数据
 */
function decryptWechatData(
  apiV3Key: string,
  associatedData: string,
  nonce: string,
  ciphertext: string
): string {
  // APIv3 密钥必须是 32 字节
  const key = Buffer.from(apiV3Key, "utf-8");
  const nonceBuf = Buffer.from(nonce, "utf-8");
  const cipherBuf = Buffer.from(ciphertext, "base64");

  // GCM 模式：最后 16 字节是认证标签
  const tag = cipherBuf.subarray(cipherBuf.length - 16);
  const data = cipherBuf.subarray(0, cipherBuf.length - 16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, nonceBuf);
  decipher.setAuthTag(tag);
  decipher.setAAD(Buffer.from(associatedData, "utf-8"));

  const decrypted = decipher.update(data, undefined, "utf-8");
  return decrypted + decipher.final("utf-8");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, event_type, resource } = body;

    if (!resource || !resource.ciphertext) {
      console.error("[WeChatPay Notify] Invalid notification body");
      return NextResponse.json(
        { code: "FAIL", message: "参数错误" },
        { status: 200 }
      );
    }

    // 使用 APIv3 密钥解密 resource
    let decrypted: string;
    try {
      decrypted = decryptWechatData(
        API_V3_KEY,
        resource.associated_data || "",
        resource.nonce || "",
        resource.ciphertext
      );
    } catch (err: any) {
      console.error("[WeChatPay Notify] Decryption failed:", err.message);
      return NextResponse.json(
        { code: "FAIL", message: "解密失败" },
        { status: 200 }
      );
    }

    const paymentData = JSON.parse(decrypted);

    // 获取订单信息
    const outTradeNo = paymentData.out_trade_no;
    const transactionId = paymentData.transaction_id;
    const tradeState = paymentData.trade_state;

    console.log(
      `[WeChatPay Notify] event=${event_type}, order=${outTradeNo}, state=${tradeState}, tx=${transactionId}`
    );

    if (tradeState === "SUCCESS") {
      updateOrderStatus(outTradeNo, "paid", {
        paidAt: new Date().toISOString(),
        transactionId,
      });
      console.log(`[WeChatPay Notify] Payment confirmed: ${outTradeNo}`);
    } else {
      console.log(
        `[WeChatPay Notify] Trade state not SUCCESS: ${tradeState}`
      );
    }

    // 必须返回 SUCCESS 否则微信会重试
    return NextResponse.json(
      { code: "SUCCESS", message: "成功" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[WeChatPay Notify] Error:", error.message);
    return NextResponse.json(
      { code: "FAIL", message: "处理失败" },
      { status: 200 }
    );
  }
}
