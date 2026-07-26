import { useEffect, useMemo, useState } from 'react';
import settingsData from '../../data/json/settings.json';
import PageToolbar from '../components/PageToolbar';
import ScreenFrame from '../components/ScreenFrame';
import RecordModal from '../components/RecordModal';
import DataTable, { Column } from '../components/DataTable';
import { USER_FIELDS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';
import { useConfirmDelete } from '../context/ThemeContext';
import { useListExport } from '../hooks/useListExport';
import { matchesSearch } from '../utils/filter';

const userColumns: Column<Record<string, unknown>>[] = [
  { key: 'name', header: 'Name', render: (r) => <span className="erp-strong">{String(r.name)}</span> },
  { key: 'email', header: 'Email', render: (r) => String(r.email) },
  { key: 'role', header: 'Role', render: (r) => String(r.role) },
  { key: 'status', header: 'Status', render: (r) => (
    <span className={`erp-badge ${r.status === 'Active' ? 'erp-badge-green' : ''}`}>{String(r.status)}</span>
  )},
  { key: 'lastLogin', header: 'Last Login', render: (r) => String(r.lastLogin) },
];

export default function SettingsScreen({ searchQuery }: { searchQuery: string }) {
  const { users, userCrud } = useErp();
  const confirmDelete = useConfirmDelete();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Record<string, unknown> | undefined>();
  const { company, roles, notifications } = settingsData;

  useEffect(() => { setPage(1); }, [searchQuery]);

  const filteredUsers = useMemo(() =>
    users.filter((u) => matchesSearch(u, searchQuery)),
  [users, searchQuery]);

  const { handleExportPdf, handlePrint, hasData } = useListExport({
    title: 'Users & Roles',
    subtitle: settingsData.subtitle,
    filename: 'users-list',
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'role', header: 'Role' },
      { key: 'status', header: 'Status' },
      { key: 'lastLogin', header: 'Last Login' },
    ],
    data: filteredUsers,
  });

  return (
    <>
      <ScreenFrame
        title={settingsData.title}
        subtitle={settingsData.subtitle}
        toolbar={
          <PageToolbar
            onAdd={() => { setEditRecord(undefined); setModalOpen(true); }}
            addLabel="+ Add User"
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            exportDisabled={!hasData}
          />
        }
        formPanel={
          <>
            <div className="mb-3 border border-[var(--color-erp-border)] bg-[var(--color-erp-input-bg)] p-3">
              <p className="erp-titlebar mb-2 inline-block px-2 py-0.5 text-xs">Company Information</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(company).map(([key, val]) => (
                  <div key={key} className="erp-field-row">
                    <span className="erp-field-label">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="erp-input block w-full px-2 py-1 text-xs">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="border border-[var(--color-erp-border)]">
                <div className="erp-titlebar text-xs">User Roles</div>
                <table className="erp-classic-table">
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id}>
                        <td className="erp-strong">{role.name}</td>
                        <td className="erp-muted text-xs">{role.permissions.join(', ')}</td>
                        <td className="erp-cell-highlight text-center">{role.users}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border border-[var(--color-erp-border)]">
                <div className="erp-titlebar text-xs">Notification Preferences</div>
                <table className="erp-classic-table">
                  <tbody>
                    {Object.entries(notifications).map(([key, val]) => (
                      <tr key={key}>
                        <td className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                        <td className="erp-strong">
                          {typeof val === 'boolean' ? (val ? 'Enabled' : 'Disabled') : String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        }
      >
        {searchQuery && (
          <p className="erp-muted border-b border-[var(--color-erp-border)] px-3 py-2 text-xs">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
          </p>
        )}

        <DataTable
          columns={userColumns}
          data={filteredUsers}
          page={page}
          pageSize={5}
          onPageChange={setPage}
          keyExtractor={(r) => String(r.id)}
          onEdit={(row) => { setEditRecord(row); setModalOpen(true); }}
          onDelete={(row) => confirmDelete(String(row.name), 'User', () => userCrud.remove(String(row.id)))}
        />
      </ScreenFrame>

      <RecordModal
        isOpen={modalOpen}
        mode={editRecord ? 'edit' : 'add'}
        title="User"
        fields={USER_FIELDS}
        record={editRecord}
        onClose={() => { setModalOpen(false); setEditRecord(undefined); }}
        onSave={(data) => {
          if (editRecord?.id) userCrud.update(String(editRecord.id), data);
          else userCrud.add({ ...data, department: data.department ?? 'General', lastLogin: data.lastLogin ?? '—' });
          setModalOpen(false);
          setEditRecord(undefined);
        }}
      />
    </>
  );
}
