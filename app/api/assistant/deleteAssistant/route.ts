//delete assistant
import { throwError } from "@/app/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      throw new Error("Missing required assistantId");
    }
    await openai.beta.assistants.del(id);
    return NextResponse.json({
      success: true,
      message: `Assistant with ID: ${id} deleted successfully.`,
    });
  } catch (error) {
    return throwError(error);
  }
}
