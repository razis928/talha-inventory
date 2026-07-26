import { getTransactionTaggingCode } from '@/lib/agents/get-chart-of-account';
import { getCompanyTaggingCode } from '@/lib/agents/get-tagging-code';

import { toast } from '@/components/ui/use-toast';

import { getExtractedValues } from '@/utils/textract';

import { ClientForm } from '@/types/client';
import { ExtractedKeys } from '@/types/textract';
import { VendorForm } from '@/types/vendor';

export const extractFormFromDocument = async (
  file: File,
): Promise<{
  clientForm: Partial<ClientForm>;
  vendorForm: Partial<VendorForm>;
  data: Partial<ExtractedKeys>;
}> => {
  try {
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', file); // Append the file to the FormData object

    // Send the form data to the API
    const response = await fetch('/api/textract', {
      method: 'POST',
      body: formData, // Set the body to the FormData object
    });

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error);
    }

    // Parse the JSON response
    const result = (await response.json()) as {
      data: ExtractedKeys;
    };

    const { clientForm, vendorForm } = getExtractedValues(result.data);

    const lineItemsDescriptions = vendorForm.line_items
      ?.map((item) => item.description.replace(/\n/g, ', '))
      .join(', ');

    const [company_tagging_id, invoice_tagging_id] = await Promise.all([
      getCompanyTaggingCode(clientForm.company_name || ''),
      getTransactionTaggingCode(lineItemsDescriptions || ''),
    ]);

    return {
      clientForm: {
        ...clientForm,
        company_tagging_id: company_tagging_id || '',
        invoice_tagging_id: invoice_tagging_id || '',
      },
      vendorForm: {
        ...vendorForm,
        company_tagging_id,
        invoice_tagging_id,
      },
      data: result.data,
    };
  } catch (error) {
    toast({
      title: 'Error',
      description: (error as Error).message || 'An unknown error occurred.',
      variant: 'destructive',
    });
    return {
      clientForm: {},
      vendorForm: {},
      data: {},
    };
  }
};
