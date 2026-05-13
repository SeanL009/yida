import { NextRequest, NextResponse } from "next/server";
import {
  generateOrderId,
  createOrder,
  generateSign,
  XUNHU_CONFIG,
} from "@/lib/payment";

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!XUNHU_CONFIG.appid || !XUNHU_CONFIG.appSecret) {
      return NextResponse.json({ error: "支付未配置" }, { status: 500 });
    }

    // ¥0.99 / 次
    const totalFee = "0.99";
    const tradeOrderId = generateOrderId();
    const time = Math.floor(Date.now() / 1000);
    const nonceStr = Math.random().toString(36).substring(2, 18);

    // 构建请求参数
    const params: Record<string, string | number> = {
      version: "1.1",
      appid: XUNHU_CONFIG.appid,
      trade_order_id: tradeOrderId,
      total_fee: totalFee,
      title: title || "衣搭 - AI穿搭照片",
      time,
      notify_url: XUNHU_CONFIG.notifyUrl,
      nonce_str: nonceStr,
      // 用户支付后跳转回生成页
      return_url: "https://yida.sean.my/generate",
      callback_url: "https://yida.sean.my/generate",
      attach: tradeOrderId,
    };

    // 生成签名
    const hash = generateSign(params, XUNHU_CONFIG.appSecret);
    params.hash = hash;

    // 调用虎皮椒 API
    const resp = await fetch(XUNHU_CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params as Record<string, string>),
    });

    const data = await resp.json();

    if (!resp.ok || data.errcode !== 0) {
      return NextResponse.json(
        { error: data.errmsg || "创建支付订单失败" },
        { status: 500 }
      );
    }

    // 持久化订单
    createOrder(tradeOrderId, 0.99, title || "AI穿搭照片");
    // 注意：虎皮椒实际可能返回 errcode=0 但需要检查 data.errcode
    // 文档中说返回 errcode=0 表示成功

    return NextResponse.json({
      success: true,
      orderId: tradeOrderId,
      qrCodeUrl: data.url_qrcode,
      redirectUrl: data.url,
    });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
