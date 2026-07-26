import { z } from 'zod';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
export const FormSchema = z.object({
  vendorCompanyName: z.string().min(2, {
    message: 'Company Name must be at least 2 characters.',
  }),
  email: z
    .string()
    .email({ message: 'Email should be in format abc@xyz.com ' }),
  address1: z
    .string()
    .min(2, { message: 'Address1 must be at least 2 characters.' }),

  address2: z
    .string()
    .min(2, { message: 'Address2 must be at least 2 characters.' }),

  phoneNumber: z.string().min(10, {
    message: 'phoneNumber must be in format (###) ### ####',
  }),
  taxId: z
    .string()
    .min(2, { message: 'textId must be at least 2 characters.' }),
  file: z
    .instanceof(globalThis.FileList)
    .refine(
      (files) => {
        return Array.from(files).every((file) => file instanceof File);
      },
      { message: 'Expected a file' },
    )
    .refine(
      (files) =>
        Array.from(files).every((file) =>
          ACCEPTED_IMAGE_TYPES.includes(file.type),
        ),
      'Only these types are allowed .jpg, .jpeg, .png and .webp',
    ),
});

export interface Client {
  id: string;
  account_number: string;
  inserted_at: string;
  created_by: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  company_id: number;
  address_1: string;
  address_2: string;
  tax_payer_id: string;
  tax: string;
  line_items: LineItem[];
  phone_number: string;
  email_address: string;
  payment_term: string;
  invoice_date: string;
  due_date: string;
  description: string;
  invoice_number: string;
  amount: string;
  company_tagging_id: string;
  transaction_tagging_id: string;
  status?: 'completed' | 'pending';
}

export interface LineItem {
  item: string;
  description: string;
  qty: number;
  unitPrice: string;
  amount: string;
}

export interface ClientForm {
  company_name: string;
  address_1: string;
  address_2: string;
  phone: string;
  tax: string;
  email: string;
  contact_name: string;
  tax_payer_id: string;
  payment_term: string;
  account_number: string;
  invoice_number: string;
  amount: string;
  due_date: string;
  invoice_date: string;
  company_tagging_id: string;
  invoice_tagging_id: string;
  line_items: LineItem[];
}
