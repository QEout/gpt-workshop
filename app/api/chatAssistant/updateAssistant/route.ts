import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";
import { IUpdateChatAssistantInput } from "@/app/types";
import { throwError } from "@/app/utils/throwError";

export async function POST(req: NextRequest) {
  try {
    const { id, ...rest }: IUpdateChatAssistantInput =
      await req.json();
    const assistant = id
      ? await prisma.chatAssistant.update({
          where: { id },
          data: rest,
        })
      : await prisma.chatAssistant.create({
          data: rest,
        });

    return NextResponse.json(assistant);
  } catch (error) {
    return throwError(error);
  }
}
