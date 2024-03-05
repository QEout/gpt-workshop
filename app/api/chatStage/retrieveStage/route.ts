//retrieve
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { throwError } from "@/app/utils/throwError";
import { IUpdateChatStageInput } from "@/app/types";

export async function POST(req: NextRequest) {
  try {
    const { assistantId, threadId }: IUpdateChatStageInput = await req.json();
    if (!assistantId || !threadId) {
      throw new Error("Missing required assistantId");
    }
    const stage = await prisma.chatStage.findFirst({
      where: {
        assistantId: assistantId,
        threadId: threadId,
      },
    });
    if (!stage) {
      //创建一个新的stage
      const newStage = await prisma.chatStage.create({
        data: {
          assistantId: assistantId,
          threadId: threadId,
        },
      });
      return NextResponse.json(newStage);
    }
    return NextResponse.json(stage);
  } catch (error) {
    return throwError(error);
  }
}
