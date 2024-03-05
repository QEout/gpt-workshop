import { reading_pro, reading_pro_api } from "./reading_pro";
import { suggestion } from "./suggestion";
import { AssistantCreateParams } from "openai/resources/beta/assistants/assistants.mjs";
import { web_research_api, web_search } from "./web_research";
import { writing_pro, writing_pro_api } from "./writing_pro";
import OpenAI from "openai";
import {
  CreateMessage,
  DataMessage,
  JSONValue,
  ToolCallPayload,
  experimental_StreamData,
} from "ai";

export const chatToolMap: Record<
  string,
  OpenAI.Chat.Completions.ChatCompletionTool
> = {
  web_research: {
    type: "function",
    function: web_search,
  },
  writing_pro: {
    type: "function",
    function: writing_pro,
  },
  reading_pro: {
    type: "function",
    function: reading_pro,
  },
  suggestion: {
    type: "function",
    function: suggestion,
  },
};

export const chatTools = [
  {
    name: "网页搜索",
    alias: "web_research",
    description: "从网络上获取最新事件的信息。",
  },
  {
    name: "写作助手",
    alias: "writing_pro",
    description: "写作大师。",
  },
  {
    name: "阅读助手",
    alias: "reading_pro",
    description: "阅读文章（建议和写作助手配对使用）。",
  },
  {
    name: "快捷输入建议",
    alias: "suggestion",
    description: "为用户的输入框提供快捷输入建议。",
  },
];

export const setChatToolOutput = async (
  data: experimental_StreamData,
  /**
   * 调用的工具函数
   */
  toolCall: ToolCallPayload["tools"][0],

  /**
   * 工具输出，用于给GPT提示
   */
  tool_outputs: CreateMessage[],
  /**
   * 工具执行中 向用户发送的数据消息
   */
  appendToolCallMessage: (
    result?:
      | {
          tool_call_id: string;
          function_name: string;
          tool_call_result: JSONValue;
        }
      | undefined
  ) => CreateMessage[]
) => {
  const parameters = JSON.parse(toolCall.func.arguments as any);

  let newMessages: CreateMessage[] = [];
  let output: JSONValue | undefined;
  let dataMsg=''
  switch (toolCall.func.name) {
    case "web_research":
      output = await web_research_api(parameters);
      dataMsg='✨总结了搜索结果'
      break;
    case "writing_pro":
      output = await writing_pro_api(parameters);
      dataMsg='✨生成了写作内容'
      break;
    case "reading_pro":
      output = await reading_pro_api(parameters);
      dataMsg='✨获取了阅读内容'
      break;
    case "suggestion":
      output = parameters.suggestions;
      dataMsg='✨生成了输入建议'
      break;

    default:
      throw new Error(`Unknown tool call function: ${toolCall.func.name}`);
  }
  newMessages = appendToolCallMessage({
    tool_call_id: toolCall.id,
    function_name: toolCall.func.name,
    tool_call_result: JSON.stringify(output),
  });
  data.append({
    role: "data",
    data: {
      type: "tool_output",
      message: dataMsg,
      function: toolCall.func.name,
      input: JSON.stringify(parameters),
      output: JSON.stringify(output),
    },
    createdAt: new Date().toISOString(),
  } as any);
  tool_outputs.push(...newMessages);
};
