import { NextRequest, NextResponse } from "next/server";
import { createNativePayment } from "@/lib/wechat-pay";
import { generateOrderId, createOrder } from "@/lib/payment";

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    // 检查配置
    if (!process.env.WECHAT_MCHID || !process.env.WECHAT_APPID) {
      return NextResponse.json({ error: "支付配置未完成" }, { status: 500 });
    }

    // ¥0.99 = 99 分
    const totalFee = 99;
    const outTradeNo = generateOrderId();

    // 调用微信支付 Native API
    const result = await createNativePayment(
      outTradeNo,
      totalFee,
      title || "衣搭 - AI穿搭照片"
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "创建支付订单失败" },
        { status: 500 }
      );
    }

    // 持久化订单
    createOrder(outTradeNo, 0.99, title || "AI穿搭照片");

    return NextResponse.json({
      success: true,
      orderId: outTradeNo,
      codeUrl: result.codeUrl,
    });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
