import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";
import { throwError } from "@/app/utils/throwError";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    try {
      const { id } =await req.json()
      if(!id){
        throw new Error("Missing required assistantId")
      }
      await prisma.chatAssistant.delete({
        where: { id }
      })

      return NextResponse.json({
        message: "Assistant deleted successfully",
      });
    } catch (error) {
      return throwError(error);
    }
  }
}