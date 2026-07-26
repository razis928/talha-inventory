import * as React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Fallback from "../Components/Fallback";
import { AuthProvider } from "../Context/AuthContext";
import { DrawerProvider } from "../Context/DrawerContext";
import { DashboardPage } from "../Pages/Dashboard";
import { LoginPage } from "../Pages/Login";
import { ProtectedPage } from "../PrivateRoute";
import "react-toastify/dist/ReactToastify.css";
import ViewReportPdf from "Pages/Reports/ViewReportPdf";
import ReportListCsv from "Pages/Reports/ReportListCsv";
import EditUserPage from "Pages/Admin/Users/EditUserPage";

// Lazy load the routes to reduce the bundle size
const CustomersPage = React.lazy(() => import("../Pages/Customers"));
const AddCustomersPage = React.lazy(() => import("Pages/CreateCustomer"));
const ViewCustomerPage = React.lazy(() => import("../Pages/Customers/ViewCustomer"));
const CreateContact = React.lazy(() => import("../Pages/Customers/CreateContact"));
const EditContact = React.lazy(() => import("../Pages/Customers/EditContact"));
const PurchaseOrders = React.lazy(() => import("../Pages/PurchaseOrder/PurchaseOrder"));
const CreatePurchaseOrderPage = React.lazy(
  () => import("../Pages/PurchaseOrder/CreatePurchaseOrder")
);
const Prescriptions = React.lazy(() => import("../Pages/Prescriptions/Prescriptions"));
const ViewPrescription = React.lazy(
  () => import("../Pages/Prescriptions/ViewPrescription")
);
const ApprovedUsers = React.lazy(() => import("../Pages/ApprovedUsers/ApprovedUsers"));
const OrdersPage = React.lazy(() => import("../Pages/Orders"));
const OrderDetailsPage = React.lazy(() => import("Pages/TakeOrder/OrderDetailsPage"));
const TakeOrder = React.lazy(() => import("../Pages/TakeOrder"));

const ProductsPage = React.lazy(() => import("../Pages/Products"));
const EditProductPage = React.lazy(() => import("../Pages/Products/EditProduct"));

const AdminVendors = React.lazy(() => import("../Pages/Admin/Vendors/Vendors"));
const CreateVendors = React.lazy(() => import("../Pages/Admin/Vendors/CreateVendor"));

const AdminUsers = React.lazy(() => import("../Pages/Admin/Users/Users"));
const CreateUsers = React.lazy(() => import("../Pages/Admin/Users/CreateUser"));
const ViewUserPage = React.lazy(() => import("../Pages/Admin/Users/ViewUser"));
const AdminBrands = React.lazy(() => import("../Pages/Admin/Brands/Brands"));
const CreateBrands = React.lazy(() => import("../Pages/Admin/Brands/CreateBrand"));
const ViewBrandPage = React.lazy(() => import("../Pages/Admin/Brands/ViewBrand"));
const AdminWarehouses = React.lazy(() => import("../Pages/Admin/Warehouse/Warehouse"));
const AddWarehouse = React.lazy(() => import("../Pages/Admin/Warehouse/CreateWarehouse"));
const ViewVendorPage = React.lazy(() => import("../Pages/Admin/Vendors/ViewVendor"));
const ViewWarehousePage = React.lazy(
  () => import("../Pages/Admin/Warehouse/ViewWarehouse")
);

const TrashPage = React.lazy(() => import("../Pages/Trash"));

const AdminOrganization = React.lazy(
  () => import("../Pages/Admin/Organizations/Organizations")
);
const CreateOrganizationPage = React.lazy(
  () => import("../Pages/Admin/Organizations/CreateOrganization")
);
// const EditOrganizationPage = React.lazy(
//   () => import("Pages/Admin/Organizations/EditOrganizationPage")
// );
const ViewOrganizationPage = React.lazy(
  () => import("../Pages/Admin/Organizations/ViewOrganization")
);
const ReportsPage = React.lazy(() => import("../Pages/Reports"));
const ReportPage = React.lazy(() => import("../Pages/Reports/Report"));
const CreateFilter = React.lazy(() => import("../Pages/Reports/CreateFilter"));
const MyInventory = React.lazy(() => import("../Pages/Admin/MyInventory/MyInventory"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true
    }
  }
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-center"
        theme="colored"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        limit={1}
      />
      <AuthProvider>
        <DrawerProvider>
          <BrowserRouter>
            <React.Suspense fallback={<Fallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedPage />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/:id" element={<OrderDetailsPage />} />
                  <Route path="take-order" element={<TakeOrder />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="customers/:id" element={<AddCustomersPage />} />
                  <Route path="customer-details/:id" element={<ViewCustomerPage />} />
                  <Route path="customers/:id/contact" element={<CreateContact />} />
                  <Route
                    path="customers/:id/contact/:contactId"
                    element={<CreateContact />}
                  />
                  <Route path="purchase-orders" element={<PurchaseOrders />} />
                  <Route
                    path="purchase-orders/create"
                    element={<CreatePurchaseOrderPage />}
                  />
                  <Route path="prescriptions" element={<Prescriptions />} />
                  <Route path="prescriptions/view" element={<ViewPrescription />} />
                  <Route path="approved-users" element={<ApprovedUsers />} />
                  <Route path="customers/contact/:id" element={<EditContact />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/edit/:id" element={<EditProductPage />} />
                  <Route path="admin/vendors" element={<AdminVendors />} />
                  <Route path="admin/vendor/create" element={<CreateVendors />} />
                  <Route path="admin/vendor/view/:id" element={<ViewVendorPage />} />
                  <Route path="admin/users" element={<AdminUsers />} />

                  <Route path="admin/user/create" element={<CreateUsers />} />

                  <Route path="admin/user/view" element={<ViewUserPage />} />

                  <Route path="admin/user/edit/:id" element={<EditUserPage />} />

                  <Route path="admin/brands" element={<AdminBrands />} />

                  <Route path="admin/brand/create" element={<CreateBrands />} />

                  <Route path="admin/brand/view" element={<ViewBrandPage />} />

                  <Route path="admin/organizations" element={<AdminOrganization />} />

                  <Route path="admin/warehouses" element={<AdminWarehouses />} />

                  <Route
                    path="admin/warehouse/create"
                    element={<AddWarehouse title="Add Warehouse" />}
                  />
                  <Route
                    path="admin/warehouse/update/:id"
                    element={<AddWarehouse title="Edit Warehouse" />}
                  />

                  <Route
                    path="admin/warehouse/view/:id"
                    element={<ViewWarehousePage />}
                  />

                  <Route
                    path="admin/organizations/create"
                    element={<CreateOrganizationPage />}
                  />

                  <Route
                    path="admin/organizations/:id"
                    element={<ViewOrganizationPage />}
                  />

                  <Route path="reports" element={<ReportsPage />} />

                  <Route path="reports/pdf/:id" element={<ViewReportPdf />} />

                  <Route path="reports/csv/:id" element={<ReportListCsv />} />

                  <Route path="reports/:id" element={<ReportPage />} />

                  <Route path="trash" element={<TrashPage />} />

                  <Route path="reports/:id/filter/create/" element={<CreateFilter />} />

                  <Route path="admin/my-inventory" element={<MyInventory />} />
                </Route>
              </Routes>
            </React.Suspense>
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          </BrowserRouter>
        </DrawerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
