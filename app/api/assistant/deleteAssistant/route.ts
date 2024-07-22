//delete assistant
import { throwError } from '@/app/utils/throwError';
import { NextRequest, NextResponse } from 'next/server';
import { azureOpenAI } from '../../utils/azureInstance';

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      throw new Error('Missing required assistantId');
    }
    await azureOpenAI.beta.assistants.del(id);
    return NextResponse.json({
      success: true,
      message: `Assistant with ID: ${id} deleted successfully.`,
    });
  } catch (error) {
    return throwError(error);
  }
}
