import { IUpdateChatAssistantInput } from '@/app/types';
import { OpenAI } from 'openai';
import {
  CreateMessage,
  StreamData,
  StreamingTextResponse,
  streamText,
} from 'ai';

import { NextRequest } from 'next/server';
import { chatToolMap, setChatToolOutput } from '../../tools/utils';
import { checkRateLimit } from '@/app/utils/checkRateLimit';
import { Message } from 'ai/react';
import { azureProvider } from '~/api/utils/azureInstance';

export async function POST(req: NextRequest) {
  if (checkRateLimit) {
    const rateLimitResponse = await checkRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }
  const { messages, name, model, instructions, temperature, toolNames } =
    (await req.json()) as IUpdateChatAssistantInput & { messages: Message[] };

  const azureModel = azureProvider('gpt-4o');

  let finalMessages: any = messages.map(({ id, ...message }) => message);

  const systemMessage = {
    role: 'system',
    content: instructions ?? 'HR Assistant',
  };
  finalMessages = [systemMessage, ...finalMessages];

  //tools：{ xxx1:
  // 添加工具
  // for (const toolName of toolNames) {
  //   const tool = chatToolMap[toolName];
  //   if (tool) {
  //     tools.push(tool);
  //   }
  // }
  // check if the conversation requires a function call to be made
  // const initialResponse = await model.chat.completions.create({
  //   model,
  //   messages: finalMessages,
  //   stream: true,
  //   tool_choice: "auto",
  //   tools: tools,
  //   temperature,
  // });
  const initialResponse = await streamText({
    model: azureModel,
    messages: finalMessages,
    toolChoice: 'auto',
    // tools: tools,

    temperature,
  });
  //console.log('Initial response:', initialResponse);
  const data = new StreamData();
  // const stream =new streamText(initialResponse, {
  //   experimental_onToolCall: async ({ tools }, appendToolCallMessage) => {
  //     const toolMessages:CreateMessage[]=[]
  //     for (const tool of tools) {
  //       await setChatToolOutput(
  //         data,
  //         tool,
  //         toolMessages,
  //         appendToolCallMessage
  //       );
  //     }
  //     return openai.chat.completions.create({
  //       model,
  //       messages: [...finalMessages, ...toolMessages],
  //       stream: true,
  //     });
  //   },
  //   onFinal() {
  //     // IMPORTANT! you must close StreamData manually or the response will never finish.
  //     data.close();
  //   },
  // IMPORTANT! until this is stable, you must explicitly opt in to supporting streamData.
  //   experimental_streamData: true,
  // });
  // const stream=initialResponse.toAIStream({
  //   onFinal() {
  //      data.close();
  //   },
  // }

  // );

  return initialResponse.toAIStreamResponse();
}
