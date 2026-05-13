import type { AnalysisResult } from "./types";

/** 通义万相可用的最佳模型 */
export const IMAGE_MODEL_PLUS = "wanx2.1-t2i-plus";   // ¥0.20/张 专业版
export const IMAGE_MODEL_TURBO = "wanx2.1-t2i-turbo"; // ¥0.14/张 极速版

interface ImageGenResult {
  url: string;
  actualPrompt: string;
}

/**
 * 根据穿搭方案和分析结果构造通义万相提示词
 * 风格：真实参考级穿搭展示，不做过度美化，符合衣搭"真实参考级"定位
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

  const bodyDesc = analysis.bodyType
    ? (analysis.bodyType.includes("身材") ? analysis.bodyType : `${analysis.bodyType}身材`)
    : "匀称身材";

  return `一张真实参考级穿搭展示照片。一位${bodyDesc}的亚洲年轻女性，${analysis.skinTone || "自然"}肤色，${analysis.faceShape || ""}脸型，身穿以下全套搭配：

${itemsDesc}

风格：${style}
场合：${occasion}

拍摄要求：
- 正面全身站立，自然站姿，手机拍摄感
- 纯白/浅灰背景，自然光线
- 写实风格，不要过度美化或滤镜
- 服装颜色和款式准确还原
- 不做杂志大片效果，呈现真实穿搭参考感
- 照片比例为全身竖构图`;
}

/**
 * 调用通义万相文生图 API（异步任务）
 */
export async function generateOutfitImage(
  apiKey: string,
  prompt: string,
  model: string = IMAGE_MODEL_TURBO
): Promise<ImageGenResult> {
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
        model,
        input: { prompt },
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

  // 2. 轮询结果（最多等 60 秒）
  const maxPolls = 30;
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
