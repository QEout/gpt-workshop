import { throwError } from "@/app/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { fileId } = await req.json();
  try {
    const file = await openai.files.retrieve(fileId);
    return NextResponse.json(file);
  } catch (error) {
    return throwError(error);
  }
}
