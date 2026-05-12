import { NextRequest, NextResponse } from "next/server";
import { analyzePhoto } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "请上传照片" },
        { status: 400 }
      );
    }

    const analysis = await analyzePhoto(image);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "分析失败，请重试" },
      { status: 500 }
    );
  }
}
