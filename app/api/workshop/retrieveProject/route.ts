import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";
import { throwError } from "@/app/utils/throwError";

export async function POST(req: NextRequest) {
    try {
      const { id } =await req.json()
      if(!id){
        throw new Error("Missing required ProjectId")
      }
      const project = await prisma.workshopProject.findUnique({
        where: { id }
      })

      return NextResponse.json(project);
    } catch (error) {
      return throwError(error);
    }
}