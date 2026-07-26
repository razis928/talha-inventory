import { NextResponse } from 'next/server';

import { sendEmail } from '@/lib/sendEmail';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { subject, message, to } = await req.json();
  try {
    await sendEmail({
      message,
      subject,
      to,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: `Failed to send Email: ${error.message}`,
          details: error,
        },
        { status: 500 },
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to Send Email', details: error },
        { status: 500 },
      );
    }
  }
}
