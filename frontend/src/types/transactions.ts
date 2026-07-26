export interface CSVTransaction {
  id: string;
  amount: string;
  currency: string;
  description: string;
  status: string;
  code: string;
  company_tagging_id: string;
  company_name: string;
  address_1: string;
  address_2?: string;
  contact_name: string;
  phone: string;
  email: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  payment_term: string;
  line_items: string;
  tax: string;
  tax_payer_id: string;
  account_number: string;
  memo: string;
}
