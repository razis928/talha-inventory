import React from 'react';

import ClientForm from '@/app/dashboard/clients/_components/client-form';
import { getCompanyCustomersList } from '@/utils/financials/receivables/customer-receivable-list';
import { createClient } from '@/utils/supabase/server';

import { ClientForm as ClientFormType } from '@/types/client';

const Clients = async ({ params: { id } }: { params: { id: string } }) => {
  const supabase = createClient();
  const customersList = (await getCompanyCustomersList(supabase)) || [];

  const customer = customersList?.find((customer) => customer.id === id);

  if (!customer) {
    return (
      <div>
        <h1>Vendor not found</h1>
      </div>
    );
  }

  const intialState: ClientFormType = {
    company_name: customer.company_name,
    company_tagging_id: customer.company_tagging_id,
    address_1: customer.address_1,
    address_2: customer.address_2 || '',
    contact_name: customer.contact_name,
    phone: customer.phone,
    tax: customer.tax,
    email: customer.email,
    tax_payer_id: customer.tax_payer_id,
    line_items: JSON.parse(customer.line_items || '[]'),
    payment_term: customer.payment_term,
    account_number: customer.account_number,
    invoice_number: customer.invoice_number,
    amount: customer.amount,
    due_date: customer.due_date,
    invoice_date: customer.invoice_date,
    invoice_tagging_id: customer.code,
  };

  return (
    <div>
      <ClientForm type='update' initialState={intialState} />
    </div>
  );
};

export default Clients;
