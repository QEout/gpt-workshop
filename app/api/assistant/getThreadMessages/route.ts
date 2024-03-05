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

    const formattedMsgs: Message[] = messages.data.map((msg) => {
      const content = msg.content[0];
      return {
        id: msg.id,
        content: content.type === "text" ? content.text.value : "",
        annotations:
          content.type === "text" ? (content.text.annotations as any) : [],
        created: msg.created_at,
        role: msg.role,
      };
    });
    return NextResponse.json(formattedMsgs);
  } catch (error) {
    return throwError(error);
  }
}
