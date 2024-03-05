import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";
import { throwError } from "@/app/utils/throwError";

export async function POST(req: NextRequest) {
    try {
      const { id } =await req.json()
      if(!id){
        throw new Error("Missing required assistantId")
      }
      const workshop = await prisma.workshop.findUnique({
        where: { id }
      })

      return NextResponse.json(workshop);
    } catch (error) {
      return throwError(error);
    }
}