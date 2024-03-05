import { throwError } from "@/app/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  context: { params: { fileId: string } }
) {
  try {
  const fileId= context.params.fileId;
  const fileInfo = await openai.files.retrieve(fileId);
  const fileContent = await openai.files.content(fileId);
  //读取文件然后保存在临时目录，然后返回
  const bytes= await fileContent.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": `attachment; filename=${fileInfo.filename}`,
    },
  });
  } catch (error) {
    return throwError(error);
  }
}
