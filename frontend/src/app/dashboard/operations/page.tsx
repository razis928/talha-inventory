import OperationalEfficiencyGraph from '@/app/dashboard/operations/operational-efficiency-graph/page';
import OperationalReport from '@/app/dashboard/operations/operational-report/page';
import ProductVolumeGraph from '@/app/dashboard/operations/production-volume-graph/page';

const OperationalDepartmentPage = async () => {
  return (
    <div>
      <OperationalReport />
      <div className='mt-10 flex flex-row justify-between'>
        <div className='w-[48%]'>
          <ProductVolumeGraph />
        </div>
        <div className='w-[48%]'>
          <OperationalEfficiencyGraph />
        </div>
      </div>
    </div>
  );
};

export default OperationalDepartmentPage;
