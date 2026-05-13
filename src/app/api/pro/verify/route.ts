import { NextRequest, NextResponse } from "next/server";
import { activatePro } from "@/lib/pro-server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (typeof code !== "string") {
      return NextResponse.json({ error: "请提供激活码" }, { status: 400 });
    }

    const result = activatePro(code);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "激活失败" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Pro verify error:", error);
    return NextResponse.json({ error: "验证失败，请稍后重试" }, { status: 500 });
  }
}
