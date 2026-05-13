import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/pro-server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (typeof token !== "string" || !token) {
      return NextResponse.json({ isPro: false });
    }

    const result = verifyToken(token);

    return NextResponse.json({
      isPro: result.isValid,
      expiresAt: result.expiresAt || null,
    });
  } catch (error) {
    console.error("Pro status error:", error);
    return NextResponse.json({ isPro: false });
  }
}
