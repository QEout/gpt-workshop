import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";
import { IUpdateChatThreadInput } from "@/app/types";
import { throwError } from "@/app/utils/throwError";

export async function POST(req: NextRequest) {
  try {
    const { id, ...rest }: IUpdateChatThreadInput = await req.json();
    const thread = id
      ? await prisma.chatThread.update({
          where: { id },
          data: rest as any,
        })
      : await prisma.chatThread.create({
          data: rest as any,
        });

    return NextResponse.json(thread);
  } catch (error) {
    return throwError(error);
  }
}
