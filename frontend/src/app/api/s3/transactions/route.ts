import { NextResponse } from 'next/server';

import { updateCSVInS3 } from '@/lib/s3-bucket';

export async function POST(request: Request) {
  const { transactions, key, updateRecord } = await request.json();

  if (!transactions || !key) {
    return NextResponse.json(
      { error: 'transactions and key are required' },
      { status: 400 },
    );
  }

  try {
    const result = await updateCSVInS3(key, transactions, updateRecord);

    return NextResponse.json({
      message: 'Invoice uploaded successfully',
      data: result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
