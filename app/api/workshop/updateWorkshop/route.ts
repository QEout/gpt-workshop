import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";
import { IUpdateWorkshopInput } from "@/app/types";
import { throwError } from "@/app/utils/throwError";

export async function POST(req: NextRequest) {
  try {
    const { id, ...rest }: IUpdateWorkshopInput =
      await req.json();
    const workshop = id
      ? await prisma.workshop.update({
          where: { id },
          data: rest,
        })
      : await prisma.workshop.create({
          data: rest,
        });

    return NextResponse.json(workshop);
  } catch (error) {
    return throwError(error);
  }
}
