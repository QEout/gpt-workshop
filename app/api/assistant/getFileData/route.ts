// 获取openai的文件数据

import { throwError } from "@/app/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const { fileIds } = (await req.json()) as { fileIds: string[] };
    const files = [];
    for (const fileId of fileIds) {
      const file = await openai.files.retrieve(fileId);
      files.push(file);
    }
    return NextResponse.json(files);
  } catch (error) {
    return throwError(error);
  }
}
