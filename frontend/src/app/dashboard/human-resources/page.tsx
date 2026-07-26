import EmployeeListPage from '@/app/dashboard/human-resources/employee-list/_components/employee-list';
import HumanResourcesReport from '@/app/dashboard/human-resources/human-resource-report/page';

const OperationalDepartmentPage = async () => {
  return (
    <div>
      <HumanResourcesReport />
      <div className='mt-[80px]'>
        <EmployeeListPage />
      </div>
    </div>
  );
};

export default OperationalDepartmentPage;
