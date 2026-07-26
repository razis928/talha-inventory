import Stripe from 'stripe';

import { generateCSV } from '@/utils/stripe/csv-templates/generate-csv';

export async function generateAccountTransactionsCSV(
  data: Stripe.FinancialConnections.Transaction[],
) {
  const formatedData = data.map((row) => {
    const formattedAmount = formatTransactionsAmount({
      amount: row.amount,
      isInCents: true,
    });

    // If the formatted amount is a valid number, we can use it
    const amountToStore = isNaN(+formattedAmount.replace(/[^0-9.-]+/g, ''))
      ? formattedAmount
      : +formattedAmount.replace(/[^0-9.-]+/g, '');
    return {
      id: row.id,
      account_number: row.account,
      amount: amountToStore.toString(),
      currency: row.currency,
      description: row.description,
      livemode: row.livemode,
      status: row.status,
      transacted_at: row.transacted_at,
      invoice_date: row.transacted_at,
      company_name: '',
      phone: '',
      address_1: '',
      address_2: '',
      email: '',
      contact_name: '',
      invoice_number: '',
      due_date: '',
      payment_term: '',
      line_items: '',
      tax: '',
      tax_payer_id: '',
      memo: '',
    };
  });
  const generatedCSV = await generateCSV(formatedData);

  return generatedCSV;
}

interface FormatTransactionsAmountOptions {
  amount: number | string;
  currency?: string;
  isInCents?: boolean;
}

export function formatTransactionsAmount({
  amount,
  currency,
  isInCents = false,
}: FormatTransactionsAmountOptions): string {
  let amountInDollars: number;

  if (typeof amount === 'string') {
    const sanitizedAmount = amount.replace(/,/g, '');
    amountInDollars = parseFloat(sanitizedAmount);
  } else {
    amountInDollars = amount;
  }

  // Convert from cents to dollars if the flag is set
  if (isInCents) {
    amountInDollars /= 100;
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInDollars);

  if (currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amountInDollars);
  }

  return formattedAmount;
}

export const unformatCurrency = (formatted: string): number => {
  // Remove the dollar sign and any whitespace
  const cleaned = formatted.replace(/[$\s]/g, '');

  // Convert to number, handling negative values
  const numberValue = parseFloat(cleaned);

  // Return the number value
  return isNaN(numberValue) ? 0 : numberValue; // Return 0 if NaN
};
