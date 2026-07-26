import { toast } from '@/components/ui/use-toast';

import { agentConfig } from '@/config/agent-config';

/**
 * Given a transaction description, asks the Chart of Accounts agent to generate a tagging code.
 * @param description The transaction description to generate a tagging code for.
 * @returns The generated tagging code, or an empty string if an error occurs.
 */
export const getTransactionTaggingCode = async (
  description: string,
  prompt?: string,
) => {
  if (description.length === 0) {
    return '';
  }

  const modifiedPrompt =
    prompt ??
    `Generate a chart of accounts code based on the description '${description}' using the provided chart of accounts and the relevant line items. The output should only be in the following JSON format: jsonCopy code{"code":""} Do not include any additional details or explanations in your response.`;

  const { chart_of_accounts_agent } = agentConfig;
  const session_id = Math.floor(10000 + Math.random() * 90000);
  try {
    const params = new URLSearchParams({
      agent_id: chart_of_accounts_agent.agent_id,
      session_id: `${session_id}`,
      agent_alias_id: chart_of_accounts_agent.agent_alias_id,
      prompt: modifiedPrompt,
    });
    const response = await fetch(`/api/bedrock?${params.toString()}`);

    const data = await response.json();
    if (data?.error) {
      return data.error;
    }
    const result = data.data?.completion || '';
    if (result.includes('code')) {
      const extractedObject = JSON.parse(data.data?.completion) || '';
      return extractedObject.code || '';
    } else {
      return '';
    }
  } catch (error) {
    toast({
      title: 'Error',
      description: (error as Error).message || 'An unknown error occurred.',
      variant: 'destructive',
    });
  }
};
