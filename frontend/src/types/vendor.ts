// const ACCEPTED_IMAGE_TYPES = [
//   'image/jpeg',
//   'image/jpg',
//   'image/png',
//   'image/webp',
// ];
// export const FormSchema = z.object({
//   vendorCompanyName: z.string().min(2, {
//     message: 'Company Name must be at least 2 characters.',
//   }),
//   email: z
//     .string()
//     .email({ message: 'Email should be in format abc@xyz.com ' }),
//   address1: z
//     .string()
//     .min(2, { message: 'Address1 must be at least 2 characters.' }),

import { LineItem } from '@/types/client';

//   address2: z
//     .string()
//     .min(2, { message: 'Address2 must be at least 2 characters.' }),

//   phoneNumber: z.string().min(10, {
//     message: 'phoneNumber must be in format (###) ### ####',
//   }),
//   taxId: z
//     .string()
//     .min(2, { message: 'textId must be at least 2 characters.' }),
//   file: z
//     .instanceof(globalThis.FileList)
//     .refine(
//       (files) => {
//         return Array.from(files).every((file) => file instanceof File);
//       },
//       { message: 'Expected a file' },
//     )
//     .refine(
//       (files) =>
//         Array.from(files).every((file) =>
//           ACCEPTED_IMAGE_TYPES.includes(file.type),
//         ),
//       'Only these types are allowed .jpg, .jpeg, .png and .webp',
//     ),
// });

export interface Vendor {
  id: string;
  account_number: string;
  inserted_at: string;
  created_by: string;
  user_id: string;
  company_name: string;
  company_id: string;
  contact_name: string;
  address_1: string;
  address_2: string;
  tax_payer_id: string;
  tax: string;
  line_items: LineItem[];
  payment_term: string;
  phone_number: string;
  email_address: string;
  invoice_date: string;
  due_date: string;
  description: string;
  invoice_number: string;
  amount: string;
  company_tagging_id: string;
  transaction_tagging_id: string;
  status?: 'Paid' | 'Unpaid' | 'Partial';
}

export interface AccountPayables {
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
  ein_number: string;
  phone_number: string;
  email_address: string;
  invoice_date: string;
  due_date: string;
  description: string;
  invoice_number: string;
  amount: string;
  tagging_id: string;
  status?: 'Paid' | 'Unpaid' | 'Partial';
  isUnassigned: boolean;
}

export interface VendorForm {
  company_name: string;
  address_1: string;
  address_2: string;
  phone: string;
  tax: string;
  email: string;
  line_items: LineItem[];
  tax_payer_id: string;
  payment_term: string;
  account_number: string;
  invoice_number: string;
  amount: string;
  due_date: string;
  company_tagging_id: string;
  invoice_tagging_id: string;
  invoice_date: string;
  contact_name: string;
}
