import CyberSecurityReport from '@/app/dashboard/cyber-security/cyber-security-report/page';
import RecentActivity from '@/app/dashboard/cyber-security/recent-activity/page';

const SecurityPage = () => {
  return (
    <div>
      <CyberSecurityReport />

      <RecentActivity />
    </div>
  );
};

export default SecurityPage;
