//retrieve assistant
import { throwError } from "@/app/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import { azureOpenAI } from "../../utils/azureInstance";

export async function POST(req: NextRequest) {
  const data =await req.json();
  const assistantId = data.id;
  try {
    const assistant = await azureOpenAI.beta.assistants.retrieve(assistantId);
    return NextResponse.json(assistant);
  } catch (error) { 
    return throwError(error);
  }
}