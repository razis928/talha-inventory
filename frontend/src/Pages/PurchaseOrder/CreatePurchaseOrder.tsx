import CreatePurchaseOrder from "Components/PurchaseOrders/CreatePurchaseOrder";
import * as React from "react";
import Layout from "../../Components/layout";

export const CreatePurchaseOrderPage: React.FC = () => {
  return (
    <Layout title="Create Purchase Order">
      <CreatePurchaseOrder />
    </Layout>
  );
};

export default CreatePurchaseOrderPage;
