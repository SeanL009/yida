import { NextRequest, NextResponse } from "next/server";
import { verifySign, updateOrderStatus, XUNHU_CONFIG } from "@/lib/payment";

/**
 * 虎皮椒异步回调通知
 * 用户付款后，虎皮椒会 POST 到此地址
 * 必须返回 "success"（纯文本）表示接收成功，否则会重试最多6次
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string | number> = {};

    // 将 FormData 转为普通对象
    for (const [key, value] of formData.entries()) {
      params[key] = String(value);
    }

    // 验证签名
    if (!verifySign(params, XUNHU_CONFIG.appSecret)) {
      console.error("Payment notify: invalid signature");
      return new NextResponse("fail", { status: 200 });
    }

    const tradeOrderId = String(params.trade_order_id || "");
    const status = String(params.status || "");
    const openOrderId = String(params.open_order_id || "");
    const transactionId = String(params.transaction_id || "");
    const totalFee = String(params.total_fee || "");

    if (!tradeOrderId) {
      console.error("Payment notify: missing trade_order_id");
      return new NextResponse("fail", { status: 200 });
    }

    // 只处理已支付状态
    if (status === "OD") {
      const updated = updateOrderStatus(tradeOrderId, "paid", {
        paidAt: new Date().toISOString(),
        openOrderId,
        transactionId,
      });

      if (updated) {
        console.log(`Payment success: order=${tradeOrderId}, fee=${totalFee}`);
      } else {
        console.warn(`Payment notify: order not found: ${tradeOrderId}`);
      }
    }

    // 虎皮椒要求返回 "success"（纯文本）
    return new NextResponse("success", { status: 200 });
  } catch (error) {
    console.error("Payment notify error:", error);
    return new NextResponse("fail", { status: 200 });
  }
}
