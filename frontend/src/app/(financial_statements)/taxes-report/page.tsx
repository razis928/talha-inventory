import React from 'react';

import Report from '@/app/(financial_statements)/taxes-report/report';

export const revalidate = 0;

const AccountPayable = async () => {
  return (
    <div className='m-auto my-3 max-w-[1100px] bg-[white]'>
      <Report />
    </div>
  );
};

export default AccountPayable;
