'use server';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { writeFileSync } from 'fs';
import path from 'path';

import { s3Client } from '@/config/aws-config';
import { FILES3_BUCKET_NAME } from '@/config/env-config';

export async function getSignedURL(key: string) {
  try {
    const putObjectCommand = new PutObjectCommand({
      Bucket: FILES3_BUCKET_NAME!,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 300, // 5 minutes expiration
    });

    return { success: { url: signedUrl } };
  } catch (error) {
    return {
      error: { message: 'Error generating signed URL', details: error },
    };
  }
}

export const getFileFromS3 = async (key: string): Promise<string> => {
  if (!FILES3_BUCKET_NAME) {
    throw new Error('FILES3_BUCKET_NAME is not defined');
  }

  const command = new GetObjectCommand({
    Bucket: FILES3_BUCKET_NAME,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);

    // Check if the response has a readable stream
    if (!response.Body) {
      throw new Error('No file stream returned from S3');
    }

    // Read the file stream into a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    // Combine the chunks into a single buffer
    const fileBuffer = Buffer.concat(chunks);

    // Save file locally
    const filePath = path.resolve(__dirname, 'downloaded-file.pdf');
    writeFileSync(filePath, fileBuffer);
    return filePath;
  } catch (err) {
    throw new Error(`Failed to fetch CSV from S3: ${err}`);
  }
};
