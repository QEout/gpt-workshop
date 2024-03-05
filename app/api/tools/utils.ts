import { reading_pro, reading_pro_api } from './reading_pro';
import { suggestion } from './suggestion';
import { AssistantCreateParams } from "openai/resources/beta/assistants/assistants.mjs";
import { web_research_api, web_search } from "./web_research";
import { writing_pro, writing_pro_api } from "./writing_pro";
import OpenAI from 'openai';
import { DataMessage } from 'ai';

export const toolMap: Record<
  string,
  | AssistantCreateParams.AssistantToolsCode
  | AssistantCreateParams.AssistantToolsRetrieval
  | AssistantCreateParams.AssistantToolsFunction
> = {
  retrieval: {
    type: "retrieval",
  },
  web_research: {
    type: "function",
    function: web_search,
  },
  code_interpreter: {
    type: "code_interpreter",
  },
  writing_pro: {
    type: "function",
    function: writing_pro
  },
  reading_pro: {
    type: "function",
    function: reading_pro
  },
  suggestion: {
    type: "function",
    function: suggestion
  }
};

export const tools = [
  {
    name: "代码解释器",
    alias: "code_interpreter",
    description: "解释代码或进行精确数据计算并返回结果。",
  },
  {
    name: "网页搜索",
    alias: "web_research",
    description: "从网络上获取最新事件的信息。",
  },
  {
    name: "知识检索",
    alias: "retrieval",
    description: "从给定的知识源中检索知识。",
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
  }
];

export const setToolOutput=async (
  /**
   * 线程Id
   */
  threadId: string,
   /**
   * 调用的工具函数
   */
   toolCall: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall,
   /**
    * 工具输出，用于给GPT提示
    */
   tool_outputs: OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[],
   /**
    * 工具执行中 向用户发送的数据消息
    */
   sendDataMessage: (message: DataMessage) => void
) => {
  const parameters = JSON.parse(toolCall.function.arguments);
  switch (toolCall.function.name) {
    case "web_research": {
      sendDataMessage({
        role: "data",
        data: {
          type: "tool_call",
          message: `🔍正在搜索 ${parameters.query}...`,
        },
      });
      const output = await web_research_api(parameters);
      //如果是开发环境
      if (process.env.DEBUG === "True") {
        sendDataMessage({
          role: "data",
          data: {
            type: "tool_output",
            message: '✨总结了搜索结果',
            function: toolCall.function.name,
            input: JSON.stringify(parameters),
            output: JSON.stringify(output),
          },
        });
      }
      tool_outputs.push({
        tool_call_id: toolCall.id,
        output: JSON.stringify(output),
      });
      break;
    }

    case "writing_pro": {
      sendDataMessage({
        role: "data",
        data: {
          type: "tool_call",
          message: `📝正在写作...`,
        },
      });
      const output = await writing_pro_api(parameters);
      if(process.env.DEBUG === "True") {
        sendDataMessage({
          role: "data",
          data: {
            type: "tool_output",
            message: '✨生成了写作内容',
            function: toolCall.function.name,
            output: JSON.stringify(output),
          },
        });
      }
      tool_outputs.push({
        tool_call_id: toolCall.id,
        output: 'success for writing'
      });
      break;
    }

    case "reading_pro": {
      sendDataMessage({
        role: "data",
        data: {
          type: "tool_call",
          message: `📖正在阅读...`,
        },
      });
      const output = await reading_pro_api({threadId});
      if(process.env.DEBUG === "True") {
        sendDataMessage({
          role: "data",
          data: {
            type: "tool_output",
            message: '✨获取了阅读内容',
            function: toolCall.function.name,
            output: JSON.stringify(output),
          },
        });
      }
      tool_outputs.push({
        tool_call_id: toolCall.id,
        output: JSON.stringify(output),
      });
      break;
    }
    
    case "suggestion": {
      sendDataMessage({
        role: "data",
        data: {
          type: "tool_call",
          message: `🔍正在生成建议...`,
        },
      });
      const output = parameters.suggestions;
      if(process.env.DEBUG === "True") {
        sendDataMessage({
          role: "data",
          data: {
            type: "tool_output",
            message: '✨生成了建议',
            function: toolCall.function.name,
            output: JSON.stringify(output),
          },
        });
      }
      tool_outputs.push({
        tool_call_id: toolCall.id,
        output: JSON.stringify(output),
      });
      break;
    }

    default:
      throw new Error(
        `Unknown tool call function: ${toolCall.function.name}`
      );
  }
}

export * from './chatUtils'