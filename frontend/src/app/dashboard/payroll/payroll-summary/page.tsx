import React from 'react';

import PayrollPaymentSummaryPage from '@/app/dashboard/payroll/payroll-summary/_components/payroll-payment-summary';

export const revalidate = 0;
const PayrollSummary = () => {
  return (
    <div className='container mt-[50px]'>
      <PayrollPaymentSummaryPage />
    </div>
  );
};

export default PayrollSummary;
