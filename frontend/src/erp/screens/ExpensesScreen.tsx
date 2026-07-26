import { useCallback, useEffect, useMemo, useState } from 'react';
import expensesData from '../../data/json/expenses.json';
import { Column } from '../components/DataTable';
import GenericListScreen from './GenericListScreen';
import { formatPkr } from '../utils/currency';
import {
  AccountApi,
  createExpense,
  deleteExpense,
  ExpenseApi,
  fetchAccounts,
  fetchExpenses,
} from '../api/accounting';
import { FieldDef } from '../config/entityFields';

const today = () => new Date().toISOString().slice(0, 10);

const EXPENSE_FILTERS = [
  { key: 'expense_number', label: 'Expense Number', type: 'text' as const, placeholder: 'e.g. EXP-...' },
  {
    key: 'category',
    label: 'Category',
    type: 'select' as const,
    options: ['All', 'Utilities', 'Salaries', 'Transport', 'Maintenance', 'Office', 'Marketing', 'Rent', 'Other'],
  },
];

const columns: Column<Record<string, unknown>>[] = [
  {
    key: 'expense_number',
    header: 'Expense #',
    render: (r) => <span className="erp-strong">{String(r.expense_number)}</span>,
  },
  { key: 'title', header: 'Title', render: (r) => String(r.title) },
  { key: 'category', header: 'Category', render: (r) => String(r.category) },
  { key: 'paid_to', header: 'Paid To', render: (r) => String(r.paid_to || '—') },
  { key: 'payment_method', header: 'Credit From', render: (r) => String(r.payment_method || '—') },
  { key: 'amount', header: 'Amount', render: (r) => formatPkr(Number(r.amount)) },
  { key: 'expense_date', header: 'Date', render: (r) => String(r.expense_date) },
];

function accountOption(a: AccountApi) {
  return { value: String(a.id), label: a.name };
}

function parseAccountId(raw: string): number | null {
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function toRow(e: ExpenseApi): Record<string, unknown> & { id: string } {
  return { ...e, id: String(e.id) };
}

export default function ExpensesScreen({ searchQuery }: { searchQuery: string }) {
  const [expenses, setExpenses] = useState<ExpenseApi[]>([]);
  const [accounts, setAccounts] = useState<AccountApi[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [exps, accts] = await Promise.all([fetchExpenses(), fetchAccounts()]);
      setExpenses(exps);
      setAccounts(accts.filter((a) => a.is_active));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
      setExpenses([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const systemAccounts = useMemo(() => accounts.filter((a) => a.is_system), [accounts]);
  const creditOptions = useMemo(
    () => (systemAccounts.length ? systemAccounts : accounts).map(accountOption),
    [systemAccounts, accounts]
  );
  const paidOptions = useMemo(() => accounts.map(accountOption), [accounts]);

  const fields: FieldDef[] = useMemo(
    () => [
      { key: 'expense_number', label: 'Expense Number', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        options: ['Utilities', 'Salaries', 'Transport', 'Maintenance', 'Office', 'Marketing', 'Rent', 'Other'],
        required: true,
      },
      {
        key: 'credit_from',
        label: 'Credit from',
        type: 'select',
        options: creditOptions.length ? creditOptions : [{ value: '', label: 'No system accounts' }],
        required: true,
      },
      {
        key: 'paid_to',
        label: 'Paid to',
        type: 'select',
        options: paidOptions.length ? paidOptions : [{ value: '', label: 'No accounts' }],
        required: true,
      },
      { key: 'amount', label: 'Amount (PKR)', type: 'number', required: true },
      { key: 'expense_date', label: 'Date', type: 'date', required: true },
      { key: 'notes', label: 'Notes', type: 'text' },
    ],
    [creditOptions, paidOptions]
  );

  const rows = useMemo(() => expenses.map(toRow), [expenses]);

  return (
    <>
      {error && (
        <div className="mb-2 flex justify-between gap-2 px-1 text-xs text-red-600">
          <span>{error}</span>
          <button type="button" className="erp-btn-ghost" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      )}
      <GenericListScreen
        title={expensesData.title}
        subtitle="Debit paid account · Credit system cash/bank account"
        entityName="Expense"
        columns={columns}
        data={rows}
        searchQuery={searchQuery}
        fields={fields}
        filters={EXPENSE_FILTERS}
        addLabel="+ Add Expense"
        onAdd={async (data) => {
          try {
            const creditId = parseAccountId(String(data.credit_from ?? ''));
            const paidId = parseAccountId(String(data.paid_to ?? ''));
            if (!creditId) throw new Error('Select a Credit from account (system accounts)');
            if (!paidId) throw new Error('Select a Paid to account');
            const credit = accounts.find((a) => a.id === creditId);
            const paid = accounts.find((a) => a.id === paidId);
            await createExpense({
              expense_number: String(data.expense_number ?? `EXP-${Date.now().toString().slice(-6)}`),
              title: String(data.title ?? ''),
              category: String(data.category ?? 'Other'),
              paid_to: paid?.name ?? '',
              amount: Number(data.amount) || 0,
              expense_date: String(data.expense_date ?? today()),
              payment_method: credit ? `${credit.code} ${credit.name}` : '',
              debit_account_id: paidId,
              credit_account_id: creditId,
              notes: String(data.notes ?? ''),
            });
            await refresh();
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to add expense');
            throw err;
          }
        }}
        onEdit={async () => {
          window.alert('Edit not supported — delete and re-create the expense voucher.');
          throw new Error('edit unsupported');
        }}
        onDelete={async (id) => {
          try {
            await deleteExpense(Number(id));
            await refresh();
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to delete');
            throw err;
          }
        }}
        deleteConfirmField="expense_number"
        pdfFilename="expenses"
      />
    </>
  );
}
