import { throwError } from "@/app/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import { azureOpenAI } from "../../utils/azureInstance";

// 获取thread messages
export async function POST(req: NextRequest) {
  try {
    const { threadId, limit } = await req.json();
    if (!threadId) {
      throw new Error("Missing required threadId");
    }
    const messages = await azureOpenAI.beta.threads.messages.list(threadId, {
      limit: limit,
      order: "asc",
    });

    return NextResponse.json(messages.data);
  } catch (error) {
    return throwError(error);
  }
}
