import { NextRequest, NextResponse } from "next/server";
import { payjsVerifySign, updateOrderStatus, PAYJS_CONFIG } from "@/lib/payment";

/**
 * PayJS 异步回调通知
 * 用户支付成功后 PayJS 会 POST 到此地址
 * 必须在 3 秒内返回 "success"（纯文本），否则会重试
 * 重试频率：0、15、30、180、1800、3600 秒
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string | number> = {};

    for (const [key, value] of formData.entries()) {
      params[key] = String(value);
    }

    // 验签
    if (!payjsVerifySign(params, PAYJS_CONFIG.key)) {
      console.error("PayJS notify: invalid signature");
      return new NextResponse("fail", { status: 200 });
    }

    const returnCode = Number(params.return_code);
    const outTradeNo = String(params.out_trade_no || "");
    const payjsOrderId = String(params.payjs_order_id || "");
    const transactionId = String(params.transaction_id || "");
    const totalFee = Number(params.total_fee || 0);

    if (returnCode !== 1) {
      console.warn("PayJS notify: payment not successful", params);
      return new NextResponse("success", { status: 200 });
    }

    if (!outTradeNo) {
      console.error("PayJS notify: missing out_trade_no");
      return new NextResponse("fail", { status: 200 });
    }

    // 更新订单为已支付
    const updated = updateOrderStatus(outTradeNo, "paid", {
      paidAt: new Date().toISOString(),
      payjsOrderId,
      transactionId,
    });

    if (updated) {
      console.log(`PayJS payment success: order=${outTradeNo}, fee=${totalFee}分`);
    } else {
      console.warn(`PayJS notify: order not found: ${outTradeNo}`);
    }

    // PayJS 要求返回 "success" 纯文本
    return new NextResponse("success", { status: 200 });
  } catch (error) {
    console.error("PayJS notify error:", error);
    return new NextResponse("fail", { status: 200 });
  }
}
