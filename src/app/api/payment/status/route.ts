import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrderStatus } from "@/lib/payment";
import { queryOrder } from "@/lib/wechat-pay";

/**
 * 查询订单支付状态
 * 先查本地，再向微信支付确认
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

  // 如果本地已经是 paid，直接返回
  if (order.status === "paid") {
    return NextResponse.json({
      status: "paid",
      paid: true,
      createdAt: order.createdAt,
      paidAt: order.paidAt || null,
    });
  }

  // 向微信支付确认最新状态
  const wxResult = await queryOrder(orderId);

  if (wxResult.paid) {
    // 更新本地状态
    updateOrderStatus(orderId, "paid", {
      paidAt: new Date().toISOString(),
    });
    return NextResponse.json({
      status: "paid",
      paid: true,
      createdAt: order.createdAt,
      paidAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    status: "pending",
    paid: false,
    tradeState: wxResult.tradeState,
    createdAt: order.createdAt,
    paidAt: null,
  });
}
