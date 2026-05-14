import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface ProUser {
  activatedAt: string;
  expiresAt: string;
  method: string;
}

interface ProData {
  tokens: Record<string, ProUser>;
}

function getDataPath(): string {
  return path.join(process.cwd(), "data", "pro-users.json");
}

function readProData(): ProData {
  try {
    const raw = fs.readFileSync(getDataPath(), "utf-8");
    return JSON.parse(raw);
  } catch {
    return { tokens: {} };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ isPro: false, expiresAt: null });
    }

    const data = readProData();
    const user = data.tokens[token];

    if (!user) {
      return NextResponse.json({ isPro: false, expiresAt: null });
    }

    const now = Date.now();
    const expires = new Date(user.expiresAt).getTime();

    if (now >= expires) {
      return NextResponse.json({ isPro: false, expiresAt: null });
    }

    return NextResponse.json({
      isPro: true,
      expiresAt: user.expiresAt,
    });
  } catch {
    return NextResponse.json({ isPro: false, expiresAt: null });
  }
}
