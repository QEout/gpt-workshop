import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";
import { throwError } from "@/app/utils/throwError";

export async function POST(req: NextRequest) {
    try {
      const { id } =await req.json()
      if(!id){
        throw new Error("Missing required threadId")
      }
      const thread = await prisma.chatThread.findUnique({
        where: { id }
      })

      return NextResponse.json(thread);
    } catch (error) {
      return throwError(error);
    }
  
}