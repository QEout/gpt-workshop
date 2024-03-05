import { throwError } from "@/app/utils/throwError";
import { Message } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// 获取thread messages
export async function POST(req: NextRequest) {
  try {
    const { threadId, limit } = await req.json();
    if (!threadId) {
      throw new Error("Missing required threadId");
    }
    const messages = await openai.beta.threads.messages.list(threadId, {
      limit: limit,
      order: "asc",
    });

    return NextResponse.json(messages.data);
  } catch (error) {
    return throwError(error);
  }
}
