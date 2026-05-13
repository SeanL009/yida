import type { AnalysisResult } from "./types";

/** 通义万相可用模型 */
export const IMAGE_MODEL_PLUS = "wanx2.1-t2i-plus";   // ¥0.20/张 文生图专业版
export const IMAGE_MODEL_TURBO = "wanx2.1-t2i-turbo"; // ¥0.14/张 文生图极速版
export const IMAGE_MODEL_I2I = "wanx-v1";              // ¥0.16/张 图生图（支持参考图）

interface ImageGenResult {
  url: string;
  actualPrompt: string;
}

/**
 * 构造文生图提示词 — 根据文本描述生成穿搭照片（无参考图时使用）
 */
export function buildOutfitPrompt(
  analysis: AnalysisResult,
  style: string,
  occasion: string,
  items: Array<{ category: string; item: string; color?: string }>
): string {
  const itemsDesc = items
    .map((i) => {
      const colorStr = i.color ? `${i.color}色的` : "";
      return `- ${i.category}：${colorStr}${i.item}`;
    })
    .join("\n");

  return `一位年轻女性穿着以下全套搭配：

${itemsDesc}

风格：${style}
场合：${occasion}
体型：${analysis.bodyType}
脸型：${analysis.faceShape}
肤色：${analysis.skinTone}

要求：
- 真实参考级穿搭展示，写实风格
- 全身展示，自然站姿
- 衣服的颜色、款式准确还原
- 白色或纯色背景，简洁干净
- 高清细节，光线柔和自然`;
}

/**
 * 构造图生图提示词 — 基于用户照片换装
 * 保持人物面部/发型/体型不变，只更换衣物
 */
export function buildOutfitI2IPrompt(
  analysis: AnalysisResult,
  style: string,
  occasion: string,
  items: Array<{ category: string; item: string; color?: string }>
): string {
  const itemsDesc = items
    .map((i) => {
      const colorStr = i.color ? `${i.color}色的` : "";
      return `- ${i.category}：${colorStr}${i.item}`;
    })
    .join("\n");

  return `保持人物的面部特征、发型、体型和肤色完全不变，仅将衣服更换为以下全套搭配：

${itemsDesc}

风格：${style}
场合：${occasion}

要求：
- 人物面部、发型必须与原图一致
- 衣服的颜色、款式准确还原
- 全身展示，自然站姿
- 写实风格，真实参考级穿搭展示
- 不要改变背景、光线和人物姿态`;
}

/**
 * 调用通义万相 API 生成穿搭照片
 * 如果传了 userImage，使用图生图模式（保持人物特征换装）
 * 否则使用文生图模式（根据文本描述生成）
 */
export async function generateOutfitImage(
  apiKey: string,
  prompt: string,
  userImage?: string,       // data URL of user's photo
  model?: string            // override model
): Promise<ImageGenResult> {
  const actualModel = model || (userImage ? IMAGE_MODEL_I2I : IMAGE_MODEL_PLUS);

  const input: Record<string, string> = { prompt };
  if (userImage) {
    input.image = userImage;
  }

  // 1. 提交异步任务
  const submitResp = await fetch(
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: actualModel,
        input,
        parameters: { size: "1024*1024", n: 1 },
      }),
    }
  );

  if (!submitResp.ok) {
    const err = await submitResp.json().catch(() => ({}));
    throw new Error(err.message || `提交失败: ${submitResp.status}`);
  }

  const submitData = await submitResp.json();
  const taskId = submitData.output?.task_id;
  if (!taskId) {
    throw new Error("提交成功但未获取到任务ID");
  }

  // 2. 轮询结果（最多等 90 秒）
  const maxPolls = 45;
  for (let i = 0; i < maxPolls; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const pollResp = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (!pollResp.ok) {
      throw new Error(`查询任务状态失败: ${pollResp.status}`);
    }

    const pollData = await pollResp.json();
    const status = pollData.output?.task_status;

    if (status === "SUCCEEDED") {
      const results = pollData.output?.results || [];
      if (results.length === 0) {
        throw new Error("生成成功但未返回图片");
      }
      return {
        url: results[0].url,
        actualPrompt: results[0].actual_prompt || prompt,
      };
    }

    if (status === "FAILED") {
      throw new Error(pollData.output?.message || "图片生成失败");
    }

    // RUNNING / PENDING — 继续等待
  }

  throw new Error("图片生成超时，请稍后重试");
}
