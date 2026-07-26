import { BedrockAgentRuntimeClient } from '@aws-sdk/client-bedrock-agent-runtime';
import { S3Client } from '@aws-sdk/client-s3';
import { TextractClient } from '@aws-sdk/client-textract';

import {
  FILES3_ACCESS_KEY_ID,
  FILES3_REGION,
  FILES3_SECRET_ACCESS_KEY,
} from '@/config/env-config';

// Common AWS configuration used across all services
// This includes region and credentials needed for AWS authentication
const clientConfig = {
  region: FILES3_REGION as string,
  credentials: {
    accessKeyId: FILES3_ACCESS_KEY_ID as string,
    secretAccessKey: FILES3_SECRET_ACCESS_KEY as string,
  },
};

// Amazon Bedrock client
export const bedrockAgentRuntimeClient = new BedrockAgentRuntimeClient(
  clientConfig,
);

// Amazon S3 client
export const s3Client = new S3Client(clientConfig);

// Amazon Textract client
export const textractClient = new TextractClient(clientConfig);
