import React from 'react';

import VendorForm from '@/app/dashboard/vendors/_components/vendor-form';
import { getCompanyVendorsList } from '@/utils/financials/payables/payable-vendors-list';
import { createClient } from '@/utils/supabase/server';

import { VendorForm as VendorFormType } from '@/types/vendor';

const Vendors = async ({ params: { id } }: { params: { id: string } }) => {
  const supabase = createClient();
  const vendorsList = (await getCompanyVendorsList(supabase)) || [];

  const vendorById = vendorsList?.find((vendor) => vendor.id === id);

  if (!vendorById) {
    return (
      <div>
        <h1>Vendor not found</h1>
      </div>
    );
  }

  const intialState: VendorFormType = {
    company_name: vendorById.company_name,
    company_tagging_id: vendorById.company_tagging_id,
    address_1: vendorById.address_1,
    address_2: vendorById.address_2 || '',
    contact_name: vendorById.contact_name,
    phone: vendorById.phone,
    tax: vendorById.tax,
    email: vendorById.email,
    tax_payer_id: vendorById.tax_payer_id,
    line_items: JSON.parse(vendorById.line_items || '[]'),
    payment_term: vendorById.payment_term,
    account_number: vendorById.account_number,
    invoice_number: vendorById.invoice_number,
    amount: vendorById.amount,
    due_date: vendorById.due_date,
    invoice_date: vendorById.invoice_date,
    invoice_tagging_id: vendorById.code,
  };

  // const vendorData = excludeFields(vendorById, [
  //   'id',
  //   'inserted_at',
  //   'created_by',
  // ]) as unknown as Omit<Vendor, 'id' | 'created_by' | 'inserted_at'>;

  return (
    <div>
      <VendorForm type='update' initialState={intialState} />
    </div>
  );
};

export default Vendors;
