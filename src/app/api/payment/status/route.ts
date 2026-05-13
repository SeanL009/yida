import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/payment";

/**
 * 轮询查询订单支付状态
 * GET /api/payment/status?order_id=xxx
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
  }

  const order = getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  return NextResponse.json({
    status: order.status,
    paid: order.status === "paid",
    createdAt: order.createdAt,
    paidAt: order.paidAt || null,
  });
}
