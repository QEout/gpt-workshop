//retrieve assistant
import { throwError } from "@/app/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: NextRequest) {
  const data =await req.json();
  const assistantId = data.id;
  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    return NextResponse.json(assistant);
  } catch (error) { 
    return throwError(error);
  }
}