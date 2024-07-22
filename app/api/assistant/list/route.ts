import { throwError } from "~/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import { azureOpenAI } from "~/api/utils/azureInstance";

//查询助手列表
export async function POST(req: NextRequest) {
  try {
    const assistants = await azureOpenAI.beta.assistants.list();
    return NextResponse.json(assistants.data);
  } catch (error) {
    return throwError(error);
  }
}
