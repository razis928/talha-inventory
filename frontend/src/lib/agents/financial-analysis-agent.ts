import { toast } from '@/components/ui/use-toast';

import { agentConfig } from '@/config/agent-config';

/**
 * Given a transaction description, asks the Chart of Accounts agent to generate a tagging code.
 * @param description The transaction description to generate a tagging code for.
 * @returns The generated tagging code, or an empty string if an error occurs.
 */
export const callFinancialAnalysisAgent = async (records) => {
  const modifiedPrompt = `We will provide you with an array of objects in JSON format. Your task is to generate suitable values for the company_name and code fields in each object based on the description field only.

Rules:

Use the description field to derive a concise and professional company_name.
Use the description field to determine an appropriate code based on the complete chart of accounts (COA).
Ensure the code corresponds to the type of transaction described in the description (e.g., income, expense, asset, etc.).
The code should align with the structure of a standard chart of accounts (COA).
Do not modify any other fields or the structure of the objects.
Respond only in JSON format with the exact structure as provided, but with updated values for the company_name and code fields.
Do not include any explanations, comments, or additional text in your response.
Input:

json
Copy code
Input Array:
${JSON.stringify(records, null, 2)}
Expected Output Format:

json
Copy code
[
  {
    "id": "<id>",
    "invoice_date": "<invoice_date>",
    "memo": "<memo>",
    "description": "<description>",
    "amount": "<amount>",
    "account_number": "<account_number>",
    "invoice_number": "<invoice_number>",
    "company_name": "<company_name>",
    "code": "<code>"
  }
]
`;

  const { financial_analysis_agent } = agentConfig;
  const session_id = Math.floor(10000 + Math.random() * 90000);
  try {
    const params = new URLSearchParams({
      agent_id: financial_analysis_agent.agent_id,
      agent_alias_id: financial_analysis_agent.agent_alias_id,
      session_id: `${session_id}`,
      prompt: modifiedPrompt,
    });
    const response = await fetch(`/api/bedrock?${params.toString()}`);

    const data = await response.json();
    if (data?.error) {
      return data.error;
    }
    const result = data.data?.completion || '';
    return result;
  } catch (error) {
    toast({
      title: 'Error',
      description: (error as Error).message || 'An unknown error occurred.',
      variant: 'destructive',
    });
  }
  return '';
};
