import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.qq.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FEEDBACK_TO = process.env.FEEDBACK_TO || "sean009@qq.com";

export async function POST(request: NextRequest) {
  try {
    const { message, contact } = await request.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "请填写建议内容" },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: "建议内容不能超过500字" },
        { status: 400 }
      );
    }

    // 如果没有配置 SMTP，则记录日志并返回成功（开发环境降级）
    if (!SMTP_USER || !SMTP_PASS) {
      console.log("[Feedback]", message, contact ? `| 联系方式: ${contact}` : "");
      return NextResponse.json({ success: true, note: "感谢你的建议！(dev mode)" });
    }

    // 使用 nodemailer 发送邮件（每个请求创建独立连接）
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // 先验证 SMTP 连接
    console.log("[Feedback] 正在连接 SMTP...");
    await transporter.verify();
    console.log("[Feedback] SMTP 连接成功");

    const contactLine = contact?.trim()
      ? `\n联系方式：${contact.trim()}`
      : "";

    const mailOptions = {
      from: `"衣搭反馈" <${SMTP_USER}>`,
      to: FEEDBACK_TO,
      subject: `衣搭用户建议${contact?.trim() ? "（含联系方式）" : ""}`,
      text: `用户建议：\n\n${message.trim()}${contactLine}\n\n—— 来自衣搭 AI穿搭助手`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[Feedback] 邮件已发送:", info.messageId, info.response);

    return NextResponse.json({ success: true, message: "感谢你的建议！我们会认真阅读每一条反馈 ❤️" });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "提交失败，请稍后重试" },
      { status: 500 }
    );
  }
}
