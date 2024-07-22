import { throwError } from "@/app/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import { azureOpenAI } from "../../utils/azureInstance";


export async function POST(req: NextRequest) {
  const { fileId } = await req.json();
  try {
    const file = await azureOpenAI.files.retrieve(fileId);
    return NextResponse.json(file);
  } catch (error) {
    return throwError(error);
  }
}
