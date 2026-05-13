import { NextRequest, NextResponse } from "next/server";
import { buildOutfitPrompt, generateOutfitImage } from "@/lib/openai-image";

export async function POST(request: NextRequest) {
  try {
    const { analysis, style, occasion, colorScheme, items } = await request.json();

    if (!analysis || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "缺少穿搭方案信息" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "未配置 API Key" },
        { status: 500 }
      );
    }

    // 构造提示词
    const prompt = buildOutfitPrompt(analysis, style || "", occasion || "", items);

    // 使用 turbo 版（¥0.14/张，性价比高）
    // 如需更高质量可改为 IMAGE_MODEL_PLUS（¥0.20/张）
    const result = await generateOutfitImage(apiKey, prompt);

    return NextResponse.json({
      success: true,
      imageUrl: result.url,
      prompt: result.actualPrompt,
    });
  } catch (error) {
    console.error("Generate image error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "图片生成失败" },
      { status: 500 }
    );
  }
}
