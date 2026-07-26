import * as React from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "Components/layout";
import { NavBar } from "Components/Navbar";
import OrderFilters from "Components/Orders/OrderFilters";
import OrderTable from "Components/Orders/OrderTable";
import { useOrders } from "Hooks/useOrders";

import { useDebounce } from "Hooks/useDebounce";

const OrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const debouncedParams = useDebounce(searchParams, 800);
  const { data: orders, isLoading } = useOrders(debouncedParams);

  return (
    <Layout title="Orders">
      <NavBar pageTitle="Orders"></NavBar>
      <div style={{ padding: 30 }}>
        <OrderFilters />
        <br />
        <OrderTable isLoading={isLoading} orders={orders} />
      </div>
    </Layout>
  );
};

export default OrdersPage;
