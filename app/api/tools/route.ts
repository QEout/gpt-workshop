import { NextRequest, NextResponse } from "next/server";
import { chatTools, tools } from "./utils";
import { throwError } from "@/app/utils/throwError";
// 获取assistant可用的工具
export async function POST(req: NextRequest) {
  const { type = "assistant" } = await req.json();
  try {
    // 返回可用的工具列表
    return NextResponse.json(type === "chat" ? chatTools : tools);
  } catch (error) {
    return throwError(error);
  }
}
