import LeadGraph from '@/app/dashboard/sales-marketing/lead-graph/page';
import SaleGraph from '@/app/dashboard/sales-marketing/sale-graph/page';
import SaleMarketingReport from '@/app/dashboard/sales-marketing/sale-marketing-report/page';

const SaleMarketingPage = async () => {
  return (
    <div>
      <SaleMarketingReport />
      <div className='mt-10 flex flex-row justify-between'>
        <div className='w-[48%]'>
          <SaleGraph />
        </div>
        <div className='w-[48%]'>
          <LeadGraph />
        </div>
      </div>
    </div>
  );
};

export default SaleMarketingPage;
