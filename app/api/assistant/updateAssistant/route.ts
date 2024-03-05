import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

import { AssistantCreateParams } from "openai/resources/beta/assistants/assistants.mjs";
import { IUpdateAssistantInput } from "@/app/types";
import { toolMap } from "../../tools/utils";
import { throwError } from "@/app/utils/throwError";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const { id, name, model, instructions, toolNames, fileIds } =
      (await req.json()) as IUpdateAssistantInput;

    if (!name || !model || !instructions) {
      throw new Error("Missing required assistant parameters");
    }
    const tools: AssistantCreateParams["tools"] = [];
    // 添加工具
    for (const toolName of toolNames) {
      const tool = toolMap[toolName];
      if (tool) {
        tools.push(tool);
      }
    }
    const assistantOptions: OpenAI.Beta.AssistantCreateParams = {
      name,
      instructions,
      model,
      tools,
    };
    if (fileIds) {
      assistantOptions.file_ids = fileIds;
    }

    const assistant = id
      ? await openai.beta.assistants.update(id, assistantOptions)
      : await openai.beta.assistants.create(assistantOptions);
    return NextResponse.json(assistant);
  } catch (error) {
    return throwError(error);
  }
}
