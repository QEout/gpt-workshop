import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { throwError } from "@/app/utils/throwError";

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      throw new Error("Missing required stage parameters");
    }
    // 删除stage
    const stage = await prisma.chatStage.delete({
      where: {
        id,
      },
    });
    return NextResponse.json(stage);
  } catch (error) {
    return throwError(error);
  }
}
