import usersData from '../../data/json/users-access.json';
import { USER_FIELDS, USER_FILTERS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';
import { Column } from '../components/DataTable';
import GenericListScreen from './GenericListScreen';

const columns: Column<Record<string, unknown>>[] = [
  { key: 'name', header: 'Name', render: (r) => <span className="erp-strong">{String(r.name)}</span> },
  { key: 'email', header: 'Email', render: (r) => String(r.email) },
  { key: 'role', header: 'Role', render: (r) => String(r.role) },
  { key: 'department', header: 'Department', render: (r) => String(r.department) },
  { key: 'status', header: 'Status', render: (r) => (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${r.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{String(r.status)}</span>
  )},
  { key: 'lastLogin', header: 'Last Login', render: (r) => String(r.lastLogin) },
];

export default function UsersAccessScreen({ searchQuery }: { searchQuery: string }) {
  const { users, userCrud } = useErp();
  return (
    <GenericListScreen
      title={usersData.title}
      subtitle={usersData.subtitle}
      entityName="User"
      columns={columns}
      data={users}
      searchQuery={searchQuery}
      fields={USER_FIELDS}
      filters={USER_FILTERS}
      addLabel="+ Add User"
      onAdd={userCrud.add}
      onEdit={userCrud.update}
      onDelete={userCrud.remove}
    />
  );
}
