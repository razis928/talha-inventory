// pages/api/bedrockAgent.ts
import {
  InvokeAgentCommand,
  InvokeAgentCommandOutput,
} from '@aws-sdk/client-bedrock-agent-runtime';
import { File } from 'buffer';
import { NextResponse } from 'next/server';

import { bedrockAgentRuntimeClient } from '@/config/aws-config';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const agent_id = url.searchParams.get('agent_id') as string;
  const agent_alias_id = url.searchParams.get('agent_alias_id') as string;
  const userPrompt = url.searchParams.get('prompt') as string;
  const sessionId = (url.searchParams.get('session_id') || '14325') as string;
  const companyName = 'Tesla Inc';
  const prompt =
    userPrompt ||
    `Retrieve or generate a company code for ${companyName} and return the response as a JSON object in the following format: json Copy code { "tagging_id": "", "industry": "", "description": "" } Requirements: If a company code for ${companyName} exists: Retrieve and return the corresponding tagging_id, industry, and description. If no company code exists: Generate a new tagging_id using the NAICS standard codes. Populate the industry and description fields based on the assigned NAICS code. Notes: Ensure the response contains only the JSON object. All fields must be non-empty and adhere to the NAICS classification system`;
  const agentId = agent_id || 'T5VHTDNLI7';
  const agentAliasId = agent_alias_id || 'NHUCC5SJ9S';

  try {
    const result = await invokeBedrockAgent({
      prompt,
      agentId,
      agentAliasId,
      sessionId: sessionId,
    });

    return NextResponse.json({
      message: 'Flow has been invoked successfully',
      data: result,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

/**
 * Invokes a Bedrock agent to run an inference using the input
 * provided in the request body.
 *
 * @param {string} prompt - The prompt that you want the Agent to complete.
 * @param {string} sessionId - An arbitrary identifier for the session.
 */
const invokeBedrockAgent = async ({
  agentId,
  agentAliasId,
  prompt,
  sessionId,
  document,
}: {
  agentId: string;
  agentAliasId: string;
  prompt: string;
  sessionId: string;
  document?: File;
}) => {
  let byteContent: Uint8Array | undefined;

  // If document exists, convert it to byte content
  if (document) {
    const fileArrayBuffer = await document.arrayBuffer();
    byteContent = new Uint8Array(fileArrayBuffer);
  }

  const command: InvokeAgentCommand = new InvokeAgentCommand({
    agentId,
    agentAliasId,
    sessionId,
    inputText: prompt,
    sessionState: document
      ? {
          files: [
            {
              name: document.name,
              source: {
                sourceType: 'BYTE_CONTENT',
                byteContent: {
                  mediaType: document.type,
                  data: byteContent,
                },
              },
              useCase: 'CHAT',
            },
          ],
        }
      : undefined,
  });

  try {
    let completion = '';
    const response: InvokeAgentCommandOutput =
      await bedrockAgentRuntimeClient.send(command);

    if (response.completion === undefined) {
      throw new Error('Completion is undefined');
    }

    for await (const chunkEvent of response.completion) {
      const chunk = chunkEvent.chunk;
      const decodedResponse = new TextDecoder('utf-8').decode(chunk?.bytes);
      completion += decodedResponse;
    }

    return { sessionId: sessionId, completion };
  } catch (err) {
    throw new Error((err as Error).message);
  }
};

export async function POST(req: Request) {
  const formData = await req.formData();

  // Get file and fields
  const file = formData.get('file') as File | null;
  const prompt = (formData.get('prompt') || '') as string;
  const agentId = (formData.get('agent_id') || '') as string;
  const agentAliasId = (formData.get('agent_alias_id') || '') as string;
  const sessionId = `${Math.floor(10000 + Math.random() * 90000)}`;

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  try {
    const result = await invokeBedrockAgent({
      prompt,
      agentId,
      agentAliasId,
      sessionId,
      document: file ?? undefined,
    });

    return NextResponse.json({
      message: 'Flow has been invoked successfully',
      data: result,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
