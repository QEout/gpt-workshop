import { throwError } from '@/app/utils/throwError';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

// Initialize the OpenAI client with the API key. This key is essential for authenticating 
// the requests with OpenAI's API services.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL
});

export async function POST(request: NextRequest) {
  // Logging the start of the image processing API call
  console.log('Starting the image processing API call');

  // Extracting the file (in base64 format) and an optional custom prompt 
  // from the request body. This is essential for processing the image using OpenAI's API.
  const { file: base64Image, prompt: customPrompt } = await request.json();

  // Check if the image file is included in the request. If not, return an error response.
  if (!base64Image) {
    console.error('No file found in the request');
    return NextResponse.json({error: 'No file found in the request'});
  }

  // Log the receipt of the image in base64 format
  console.log('Received image in base64 format');

  // Utilize the provided custom prompt or a default prompt if it's not provided.
  // This prompt guides the analysis of the image by OpenAI's model.
  const promptText = customPrompt || "Analyze and describe the image in detail. Focus on visual elements like colors, object details, people's positions and expressions, and the environment. Transcribe any text as 'Content: “[Text]”', noting font attributes. Aim for a clear, thorough representation of all visual and textual aspects.";

  // Log the chosen prompt
  console.log(`Using prompt: ${promptText}`);

  // Sending the image and prompt to OpenAI for processing. This step is crucial for the image analysis.
  console.log('Sending request to OpenAI');
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            {
              type: "image_url",
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      max_tokens: 200
    });

    // Log the response received from OpenAI, which includes the analysis of the image.
    console.log('Received response from OpenAI');
    console.log('Response:', JSON.stringify(response, null, 2)); // Log the response for debugging

    // Extract and log the analysis from the response
    const analysis = response?.choices[0]?.message?.content;
    console.log('Analysis:', analysis);

    // Return the analysis in the response
    return NextResponse.json({ success: true, analysis: analysis });
  } catch (error) {
    return throwError(error);
  }
}
