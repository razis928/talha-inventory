import { getCompanyCode } from '@/lib/supabase/company';
import { addNewCompanyCode } from '@/lib/supabase/company-code';

import { toast } from '@/components/ui/use-toast';

import { agentConfig } from '@/config/agent-config';

/**
 * Given a company name, returns the tagging code for the company if it exists in
 * the database. If the company is not found, generates a new tagging code in the
 * same format as the existing codes in the dataset and returns it.
 * @param companyName The name of the company to look up.
 * @returns The tagging code for the company if it exists, or a new tagging code if
 * it does not exist.
 */
export const getCompanyTaggingCode = async (companyName: string) => {
  if (companyName.length === 0) {
    return '';
  }
  const modifiedPrompt = `We need to generate a tagging code for the company "${companyName}" based on the available data. If the company exists in the database, return the corresponding tagging code. If the company is not found, please generate a new tagging code in the same format as the existing codes in the dataset.\n\nHere is the format:\n- Each code should follow the pattern PCU<industry_code>-<serial_number>.\n- The tagging code should be derived based on the industry category the company falls under. The industries in the dataset cover a broad range of sectors, and you should identify the most appropriate industry for the company.\n- Please generate a new code if the company is not found in the database, maintaining the serial numbering system.\n\nProvide a JSON response with only the "tagging_code" field as shown below:json\n{"tagging_code": "PCU1111-001"}.Ensure that the generated tagging code follows the same structure as the codes found in the dataset.`;

  const tagging_id = await getCompanyCode(companyName);

  if (tagging_id) {
    return tagging_id;
  }

  const { tagging_system_company_code_data } = agentConfig;
  try {
    const params = new URLSearchParams({
      agent_id: tagging_system_company_code_data.agent_id,
      agent_alias_id: tagging_system_company_code_data.agent_alias_id,
      prompt: modifiedPrompt,
    });
    const response = await fetch(`/api/bedrock?${params.toString()}`);

    const data = await response.json();
    if (data?.error) {
      return data.error;
    }
    const result = data.data?.completion || '';
    if (result.includes('tagging_code')) {
      const extractedObject = JSON.parse(data.data?.completion) || '';
      if (extractedObject.tagging_code) {
        await addNewCompanyCode({
          code: extractedObject.tagging_code,
          short_description: companyName,
          long_description: '',
        });
      }
      return extractedObject.tagging_code || '';
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
