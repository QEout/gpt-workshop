import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";
import { IUpdateWorkshopProjectInput } from "@/app/types";
import { throwError } from "@/app/utils/throwError";

export async function POST(req: NextRequest) {
  try {
    const { id, ...rest }: IUpdateWorkshopProjectInput =
      await req.json();
    const workshopProject = id
      ? await prisma.workshopProject.update({
          where: { id },
          data: rest,
        })
      : await prisma.workshopProject.create({
          data: rest,
        });

    return NextResponse.json(workshopProject);
  } catch (error) {
    return throwError(error);
  }
}
