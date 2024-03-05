import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL
});

export async function POST(req: NextRequest) {
  try {
    // Extract JSON data from the request
    const data = await req.json();
    const threadId = data.threadId;
    const runId = data.runId;

    // Log the received thread ID and run ID for debugging
    console.log(`Received request with threadId: ${threadId} and runId: ${runId}`);

    // Retrieve the status of the run for the given thread ID and run ID using the OpenAI API
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    // Log the retrieved run status for debugging
    console.log(`Retrieved run status: ${runStatus.status}`);

    // Return the retrieved run status as a JSON response
    return NextResponse.json({ status: runStatus.status });
  } catch (error) {
    // Log any errors that occur during the process
    console.error(`Error occurred: ${error}`);
  }
}