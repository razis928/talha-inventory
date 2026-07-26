import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ScreenFrame from '../components/ScreenFrame';
import PageToolbar from '../components/PageToolbar';
import { CustomerDetailApi, fetchCustomerDetail } from '../api/customers';
import { formatPkr } from '../utils/currency';

interface CustomerDetailScreenProps {
  customerId: string;
  onBack: () => void;
}

export default function CustomerDetailScreen({ customerId, onBack }: CustomerDetailScreenProps) {
  const [detail, setDetail] = useState<CustomerDetailApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchCustomerDetail(Number(customerId))
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load customer');
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  const c = detail?.customer;

  return (
    <ScreenFrame
      title={c?.name ?? 'Customer'}
      subtitle="Job order history and receivable ledger"
      toolbar={
        <PageToolbar
          extra={
            <button type="button" onClick={onBack} className="erp-btn-ghost flex items-center gap-1">
              <ArrowLeft size={14} />
              Back to Customers
            </button>
          }
        />
      }
      formPanel={
        c ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Phone', value: c.phone || '—' },
              { label: 'Email', value: c.email || '—' },
              { label: 'City', value: c.city || '—' },
              { label: 'Address', value: c.address || '—' },
              { label: 'Account balance (AR)', value: formatPkr(detail?.account_balance ?? 0) },
            ].map((stat) => (
              <div key={stat.label} className="erp-stat-box">
                <p className="erp-field-label">{stat.label}</p>
                <p className="erp-strong text-sm">{stat.value}</p>
              </div>
            ))}
          </div>
        ) : undefined
      }
    >
      {loading && <p className="erp-muted p-3 text-sm">Loading…</p>}
      {error && <p className="p-3 text-sm text-red-600">{error}</p>}
      {!loading && !error && detail && (
        <div className="space-y-4 border-t border-[var(--color-erp-border)] p-3">
          <section>
            <div className="erp-titlebar mb-0 text-xs">Job Orders</div>
            <div className="overflow-x-auto">
              <table className="erp-classic-table min-w-[520px]">
                <thead>
                  <tr>
                    <th>Job No</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Required</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.job_orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="erp-muted py-6 text-center">
                        No job orders yet.
                      </td>
                    </tr>
                  ) : (
                    detail.job_orders.map((job) => (
                      <tr key={job.id}>
                        <td className="erp-strong">{job.job_number}</td>
                        <td>{job.status}</td>
                        <td>{formatPkr(job.total_amount)}</td>
                        <td>{job.required_date ?? '—'}</td>
                        <td>{job.created_at.slice(0, 10)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="erp-titlebar mb-0 text-xs">Accounting Ledger</div>
            <div className="overflow-x-auto">
              <table className="erp-classic-table min-w-[480px]">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.ledger.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="erp-muted py-6 text-center">
                        No ledger entries yet. Dispatch a job to post receivable.
                      </td>
                    </tr>
                  ) : (
                    detail.ledger.map((row, i) => (
                      <tr key={`${row.entry_number}-${i}`}>
                        <td>{String(row.date).slice(0, 10)}</td>
                        <td className="text-xs">{row.description || row.memo || '—'}</td>
                        <td>{row.debit ? formatPkr(row.debit) : '—'}</td>
                        <td>{row.credit ? formatPkr(row.credit) : '—'}</td>
                        <td className="erp-strong">{formatPkr(row.balance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </ScreenFrame>
  );
}
