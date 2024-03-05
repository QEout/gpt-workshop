import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { IUpdateChatStageInput } from "@/app/types";
import { throwError } from "@/app/utils/throwError";

export async function POST(req: NextRequest) {
  try {
    const { id, ...rest }: IUpdateChatStageInput = await req.json();
    if (!id) {
      throw new Error("Missing required stage parameters");
    }

    const newStage = await prisma.chatStage.update({
      where: {
        id,
      },
      data: rest,
    });
    return NextResponse.json(newStage);
  } catch (error) {
    return throwError(error);
  }
}
