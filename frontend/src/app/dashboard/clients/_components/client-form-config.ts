import { z } from 'zod';

export const ClientFormSchema = z.object({
  company_name: z.string().min(2, {
    message: 'Client Company Name must be at least 2 characters.',
  }),
  address_1: z.string().min(1, { message: 'Address 1 is required.' }),
  address_2: z.string().optional(),
  payment_term: z.string().optional(),
  contact_name: z.string().optional(),
  tax: z.string().optional(),
  line_items: z
    .array(
      z.object({
        item: z.string().optional().default(''),
        description: z.string().optional().default(''),
        qty: z
          .preprocess((val) => parseFloat(val as string), z.number())
          .default(1),
        unitPrice: z.string().optional().default(''),
        amount: z.string().optional().default(''),
      }),
    )
    .optional()
    .default([]),
  company_invoice: z.instanceof(File).optional(),
  phone: z.string().min(1, { message: 'Phone Number is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  tax_payer_id: z.string().min(1, { message: 'Tax Payer ID is required.' }),
  account_number: z.string().min(1, { message: 'Account Number is required.' }),
  invoice_date: z.string().min(1, { message: 'Invoice Date is required.' }),
  due_date: z.string().min(1, { message: 'Due Date is required.' }),
  invoice_number: z.string().min(1, { message: 'Invoice_number is required.' }),
  amount: z.string().min(1, { message: 'Amount is required.' }),
  company_tagging_id: z
    .string()
    .min(1, { message: 'Company Tagging Id is required.' }),
  invoice_tagging_id: z
    .string()
    .min(1, { message: 'Transaction Tagging Id is required.' }),
});

export const clientFormFields = [
  {
    id: 'company_name',
    label: ' Client Company Name',
    type: 'text',
  },
  {
    id: 'company_invoice',
    label: 'Update Company Information',
    type: 'file',
    // accept: '.pdf',
  },
  { id: 'address_1', label: 'Address 1', type: 'text' },
  { id: 'address_2', label: 'Address 2', type: 'text' },
  { id: 'phone', label: 'Phone Number', type: 'tel' },
  { id: 'email', label: 'Email Address', type: 'email' },
  { id: 'payment_term', label: 'Payment Term', type: 'text' },
  { id: 'tax_payer_id', label: 'Tax Payer ID', type: 'text' },
  { id: 'tax', label: 'Tax', type: 'text' },
  { id: 'invoice_date', label: 'Invoice Date', type: 'date' },
  { id: 'due_date', label: 'Due Date', type: 'date' },
  { id: 'invoice_number', label: 'Invoice Number', type: 'text' },
  { id: 'account_number', label: 'Account Number', type: 'text' },
  { id: 'amount', label: 'Amount', type: 'text' },
  { id: 'company_tagging_id', label: 'Company Tagging Id', type: 'text' },
  {
    id: 'invoice_tagging_id',
    label: 'Transaction Tagging Id',
    type: 'text',
  },
];
