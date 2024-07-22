import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma/client';
import { throwError } from '@/app/utils/throwError';

export async function POST(req: NextRequest) {
  try {
    const { page = 1, limit = 10 } = await req.json();
    console.log(page, limit)
    const workshop = await prisma.workshop.findMany({
      take: limit,
      skip: (page - 1) * limit,
    });
    return NextResponse.json(workshop);
  } catch (error) {
    return throwError(error);
  }
}
