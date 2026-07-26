import * as React from "react";
import { useParams } from "react-router-dom";
import Layout from "Components/layout";
import CustomerInfoDisplay from "Components/TakeOrder/CustomerInfo";
import LineItemTable from "Components/TakeOrder/LineItemTable";
import PaymentHistory from "Components/HistoryTables/Payment";
import ShipmentHistory from "Components/HistoryTables/Shipment";
import ReturnHistory from "Components/HistoryTables/Return";
import RefundHistory from "Components/HistoryTables/Refund";
import OrderDetails from "Components/TakeOrder/OrderDetails";
import { NavBar } from "Components/Navbar";
import Stepper from "Components/TakeOrder/Stepper";
import { CompanyData } from "Interfaces/Company";
import { useOrder } from "Hooks/useOrders";
import { OrderData } from "Interfaces/Order";
import { useCompany } from "Hooks/useCompanies";
import { OrderProvider } from "Context/OrderContext";

export const OrderDetailsPage: React.FC = () => {
  const { id: orderId } = useParams<"id">();
  const { data: orderData } = useOrder(orderId as string);
  const { data: customer } = useCompany(orderData?.company_id || "");
  const addedPayments = orderData?.payments ? orderData.payments.length > 0 : false;
  const addedShipments = orderData?.product_shippings
    ? orderData.product_shippings.length > 0
    : false;
  return (
    <Layout title="Order Details">
      <OrderProvider>
        <NavBar pageTitle="Edit Order" />

        <div style={{ padding: 30 }}>
          <Stepper
            selectedCustomer={true}
            addedShipments={addedShipments}
            addedPayments={addedPayments}
          />
          <br />
          <OrderDetails
            order={orderData || ({} as OrderData)}
            customer={customer || ({} as CompanyData)}
          />
          <br />
          <CustomerInfoDisplay
            order={orderData || ({} as OrderData)}
            customer={customer || ({} as CompanyData)}
          />
          <br />
          <LineItemTable
            order={orderData || ({} as OrderData)}
            customer={customer || ({} as CompanyData)}
          />
          <br />
          <PaymentHistory order={orderData || ({} as OrderData)} />
          <br />
          <ShipmentHistory order={orderData || ({} as OrderData)} />
          <br />
          <ReturnHistory order={orderData || ({} as OrderData)} />
          <br />
          <RefundHistory order={orderData || ({} as OrderData)} />
        </div>
      </OrderProvider>
    </Layout>
  );
};

export default OrderDetailsPage;
