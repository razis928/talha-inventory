import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import usersData from '../../data/json/users-access.json';
import invoicesData from '../../data/json/invoices.json';
import paymentsData from '../../data/json/payments.json';
import gatePassData from '../../data/json/gate-pass.json';
import accountsData from '../../data/json/accounts.json';
import expensesData from '../../data/json/expenses.json';
import {
  createInventoryItem,
  deleteInventoryItem,
  fetchInventoryItems,
  updateInventoryItem,
} from '../api/inventory';
import {
  createDispatch,
  DispatchApi,
  DispatchInput,
  fetchDispatches,
} from '../api/dispatch';
import {
  createJobConsumptions,
  createJobOrder,
  deleteJobOrder as apiDeleteJobOrder,
  fetchJobOrders,
  JobConsumptionInput,
  JobOrderApi,
  JobOrderInput,
  updateJobOrder,
} from '../api/jobOrders';
import {
  approvePurchaseOrder as apiApprovePurchaseOrder,
  createPurchaseOrder,
  createReceiving,
  deletePurchaseOrder as apiDeletePurchaseOrder,
  fetchPurchaseOrders,
  fetchReceivings,
  PurchaseOrderApi,
  PurchaseOrderInput,
  ReceivingApi,
  ReceivingInput,
  updatePurchaseOrder,
} from '../api/purchase';
import {
  createCustomer,
  deleteCustomer as apiDeleteCustomer,
  fetchCustomers,
  updateCustomer,
  CustomerApi,
  CustomerInput,
} from '../api/customers';
import {
  createVendor,
  deleteVendor as apiDeleteVendor,
  fetchVendors,
  updateVendor,
  VendorApi,
  VendorInput,
} from '../api/vendors';
import { fetchStockTransactions, StockTransactionApi } from '../api/stockTransactions';
import { InventoryFormData, InventoryItem } from '../types';

type Row = Record<string, unknown> & { id: string };

function makeCrud<T extends Row>(
  setter: Dispatch<SetStateAction<T[]>>,
  prefix: string
) {
  return {
    add: (data: Record<string, unknown>) =>
      setter((prev) => [...prev, { ...data, id: `${prefix}-${Date.now()}` } as T]),
    update: (id: string, data: Record<string, unknown>) =>
      setter((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item))),
    remove: (id: string) => setter((prev) => prev.filter((item) => item.id !== id)),
  };
}

export interface ErpStore {
  inventory: InventoryItem[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  purchaseOrders: PurchaseOrderApi[];
  purchaseLoading: boolean;
  purchaseError: string | null;
  receivings: ReceivingApi[];
  receivingLoading: boolean;
  receivingError: string | null;
  stockTransactions: StockTransactionApi[];
  stockTxnLoading: boolean;
  stockTxnError: string | null;
  jobOrders: JobOrderApi[];
  jobOrderLoading: boolean;
  jobOrderError: string | null;
  dispatches: DispatchApi[];
  dispatchLoading: boolean;
  dispatchError: string | null;
  users: Row[];
  invoices: Row[];
  reviewedInvoices: Row[];
  payments: Row[];
  customers: CustomerApi[];
  customerLoading: boolean;
  customerError: string | null;
  vendors: VendorApi[];
  vendorLoading: boolean;
  vendorError: string | null;
  inwardGatePasses: Row[];
  outwardGatePasses: Row[];
  chartOfAccounts: Row[];
  expenses: Row[];
  userCrud: ReturnType<typeof makeCrud<Row>>;
  invoiceCrud: ReturnType<typeof makeCrud<Row>>;
  reviewedInvoiceCrud: ReturnType<typeof makeCrud<Row>>;
  paymentCrud: ReturnType<typeof makeCrud<Row>>;
  inwardGatePassCrud: ReturnType<typeof makeCrud<Row>>;
  outwardGatePassCrud: ReturnType<typeof makeCrud<Row>>;
  accountCrud: ReturnType<typeof makeCrud<Row>>;
  expenseCrud: ReturnType<typeof makeCrud<Row>>;
  refreshInventory: () => Promise<void>;
  refreshPurchaseOrders: () => Promise<void>;
  refreshReceivings: () => Promise<void>;
  refreshStockTransactions: () => Promise<void>;
  refreshVendors: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  refreshJobOrders: () => Promise<void>;
  refreshDispatches: () => Promise<void>;
  addInventory: (data: InventoryFormData) => Promise<void>;
  updateInventory: (id: string, data: InventoryFormData) => Promise<void>;
  deleteInventory: (id: string) => Promise<void>;
  getInventoryById: (id: string) => InventoryItem | undefined;
  addPurchaseOrder: (data: PurchaseOrderInput) => Promise<void>;
  updatePurchaseOrderById: (id: number, data: PurchaseOrderInput) => Promise<void>;
  deletePurchaseOrder: (id: number) => Promise<void>;
  approvePurchaseOrderById: (id: number) => Promise<void>;
  getPurchaseOrderById: (id: string) => PurchaseOrderApi | undefined;
  addJobOrder: (data: JobOrderInput) => Promise<void>;
  updateJobOrderById: (id: number, data: JobOrderInput) => Promise<void>;
  deleteJobOrder: (id: number) => Promise<void>;
  getJobOrderById: (id: string) => JobOrderApi | undefined;
  addDispatch: (data: DispatchInput) => Promise<void>;
  addJobConsumption: (jobId: number, data: JobConsumptionInput) => Promise<void>;
  addReceiving: (data: ReceivingInput) => Promise<void>;
  addVendor: (data: VendorInput) => Promise<VendorApi>;
  updateVendorById: (id: number, data: VendorInput) => Promise<void>;
  deleteVendor: (id: number) => Promise<void>;
  addCustomer: (data: CustomerInput) => Promise<CustomerApi>;
  updateCustomerById: (id: number, data: CustomerInput) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
}

export function useErpStore(): ErpStore {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderApi[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState(true);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const [receivings, setReceivings] = useState<ReceivingApi[]>([]);
  const [receivingLoading, setReceivingLoading] = useState(true);
  const [receivingError, setReceivingError] = useState<string | null>(null);

  const [stockTransactions, setStockTransactions] = useState<StockTransactionApi[]>([]);
  const [stockTxnLoading, setStockTxnLoading] = useState(false);
  const [stockTxnError, setStockTxnError] = useState<string | null>(null);

  const [jobOrders, setJobOrders] = useState<JobOrderApi[]>([]);
  const [jobOrderLoading, setJobOrderLoading] = useState(true);
  const [jobOrderError, setJobOrderError] = useState<string | null>(null);

  const [dispatches, setDispatches] = useState<DispatchApi[]>([]);
  const [dispatchLoading, setDispatchLoading] = useState(true);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const [users, setUsers] = useState<Row[]>(usersData.users as Row[]);
  const [invoices, setInvoices] = useState<Row[]>(invoicesData.invoices as Row[]);
  const [reviewedInvoices, setReviewedInvoices] = useState<Row[]>(invoicesData.reviewedInvoices as Row[]);
  const [payments, setPayments] = useState<Row[]>(paymentsData.payments as Row[]);
  const [customers, setCustomers] = useState<CustomerApi[]>([]);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<VendorApi[]>([]);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [vendorError, setVendorError] = useState<string | null>(null);
  const [inwardGatePasses, setInwardGatePasses] = useState<Row[]>(gatePassData.inwardPasses as Row[]);
  const [outwardGatePasses, setOutwardGatePasses] = useState<Row[]>(gatePassData.outwardPasses as Row[]);
  const [chartOfAccounts, setChartOfAccounts] = useState<Row[]>(accountsData.chartOfAccounts as Row[]);
  const [expenses, setExpenses] = useState<Row[]>(expensesData.expenses as Row[]);

  const refreshInventory = useCallback(async () => {
    setInventoryLoading(true);
    setInventoryError(null);
    try {
      const items = await fetchInventoryItems();
      setInventory(items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load inventory';
      setInventoryError(message);
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  const refreshPurchaseOrders = useCallback(async () => {
    setPurchaseLoading(true);
    setPurchaseError(null);
    try {
      setPurchaseOrders(await fetchPurchaseOrders());
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Failed to load purchase orders');
      setPurchaseOrders([]);
    } finally {
      setPurchaseLoading(false);
    }
  }, []);

  const refreshReceivings = useCallback(async () => {
    setReceivingLoading(true);
    setReceivingError(null);
    try {
      setReceivings(await fetchReceivings());
    } catch (err) {
      setReceivingError(err instanceof Error ? err.message : 'Failed to load receivings');
      setReceivings([]);
    } finally {
      setReceivingLoading(false);
    }
  }, []);

  const refreshVendors = useCallback(async () => {
    setVendorLoading(true);
    setVendorError(null);
    try {
      setVendors(await fetchVendors());
    } catch (err) {
      setVendorError(err instanceof Error ? err.message : 'Failed to load vendors');
      setVendors([]);
    } finally {
      setVendorLoading(false);
    }
  }, []);

  const refreshCustomers = useCallback(async () => {
    setCustomerLoading(true);
    setCustomerError(null);
    try {
      setCustomers(await fetchCustomers());
    } catch (err) {
      setCustomerError(err instanceof Error ? err.message : 'Failed to load customers');
      setCustomers([]);
    } finally {
      setCustomerLoading(false);
    }
  }, []);

  const refreshStockTransactions = useCallback(async () => {
    setStockTxnLoading(true);
    setStockTxnError(null);
    try {
      setStockTransactions(await fetchStockTransactions());
    } catch (err) {
      setStockTxnError(err instanceof Error ? err.message : 'Failed to load stock transactions');
      setStockTransactions([]);
    } finally {
      setStockTxnLoading(false);
    }
  }, []);

  const refreshJobOrders = useCallback(async () => {
    setJobOrderLoading(true);
    setJobOrderError(null);
    try {
      setJobOrders(await fetchJobOrders());
    } catch (err) {
      setJobOrderError(err instanceof Error ? err.message : 'Failed to load job orders');
      setJobOrders([]);
    } finally {
      setJobOrderLoading(false);
    }
  }, []);

  const refreshDispatches = useCallback(async () => {
    setDispatchLoading(true);
    setDispatchError(null);
    try {
      setDispatches(await fetchDispatches());
    } catch (err) {
      setDispatchError(err instanceof Error ? err.message : 'Failed to load dispatches');
      setDispatches([]);
    } finally {
      setDispatchLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshInventory();
    void refreshPurchaseOrders();
    void refreshReceivings();
    void refreshVendors();
    void refreshCustomers();
    void refreshJobOrders();
    void refreshDispatches();
  }, [
    refreshInventory,
    refreshPurchaseOrders,
    refreshReceivings,
    refreshVendors,
    refreshCustomers,
    refreshJobOrders,
    refreshDispatches,
  ]);

  const addInventory = useCallback(async (data: InventoryFormData) => {
    const created = await createInventoryItem(data);
    setInventory((prev) => [created, ...prev]);
    setInventoryError(null);
  }, []);

  const updateInventory = useCallback(async (id: string, data: InventoryFormData) => {
    let maxStock: number | undefined;
    setInventory((prev) => {
      maxStock = prev.find((item) => item.id === id)?.maxStock;
      return prev;
    });
    const updated = await updateInventoryItem(id, data, maxStock);
    setInventory((prev) => prev.map((item) => (item.id === id ? updated : item)));
    setInventoryError(null);
  }, []);

  const deleteInventory = useCallback(async (id: string) => {
    await deleteInventoryItem(id);
    setInventory((prev) => prev.filter((item) => item.id !== id));
    setInventoryError(null);
  }, []);

  const getInventoryById = useCallback(
    (id: string) => inventory.find((item) => item.id === id),
    [inventory]
  );

  const addPurchaseOrder = useCallback(async (data: PurchaseOrderInput) => {
    const created = await createPurchaseOrder(data);
    setPurchaseOrders((prev) => [created, ...prev]);
    setPurchaseError(null);
  }, []);

  const updatePurchaseOrderById = useCallback(async (id: number, data: PurchaseOrderInput) => {
    const updated = await updatePurchaseOrder(id, data);
    setPurchaseOrders((prev) => prev.map((po) => (po.id === id ? updated : po)));
    setPurchaseError(null);
  }, []);

  const deletePurchaseOrder = useCallback(async (id: number) => {
    await apiDeletePurchaseOrder(id);
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== id));
    setPurchaseError(null);
  }, []);

  const approvePurchaseOrderById = useCallback(async (id: number) => {
    const updated = await apiApprovePurchaseOrder(id);
    setPurchaseOrders((prev) => prev.map((po) => (po.id === id ? updated : po)));
    setPurchaseError(null);
  }, []);

  const getPurchaseOrderById = useCallback(
    (id: string) => purchaseOrders.find((po) => String(po.id) === id),
    [purchaseOrders]
  );

  const addJobOrder = useCallback(async (data: JobOrderInput) => {
    const created = await createJobOrder(data);
    setJobOrders((prev) => [created, ...prev]);
    setJobOrderError(null);
  }, []);

  const updateJobOrderById = useCallback(async (id: number, data: JobOrderInput) => {
    const updated = await updateJobOrder(id, data);
    setJobOrders((prev) => prev.map((job) => (job.id === id ? updated : job)));
    setJobOrderError(null);
  }, []);

  const deleteJobOrder = useCallback(async (id: number) => {
    await apiDeleteJobOrder(id);
    setJobOrders((prev) => prev.filter((job) => job.id !== id));
    setJobOrderError(null);
  }, []);

  const getJobOrderById = useCallback(
    (id: string) => jobOrders.find((job) => String(job.id) === id),
    [jobOrders]
  );

  const addDispatch = useCallback(async (data: DispatchInput) => {
    const created = await createDispatch(data);
    setDispatches((prev) => [created, ...prev]);
    setDispatchError(null);
    await Promise.all([
      refreshJobOrders(),
      refreshInventory(),
      refreshStockTransactions(),
    ]);
  }, [refreshJobOrders, refreshInventory, refreshStockTransactions]);

  const addJobConsumption = useCallback(async (jobId: number, data: JobConsumptionInput) => {
    await createJobConsumptions(jobId, data);
    await Promise.all([
      refreshJobOrders(),
      refreshInventory(),
      refreshStockTransactions(),
    ]);
  }, [refreshJobOrders, refreshInventory, refreshStockTransactions]);

  const addReceiving = useCallback(async (data: ReceivingInput) => {
    const created = await createReceiving(data);
    setReceivings((prev) => [created, ...prev]);
    setReceivingError(null);
    await Promise.all([
      refreshInventory(),
      refreshPurchaseOrders(),
      refreshStockTransactions(),
    ]);
  }, [refreshInventory, refreshPurchaseOrders, refreshStockTransactions]);

  const addVendor = useCallback(async (data: VendorInput) => {
    const created = await createVendor(data);
    setVendors((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setVendorError(null);
    return created;
  }, []);

  const updateVendorById = useCallback(async (id: number, data: VendorInput) => {
    const updated = await updateVendor(id, data);
    setVendors((prev) =>
      prev.map((vendor) => (vendor.id === id ? updated : vendor))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setVendorError(null);
  }, []);

  const deleteVendor = useCallback(async (id: number) => {
    await apiDeleteVendor(id);
    setVendors((prev) => prev.filter((vendor) => vendor.id !== id));
    setVendorError(null);
  }, []);

  const addCustomer = useCallback(async (data: CustomerInput) => {
    const created = await createCustomer(data);
    setCustomers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setCustomerError(null);
    return created;
  }, []);

  const updateCustomerById = useCallback(async (id: number, data: CustomerInput) => {
    const updated = await updateCustomer(id, data);
    setCustomers((prev) =>
      prev.map((customer) => (customer.id === id ? updated : customer))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setCustomerError(null);
  }, []);

  const deleteCustomer = useCallback(async (id: number) => {
    await apiDeleteCustomer(id);
    setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    setCustomerError(null);
  }, []);

  return {
    inventory,
    inventoryLoading,
    inventoryError,
    purchaseOrders,
    purchaseLoading,
    purchaseError,
    receivings,
    receivingLoading,
    receivingError,
    stockTransactions,
    stockTxnLoading,
    stockTxnError,
    jobOrders,
    jobOrderLoading,
    jobOrderError,
    dispatches,
    dispatchLoading,
    dispatchError,
    users,
    invoices,
    reviewedInvoices,
    payments,
    customers,
    customerLoading,
    customerError,
    vendors,
    vendorLoading,
    vendorError,
    inwardGatePasses,
    outwardGatePasses,
    chartOfAccounts,
    expenses,
    userCrud: makeCrud(setUsers, 'u'),
    invoiceCrud: makeCrud(setInvoices, 'inv-doc'),
    reviewedInvoiceCrud: makeCrud(setReviewedInvoices, 'rinv'),
    paymentCrud: makeCrud(setPayments, 'pay'),
    inwardGatePassCrud: makeCrud(setInwardGatePasses, 'gp-in'),
    outwardGatePassCrud: makeCrud(setOutwardGatePasses, 'gp-out'),
    accountCrud: makeCrud(setChartOfAccounts, 'coa'),
    expenseCrud: makeCrud(setExpenses, 'exp'),
    refreshInventory,
    refreshPurchaseOrders,
    refreshReceivings,
    refreshStockTransactions,
    refreshVendors,
    refreshCustomers,
    refreshJobOrders,
    refreshDispatches,
    addInventory,
    updateInventory,
    deleteInventory,
    getInventoryById,
    addPurchaseOrder,
    updatePurchaseOrderById,
    deletePurchaseOrder,
    approvePurchaseOrderById,
    getPurchaseOrderById,
    addJobOrder,
    updateJobOrderById,
    deleteJobOrder,
    getJobOrderById,
    addDispatch,
    addJobConsumption,
    addReceiving,
    addVendor,
    updateVendorById,
    deleteVendor,
    addCustomer,
    updateCustomerById,
    deleteCustomer,
  };
}
