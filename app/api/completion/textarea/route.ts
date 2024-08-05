import { streamText } from 'ai';
import { azureProvider } from '../../utils/azureInstance';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const result = await streamText({
    model: azureProvider('gpt-35-turbo-16k'),
    prompt: `你正在跟AI助手对话。请根据AI助手的上下文，提出问题或给出回答。例如AI助手问：'你的期望薪资是什么？', 你可以回答：'30k-40k'。AI助手说：'这个薪资对于初级前端工程师有点高'。你可以提问：'初级前端的一般薪资是多少||初级前端掌握哪些技能可以提高薪资'。请注意：你的问题应该是一到五个，且多个问题用'||'分隔。
AI助手的上下文：${prompt}
    `,
  });

  return result.toAIStreamResponse();
}
