import { prisma } from "@/prisma/client";

// 和writing_pro结对使用，用于从数据库里获取生成的文章
export const reading_pro = {
  name: "reading_pro",
  //当需要获取当前对话线程生成的文章时，调用该函数
  description: "When you need to get the article generated by the current conversation thread, call this function",
  parameters: {
    type: "object",
    properties: {},
  },
};

export async function reading_pro_api({threadId}:{threadId: string}) {
  try {
    const article = await prisma.chatStage.findFirst({
      where: {
        threadId: threadId
      }
    });
    return article?.content;
  } catch (error) {
    console.error("Error get data from reading_pro_api", error);
    throw new Error("Error get data from reading_pro_api");
  }
}

