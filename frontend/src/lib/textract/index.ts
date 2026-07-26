import {
  AnalyzeDocumentCommand,
  AnalyzeDocumentCommandInput,
} from '@aws-sdk/client-textract';

import { textractClient } from '@/config/aws-config';

export const extractTextFromPDF = async (file: File) => {
  try {
    // Convert the file into an array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Set up input for AnalyzeDocumentCommand, passing the file buffer directly in Bytes
    const input: AnalyzeDocumentCommandInput = {
      Document: {
        Bytes: new Uint8Array(arrayBuffer), // File buffer as Bytes
      },
      FeatureTypes: ['TABLES', 'FORMS'], // Specify your desired feature types
    };

    // Create and send the command
    const command = new AnalyzeDocumentCommand(input);
    const response = await textractClient.send(command);

    return response.Blocks; // Return blocks of text or other data as needed
  } catch (error) {
    return error;
  }
};
