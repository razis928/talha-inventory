import { NextResponse } from 'next/server';

import { uploadFile } from '@/lib/s3-bucket/file-upload';

export async function POST(request: Request) {
  try {
    // Parse the form data from the request
    const formData = await request.formData();
    // Assuming you are uploading a file with the name 'file'
    const file = formData.get('file') as File; // Cast to File if needed
    const keypath = formData.get('keyPath') as string; // Cast to File if needed
    const buffer = await file.arrayBuffer();
    await uploadFile({
      key: keypath,
      filePath: buffer as unknown as File,
    });

    return NextResponse.json({ message: 'File uploaded successfully' });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
