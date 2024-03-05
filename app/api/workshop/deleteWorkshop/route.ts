import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";
import { throwError } from "@/app/utils/throwError";

export async function POST(req: NextRequest) {
    try {
      const { id } =await req.json()
      if(!id){
        throw new Error("Missing required ProjectId")
      }
      const workshop = await prisma.workshop.delete({
        where: { id }
      })

      return NextResponse.json({
        success: true,
        id: workshop.id
      });
    } catch (error) {
      return throwError(error);
    }
}