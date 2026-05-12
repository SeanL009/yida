import { NextRequest, NextResponse } from "next/server";
import { generateOutfits } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { analysis, style, occasion, colorScheme } = await request.json();

    if (!analysis || !style || !occasion) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const outfits = await generateOutfits(analysis, style, occasion, colorScheme);

    return NextResponse.json({ outfits });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "生成失败，请重试" },
      { status: 500 }
    );
  }
}
