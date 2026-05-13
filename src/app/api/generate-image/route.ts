import { NextRequest, NextResponse } from "next/server";
import { buildOutfitPrompt, buildOutfitI2IPrompt, generateOutfitImage, IMAGE_MODEL_PLUS } from "@/lib/openai-image";

export async function POST(request: NextRequest) {
  try {
    const { analysis, style, occasion, colorScheme, items, userImage } = await request.json();

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

    // 构造提示词：有用户照片时使用图生图（保持人物特征），否则使用文生图
    const prompt = userImage
      ? buildOutfitI2IPrompt(analysis, style || "", occasion || "", items)
      : buildOutfitPrompt(analysis, style || "", occasion || "", items);

    // 使用 plus 版（¥0.20/张，专业级细节）
    const result = await generateOutfitImage(apiKey, prompt, userImage || undefined, IMAGE_MODEL_PLUS);

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
