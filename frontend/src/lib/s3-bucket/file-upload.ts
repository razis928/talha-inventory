import { PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

import { getSignedURL } from '@/lib/s3-bucket/signed-url';

import { toast } from '@/components/ui/use-toast';

import { s3Client } from '@/config/aws-config';
import { FILES3_BUCKET_NAME } from '@/config/env-config';

/**
 * Upload a file to an S3 bucket.
 * @param {{ key: string, filePath: File }}
 * @returns {Promise<string>} The signed URL of the uploaded file.
 */
export const uploadFile = async ({
  key,
  filePath,
}: {
  key: string;
  filePath: File | null;
}): Promise<string | null | undefined> => {
  if (!filePath) {
    toast({
      title: 'Null file passed to uploadFile',
      variant: 'destructive',
    });
    return null;
  }

  // Create a PutObjectCommand and set the Bucket, Key, and Body
  const command = new PutObjectCommand({
    Bucket: FILES3_BUCKET_NAME,
    Key: key,
    Body: filePath,
  });

  try {
    // Send the command to the S3 client
    await s3Client.send(command);
    // Generate a signed URL for the uploaded file
    const url = await getSignedURL(key);

    if (url.error) {
      // If there was an error, toast the error message
      toast({ title: url.error.message, variant: 'destructive' });
      return null;
    }
    // Return the signed URL
    return url.success.url;
  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === 'EntityTooLarge'
    ) {
      // If the error is an EntityTooLarge, log the error
      throw new Error(
        `Error from S3 while uploading object to ${FILES3_BUCKET_NAME}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`,
      );
    } else if (caught instanceof S3ServiceException) {
      // If the error is an S3ServiceException, log the error
      throw new Error(
        `Error from S3 while uploading object to ${FILES3_BUCKET_NAME}.  ${caught.name}: ${caught.message}`,
      );
    } else {
      // If the error is not an S3ServiceException, rethrow it
      throw caught;
    }
  }
};

// New function to delete a file from S3
export const deleteS3File = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: FILES3_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (caught) {
    if (caught instanceof S3ServiceException) {
      throw new Error(
        `Error from S3 while deleting object from ${FILES3_BUCKET_NAME}. ${caught.name}: ${caught.message}`,
      );
    } else {
      throw caught;
    }
  }
};
