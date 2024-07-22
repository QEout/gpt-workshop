// 获取openai的文件数据

import { throwError } from "@/app/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import { azureOpenAI } from "../../utils/azureInstance";


export async function POST(req: NextRequest) {
  try {
    const { fileIds } = (await req.json()) as { fileIds: string[] };
    const files = [];
    for (const fileId of fileIds) {
      const file = await azureOpenAI.files.retrieve(fileId);
      files.push(file);
    }
    return NextResponse.json(files);
  } catch (error) {
    return throwError(error);
  }
}
