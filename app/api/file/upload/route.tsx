import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { createReadStream, existsSync, mkdirSync, unlink } from 'fs';
import OpenAI from "openai";
import { throwError } from '@/app/utils/throwError';

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL
});

export async function POST(request: NextRequest) {
  // Logging the start of the upload process
  try {
    console.log(`Upload API call started`);

    // Retrieving the file from the form data
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    // Check if a file was provided in the request
    if (!file) {
      console.log('No file found in the request');
      return NextResponse.json({ success: false });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const path = `./.tmp/${file.name}`;
    // 如果文件夹不存在则创建
    const dir = path.split('/').slice(0, -1).join('/');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    await writeFile(path, buffer);
    const fileForRetrieval = await openai.files.create({
      file: createReadStream(path),
      purpose: "assistants",
    });
    // 删除临时文件
    unlink(path, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    })
    console.log(`File uploaded, ID: ${fileForRetrieval.id}`);

    // Respond with the file ID
    return NextResponse.json({ success: true, fileId: fileForRetrieval.id });
  } catch (error) {
    return throwError(error);
  }
}