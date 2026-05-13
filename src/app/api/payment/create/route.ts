import { NextRequest, NextResponse } from "next/server";
import {
  generateOrderId,
  createOrder,
  payjsSign,
  payjsNativePay,
  buildCashierUrl,
  PAYJS_CONFIG,
} from "@/lib/payment";

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!PAYJS_CONFIG.mchid || !PAYJS_CONFIG.key) {
      return NextResponse.json({ error: "支付未配置" }, { status: 500 });
    }

    // ¥0.99 = 99 分（PayJS 金额单位是分）
    const totalFee = 99;
    const outTradeNo = generateOrderId();

    // 构建 Native 扫码支付参数
    const nativeParams: Record<string, string | number> = {
      mchid: PAYJS_CONFIG.mchid,
      total_fee: totalFee,
      out_trade_no: outTradeNo,
      body: title || "衣搭 - AI穿搭照片",
      notify_url: PAYJS_CONFIG.notifyUrl,
      attach: outTradeNo,
    };
    nativeParams.sign = payjsSign(nativeParams, PAYJS_CONFIG.key);

    // 调用 PayJS Native API 获取二维码
    const result = await payjsNativePay(nativeParams as any);

    if (result.return_code !== 1) {
      console.error("PayJS error:", result);
      return NextResponse.json(
        { error: result.return_msg || "创建支付订单失败" },
        { status: 500 }
      );
    }

    // 持久化订单
    createOrder(outTradeNo, 0.99, title || "AI穿搭照片");

    // 生成收银台 URL（微信内打开可直接支付）
    const cashierParams: Record<string, string | number> = {
      mchid: PAYJS_CONFIG.mchid,
      total_fee: totalFee,
      out_trade_no: outTradeNo,
      body: title || "衣搭 - AI穿搭照片",
      notify_url: PAYJS_CONFIG.notifyUrl,
      callback_url: "https://jiulant.cn/generate",
      auto: 1,   // 自动弹出支付
    };
    cashierParams.sign = payjsSign(cashierParams, PAYJS_CONFIG.key);
    const cashierUrl = buildCashierUrl(cashierParams);

    return NextResponse.json({
      success: true,
      orderId: outTradeNo,
      // 二维码（PC 用 / 截图扫码）
      codeUrl: result.code_url,
      qrcode: result.qrcode,    // base64 图片
      // 收银台链接（手机微信内直接支付）
      cashierUrl,
    });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
