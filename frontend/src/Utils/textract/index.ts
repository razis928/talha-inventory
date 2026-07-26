import { format, isValid } from 'date-fns';

import { ClientForm, LineItem } from '@/types/client';
import { ExtractedKeys, ExtractedLineItems } from '@/types/textract';
import { VendorForm } from '@/types/vendor';

export const getExtractedValues = (input: ExtractedKeys) => {
  const clientForm: Partial<ClientForm> = {} as ClientForm;
  const vendorForm: Partial<VendorForm> = {} as VendorForm;

  Object.keys(input).forEach((key) => {
    const value =
      typeof input[key as keyof ExtractedKeys] === 'string'
        ? input[key as keyof ExtractedKeys].toString().replace(/\n/g, ', ')
        : input[key as keyof ExtractedKeys];

    let parsedDate: Date | null = null;
    switch (key) {
      case 'RECEIVER_NAME':
        clientForm.company_name = value as string;
        break;
      case 'VENDOR_NAME':
        vendorForm.company_name = value as string;
        break;
      case 'RECEIVER_ADDRESS':
        clientForm.address_1 = value as string;
        break;
      case 'VENDOR_ADDRESS':
        vendorForm.address_1 = value as string;
        break;
      case 'RECEIVER_PHONE':
        clientForm.phone = value as string;
        break;
      case 'VENDOR_PHONE':
        vendorForm.phone = value as string;
        break;
      case 'ADDRESS':
        clientForm.address_2 = value as string;
        vendorForm.address_2 = value as string;
        break;
      case 'TAX':
        clientForm.tax = value as string;
        vendorForm.tax = value as string;
        break;
      case 'TAX_PAYER_ID':
        clientForm.tax_payer_id = value as string;
        vendorForm.tax_payer_id = value as string;
        break;
      case 'PAYMENT_TERMS':
        clientForm.payment_term = value as string;
        vendorForm.payment_term = value as string;
        break;
      case 'ACCOUNT_NUMBER':
        clientForm.account_number = value as string;
        vendorForm.account_number = value as string;
        break;
      case 'INVOICE_RECEIPT_ID':
        clientForm.invoice_number = value as string;
        vendorForm.invoice_number = value as string;
        break;
      case 'NAME':
        clientForm.contact_name = value as string;
        vendorForm.contact_name = value as string;
        break;
      case 'TOTAL':
        clientForm.amount = parseAmount(value as string) as string;
        vendorForm.amount = parseAmount(value as string) as string;
        break;
      case 'DUE_DATE':
        parsedDate = new Date(value as string);
        if (isValid(parsedDate)) {
          clientForm.due_date = format(parsedDate, 'yyyy-MM-dd');
          vendorForm.due_date = format(parsedDate, 'yyyy-MM-dd');
        } else {
          clientForm.due_date = '';
          vendorForm.due_date = '';
        }
        break;
      case 'INVOICE_RECEIPT_DATE':
        parsedDate = new Date(value as string);
        if (isValid(parsedDate)) {
          clientForm.invoice_date = format(parsedDate, 'yyyy-MM-dd');
          vendorForm.invoice_date = format(parsedDate, 'yyyy-MM-dd');
        } else {
          clientForm.invoice_date = '';
          vendorForm.invoice_date = '';
        }
        break;
      case 'LINE_ITEMS':
        clientForm.line_items = getLineItems(value as ExtractedLineItems[]);
        vendorForm.line_items = getLineItems(value as ExtractedLineItems[]);
        break;
      default:
        // Handle any other cases
        break;
    }
  });
  return { clientForm, vendorForm };
};

function getLineItems(line_items: ExtractedLineItems[]) {
  return (line_items as ExtractedLineItems[])?.map((item) => ({
    item: item.PRODUCT_CODE || '',
    description: item.ITEM || '',
    qty: item.QUANTITY || '',
    unitPrice: item.UNIT_PRICE || '',
    amount: item.PRICE || '',
  })) as unknown as LineItem[];
}

/**
 * Cleans the input amount string and returns a valid number.
 *
 * This function removes any non-numeric characters (like dollar signs, commas)
 * from the input string and then converts it to a number.
 *
 * @param amount - The amount as a string, possibly including symbols like '$' or ','.
 * @returns The cleaned amount as a valid number.
 */
export const parseAmount = (amount: string): string => {
  // Remove non-numeric characters except for the decimal point
  const cleanedAmount = amount?.replace(/[^0-9.-]+/g, '');

  // Convert the cleaned string into a number
  const parsedAmount = parseFloat(cleanedAmount);

  // If the parsed value is NaN, return 0 (or handle it as needed)
  if (isNaN(parsedAmount)) {
    return '';
  }

  return parsedAmount.toString();
};
