import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";
import { throwError } from "@/app/utils/throwError";

export async function POST(req: NextRequest) {
    try {
      const { page=1,limit=10 } =await req.json()
      console.log(limit)
      const assistants = await prisma.chatAssistant.findMany({
        take: limit,
        skip: (page-1)*limit
      })
      console.log(assistants)
      return NextResponse.json(assistants);
    } catch (error) {
      return throwError(error);
    }
}