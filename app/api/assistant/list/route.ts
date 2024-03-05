import { throwError } from "@/app/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

//查询助手列表
export async function POST(req: NextRequest) {
  try {
    const assistants = await openai.beta.assistants.list();
    return NextResponse.json(assistants.data);
  } catch (error) {
    return throwError(error);
  }
}
