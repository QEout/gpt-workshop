import { IUpdateChatAssistantInput } from '@/app/types';
import { OpenAI } from "openai";
import { CreateMessage, OpenAIStream, StreamingTextResponse, experimental_StreamData } from "ai";

import { NextRequest } from "next/server";
import { chatToolMap, setChatToolOutput } from "../../tools/utils";
import { checkRateLimit } from "@/app/utils/checkRateLimit";
import { Message } from "ai/react";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const runtime = "edge";

export async function POST(req: NextRequest) {
  if (checkRateLimit) {
    const rateLimitResponse = await checkRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }
  const { messages, name, model, instructions, temperature, toolNames } =
    await req.json() as IUpdateChatAssistantInput & { messages: Message[] };

  let finalMessages:any = messages.map(({ id, ...message }) => message);

  const systemMessage = {
    role: "system",
    content: instructions,
  };
  finalMessages = [systemMessage, ...finalMessages];

  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
  // 添加工具
  for (const toolName of toolNames) {
    const tool = chatToolMap[toolName];
    if (tool) {
      tools.push(tool);
    }
  }
  // check if the conversation requires a function call to be made
  const initialResponse = await openai.chat.completions.create({
    model,
    messages: finalMessages,
    stream: true,
    tool_choice: "auto",
    tools: tools,
    temperature,
  });
  //console.log('Initial response:', initialResponse);
  const data = new experimental_StreamData();
  const stream = OpenAIStream(initialResponse, {
    experimental_onToolCall: async ({ tools }, appendToolCallMessage) => {
      const toolMessages:CreateMessage[]=[]
      for (const tool of tools) {
        await setChatToolOutput(
          data,
          tool,
          toolMessages,
          appendToolCallMessage
        );
      }
      return openai.chat.completions.create({
        model,
        messages: [...finalMessages, ...toolMessages],
        stream: true,
      });
    },
    onFinal() {
      // IMPORTANT! you must close StreamData manually or the response will never finish.
      data.close();
    },
    // IMPORTANT! until this is stable, you must explicitly opt in to supporting streamData.
    experimental_streamData: true,
  });

  return new StreamingTextResponse(stream,{},data);
}
