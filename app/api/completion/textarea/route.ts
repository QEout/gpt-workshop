import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL!,
});

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { prompt } = await req.json();

  // Request the OpenAI API for the response based on the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    // a precise prompt is important for the AI to reply with the correct tokens
    messages: [
      {
        role: "system",
        content:"你正在跟AI助手对话。请根据AI助手的上下文，提出问题或给出回答。例如AI助手问：'你的期望薪资是什么？', 你可以回答：'30k-40k'。AI助手说：'这个薪资对于初级前端工程师有点高'。你可以提问：'初级前端的一般薪资是多少||初级前端掌握哪些技能可以提高薪资'。请注意：你的问题应该是一到五个，且多个问题用'||'分隔。"
      },
      {
        role: 'user',
        content:'AI助手的上下文：'+prompt
      }
    ],
    max_tokens: 200,
    temperature: 0, // you want absolute certainty for spell check
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
