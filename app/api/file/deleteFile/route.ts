// my-app/pages/api/deleteFile.ts
import { throwError } from "@/app/utils/throwError";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function DELETE(req: NextRequest) {
  const { fileId } = await req.json();

  // Check if a file ID was provided in the request
  if (!fileId) {
    console.log("No file ID found in the request");
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    // Deleting the file from OpenAI
    console.log(`Starting file deletion from OpenAI, File ID: ${fileId}`);
    const deletionStatus = await openai.files.del(fileId);
    console.log(
      `File deleted, ID: ${deletionStatus.id}, Status: ${deletionStatus.deleted}`
    );

    // Respond with the deletion status
    return NextResponse.json({
      success: deletionStatus.deleted,
      fileId: deletionStatus.id,
    });
  } catch (error) {
    return throwError(error);
  }
}
