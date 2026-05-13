import OpenAI from "openai";
import type { AnalysisResult, OutfitSuggestion } from "./types";

function getDashScope(): OpenAI {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("请在 .env.local 文件中设置 DASHSCOPE_API_KEY（阿里云通义千问 API Key）");
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });
}

export async function analyzePhoto(
  imageDataUrl: string
): Promise<AnalysisResult> {
  const client = getDashScope();

  const response = await client.chat.completions.create({
    model: "qwen-vl-max",
    messages: [
      {
        role: "system",
        content: `你是一个专业的个人穿搭分析师。分析用户照片中的以下特征，用中文回答，以JSON格式返回（不要用markdown代码块包裹）：

1. faceShape: 脸型分析（圆脸/方脸/长脸/心形脸/鹅蛋脸/菱形脸等）
2. bodyType: 体型分类（梨形/苹果形/沙漏形/矩形/倒三角/小个子/高挑/匀称等）
3. bodyProportions: 身形比例详细分析，包括肩宽 vs 胯宽比例、腰线位置、腿部比例等（一句话概括，20字以内，如"肩窄胯宽梨形身材，腰线适中"）
4. skinTone: 肤色基调（暖白皮/冷白皮/黄皮/黄黑皮/小麦色等）
5. stylePreference: 从照片中推断的风格倾向（简约/甜美/休闲/职场等）
6. description: 一段简短的整体印象描述（15字以内）
7. recommendedStyles: 根据脸型和身形比例推荐的3种最适合的穿搭方向，数组格式（如["V领修饰圆脸","高腰A字裙优化比例","直筒裤修饰腿型"]）

注意：
- 根据脸型推荐适合的领型（圆脸适合V领、方脸适合圆领等）
- 根据身形比例给出具体的穿搭建议方向（梨形推荐突出腰线、修饰胯部；苹果形推荐V领、竖线条；小个子推荐高腰线、同色系等）`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  const text = response.choices[0]?.message?.content || "{}";
  const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
  try {
    return JSON.parse(cleaned) as AnalysisResult;
  } catch {
    // JSON 解析失败时返回默认值
    return {
      faceShape: "",
      bodyType: "",
      bodyProportions: "",
      skinTone: "",
      stylePreference: "",
      description: "",
      recommendedStyles: [],
    } as AnalysisResult;
  }
}

export async function generateOutfits(
  analysis: AnalysisResult,
  style: string,
  occasion: string,
  colorScheme: string = "随机搭配",
  count: number = 1,
  variation: boolean = false,
  season: string = ""
): Promise<OutfitSuggestion[]> {
  const client = getDashScope();

  // 处理"随机搭配"：让AI根据分析结果自动选择
  const styleDesc = style === "随机搭配"
    ? `根据用户体型和气质，自动选择最合适的风格`
    : `风格：${style}`;
  const occasionDesc = occasion === "随机搭配"
    ? `根据用户体型和场合需求，自动选择最合适的场合搭配`
    : `场合：${occasion}`;
  const colorDesc = colorScheme === "随机搭配"
    ? "配色方案：根据风格和场合自动推荐最合适的配色"
    : `配色方向：${colorScheme}`;
  const seasonDesc = season
    ? `季节：${season}，请推荐适合该季节的材质和厚度`
    : "";

  const variationHint = variation
    ? "\n- 注意：请生成一套与上次完全不同的搭配方案，更换不同的单品组合、颜色或款式"
    : "";

  const response = await client.chat.completions.create({
    model: "qwen-turbo",
    messages: [
      {
        role: "system",
        content: `你是一个专业的时尚穿搭顾问。根据用户的身体特征和需求，生成${count}套穿搭方案。

重要规则：
- ${count === 1 ? "生成1套完整搭配" : "每套方案必须包含完整搭配"}：外套（如需）、上装、下装/裙子、鞋子、配饰
- 单品要具体，包括颜色、材质、款式
- 搭配要符合用户体型特点，扬长避短
- ${styleDesc}
- ${occasionDesc}
- ${colorDesc}
- ${seasonDesc}
- tips要实用，给出具体的穿搭技巧
- 用中文返回
- 方案标题控制在6字以内${variationHint}

返回JSON格式（不要用markdown代码块包裹）：
{
  "outfits": [
    {
      "title": "方案名称",
      "items": [
        { "category": "外套", "item": "米色长款风衣" },
        { "category": "上装", "item": "白色圆领真丝衬衫" },
        { "category": "下装", "item": "深蓝直筒牛仔裤" },
        { "category": "鞋子", "item": "米色尖头低跟鞋" },
        { "category": "配饰", "item": "棕色托特包" }
      ],
      "tip": "搭配要点说明（一句话，15字以内）"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `用户脸型：${analysis.faceShape}
用户体型：${analysis.bodyType}
身形比例：${analysis.bodyProportions}
肤色：${analysis.skinTone}
风格印象：${analysis.description}
${styleDesc}
${occasionDesc}
${colorDesc}
${seasonDesc}
请生成${count}套穿搭方案。`,
      },
    ],
    max_tokens: 1500,
  });

  const text = response.choices[0]?.message?.content || '{"outfits":[]}';
  const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
  let result: any;
  try {
    result = JSON.parse(cleaned);
  } catch {
    result = { outfits: [] };
  }

  return (result.outfits || []).map((outfit: any, index: number) => ({
    id: index + 1,
    title: outfit.title || `方案 ${index + 1}`,
    items: outfit.items || [],
    style: style,
    occasion: occasion,
    colorScheme: colorScheme,
    tip: outfit.tip || "",
  }));
}
