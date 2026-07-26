import React, { useEffect, useState } from 'react';
import ErpSidebar from './erp/components/ErpSidebar';
import ErpTopBar from './erp/components/ErpTopBar';
import DispatchFormPage from './erp/components/DispatchFormPage';
import ItemFormPage from './erp/components/ItemFormPage';
import JobOrderFormPage from './erp/components/JobOrderFormPage';
import PurchaseOrderFormPage from './erp/components/PurchaseOrderFormPage';
import ReceivingFormPage from './erp/components/ReceivingFormPage';
import { ErpProvider, useErp } from './erp/context/ErpContext';
import { ThemeProvider } from './erp/context/ThemeContext';
import { useErpRoute } from './erp/hooks/useErpRoute';
import inventoryData from './data/json/inventory.json';
import DashboardScreen from './erp/screens/DashboardScreen';
import InventoryScreen from './erp/screens/InventoryScreen';
import StockDetailsScreen from './erp/screens/StockDetailsScreen';
import StockTransactionsScreen from './erp/screens/StockTransactionsScreen';
import PurchaseScreen from './erp/screens/PurchaseScreen';
import ReceivingScreen from './erp/screens/ReceivingScreen';
import JobOrdersScreen from './erp/screens/JobOrdersScreen';
import DispatchScreen from './erp/screens/DispatchScreen';
import AccountsScreen from './erp/screens/AccountsScreen';
import ExpensesScreen from './erp/screens/ExpensesScreen';
import VendorsScreen from './erp/screens/VendorsScreen';
import ReportsScreen from './erp/screens/ReportsScreen';
// import SettingsScreen from './erp/screens/SettingsScreen';
import VendorPaymentsScreen from './erp/screens/VendorPaymentsScreen';
import CustomerPaymentsScreen from './erp/screens/CustomerPaymentsScreen';
import CustomersScreen from './erp/screens/CustomersScreen';
import CustomerDetailScreen from './erp/screens/CustomerDetailScreen';
import VendorDetailScreen from './erp/screens/VendorDetailScreen';
import UsersAccessScreen from './erp/screens/UsersAccessScreen';

function ErpApp() {
  const {
    purchaseOrders,
    jobOrders,
    jobOrderLoading,
    inventory,
    vendors,
    customers,
    inventoryLoading,
    purchaseLoading,
    getInventoryById,
    getPurchaseOrderById,
    getJobOrderById,
    addInventory,
    updateInventory,
    addPurchaseOrder,
    updatePurchaseOrderById,
    addJobOrder,
    updateJobOrderById,
    addReceiving,
    addDispatch,
    addJobConsumption,
    addVendor,
    addCustomer,
  } = useErp();

  const { screen, recordId, formAction, navigate, openForm, closeForm } = useErpRoute();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const customerNames = customers
    .map((c) => c.name)
    .filter(Boolean);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileSidebarOpen]);

  useEffect(() => {
    if (inventoryLoading) return;
    if (screen === 'stock-details' && recordId && !getInventoryById(recordId)) {
      navigate('inventory');
      return;
    }
    if (screen === 'inventory' && formAction === 'edit' && recordId && !getInventoryById(recordId)) {
      closeForm('inventory');
      return;
    }
    if (!purchaseLoading && screen === 'purchase-orders' && formAction === 'edit' && recordId
      && !getPurchaseOrderById(recordId)) {
      closeForm('purchase-orders');
      return;
    }
    if (!jobOrderLoading && screen === 'job-orders' && formAction === 'edit' && recordId
      && !getJobOrderById(recordId)) {
      closeForm('job-orders');
    }
  }, [
    screen,
    recordId,
    formAction,
    inventoryLoading,
    purchaseLoading,
    jobOrderLoading,
    getInventoryById,
    getPurchaseOrderById,
    getJobOrderById,
    navigate,
    closeForm,
    jobOrders,
  ]);

  const handleScreenChange = (next: typeof screen) => {
    setMobileSidebarOpen(false);
    navigate(next === 'gate-pass' ? 'dispatch' : next);
  };

  const searchProps = { searchQuery: '' };

  const renderScreen = () => {
    if (screen === 'stock-details') {
      const item = recordId ? getInventoryById(recordId) : undefined;
      if (!item) return null;
      return <StockDetailsScreen item={item} onBack={() => navigate('inventory')} />;
    }

    if (screen === 'inventory' && formAction) {
      const editItem = formAction === 'edit' && recordId ? getInventoryById(recordId) : undefined;
      if (formAction === 'edit' && recordId && !editItem) return null;
      return (
        <ItemFormPage
          mode={formAction}
          item={editItem}
          categories={inventoryData.categories}
          units={inventoryData.units}
          onBack={() => closeForm('inventory')}
          onSave={async (data) => {
            try {
              if (formAction === 'edit' && recordId) await updateInventory(recordId, data);
              else await addInventory(data);
              closeForm('inventory');
            } catch (err) {
              window.alert(err instanceof Error ? err.message : 'Failed to save inventory item');
            }
          }}
        />
      );
    }

    if (screen === 'purchase-orders' && formAction) {
      const record = formAction === 'edit' && recordId
        ? getPurchaseOrderById(recordId)
        : undefined;
      if (formAction === 'edit' && recordId && !record) return null;
      return (
        <PurchaseOrderFormPage
          mode={formAction}
          inventory={inventory}
          vendors={vendors}
          record={record}
          onBack={() => closeForm('purchase-orders')}
          onAddVendor={addVendor}
          onReceive={async (data) => {
            await addReceiving(data);
          }}
          onSave={async (data) => {
            try {
              if (formAction === 'edit' && recordId) {
                await updatePurchaseOrderById(Number(recordId), data);
              } else {
                await addPurchaseOrder(data);
              }
              closeForm('purchase-orders');
            } catch (err) {
              window.alert(err instanceof Error ? err.message : 'Failed to save purchase order');
            }
          }}
        />
      );
    }

    if (screen === 'receiving' && formAction === 'add') {
      return (
        <ReceivingFormPage
          inventory={inventory}
          purchaseOrders={purchaseOrders}
          vendors={vendors}
          onBack={() => closeForm('receiving')}
          onSave={async (data) => {
            try {
              await addReceiving(data);
              closeForm('receiving');
            } catch (err) {
              window.alert(err instanceof Error ? err.message : 'Failed to save receiving');
            }
          }}
        />
      );
    }

    if (screen === 'job-orders' && formAction) {
      const record = formAction === 'edit' && recordId
        ? getJobOrderById(recordId)
        : undefined;
      if (formAction === 'edit' && recordId && !record) return null;
      return (
        <JobOrderFormPage
          mode={formAction}
          inventory={inventory}
          units={inventoryData.units}
          customers={customerNames}
          record={record}
          onBack={() => closeForm('job-orders')}
          onAddCustomer={addCustomer}
          onDispatch={async (data) => {
            await addDispatch(data);
          }}
          onConsume={async (jobId, data) => {
            await addJobConsumption(jobId, data);
          }}
          onSave={async (data) => {
            try {
              if (formAction === 'edit' && recordId) {
                await updateJobOrderById(Number(recordId), data);
              } else {
                await addJobOrder(data);
              }
              closeForm('job-orders');
            } catch (err) {
              window.alert(err instanceof Error ? err.message : 'Failed to save job order');
            }
          }}
        />
      );
    }

    if ((screen === 'dispatch' || screen === 'gate-pass') && formAction === 'add') {
      return (
        <DispatchFormPage
          jobOrders={jobOrders}
          onBack={() => closeForm('dispatch')}
          onSave={async (data) => {
            try {
              await addDispatch(data);
              closeForm('dispatch');
            } catch (err) {
              window.alert(err instanceof Error ? err.message : 'Failed to save dispatch');
            }
          }}
        />
      );
    }

    switch (screen) {
      case 'dashboard':
        return <DashboardScreen {...searchProps} />;
      case 'inventory':
        return (
          <InventoryScreen
            {...searchProps}
            onViewStock={(item) => navigate('stock-details', { recordId: item.id })}
            onAdd={() => openForm('inventory', 'add')}
            onEdit={(item) => openForm('inventory', 'edit', item.id)}
          />
        );
      case 'stock-transactions':
        return <StockTransactionsScreen {...searchProps} />;
      case 'purchase-orders':
        return (
          <PurchaseScreen
            {...searchProps}
            onOpenAdd={() => openForm('purchase-orders', 'add')}
            onOpenEdit={(row) => openForm('purchase-orders', 'edit', String(row.id))}
          />
        );
      case 'receiving':
        return (
          <ReceivingScreen
            {...searchProps}
            onOpenAdd={() => openForm('receiving', 'add')}
          />
        );
      case 'job-orders':
        return (
          <JobOrdersScreen
            {...searchProps}
            onOpenAdd={() => openForm('job-orders', 'add')}
            onOpenEdit={(row) => openForm('job-orders', 'edit', String(row.id))}
          />
        );
      case 'dispatch':
      case 'gate-pass':
        return (
          <DispatchScreen
            {...searchProps}
            onOpenAdd={() => openForm('dispatch', 'add')}
          />
        );
      case 'users-access':
        return <UsersAccessScreen {...searchProps} />;
      case 'vendor-payments':
        return <VendorPaymentsScreen {...searchProps} />;
      case 'customer-payments':
        return <CustomerPaymentsScreen {...searchProps} />;
      case 'payments':
        return <VendorPaymentsScreen {...searchProps} />;
      case 'customers':
        if (recordId && !formAction) {
          return (
            <CustomerDetailScreen
              customerId={recordId}
              onBack={() => navigate('customers')}
            />
          );
        }
        return (
          <CustomersScreen
            {...searchProps}
            onOpenDetail={(customer) =>
              navigate('customers', { recordId: String(customer.id) })
            }
          />
        );
      case 'vendors':
        if (recordId && !formAction) {
          return (
            <VendorDetailScreen
              vendorId={recordId}
              onBack={() => navigate('vendors')}
            />
          );
        }
        return (
          <VendorsScreen
            {...searchProps}
            onOpenDetail={(vendor) => navigate('vendors', { recordId: String(vendor.id) })}
          />
        );      case 'accounts':
        return <AccountsScreen {...searchProps} />;
      case 'expenses':
        return <ExpensesScreen {...searchProps} />;
      case 'reports':
        return <ReportsScreen {...searchProps} />;
      // case 'settings':
      //   return <SettingsScreen {...searchProps} />;
      default:
        return <DashboardScreen {...searchProps} />;
    }
  };

  const sidebarScreen =
    screen === 'stock-details' ? 'inventory'
      : screen === 'gate-pass' ? 'dispatch'
        : screen;

  return (
    <div className="erp-shell min-h-screen overflow-x-hidden transition-colors">
      <ErpSidebar
        activeScreen={sidebarScreen}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onScreenChange={handleScreenChange}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div
        className={`min-w-0 px-2 transition-all duration-300 sm:px-3 ${
          sidebarCollapsed ? 'lg:ml-[56px]' : 'lg:ml-[220px]'
        }`}
      >
        <ErpTopBar onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="p-2 sm:p-3">{renderScreen()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ErpProvider>
        <ErpApp />
      </ErpProvider>
    </ThemeProvider>
  );
}
