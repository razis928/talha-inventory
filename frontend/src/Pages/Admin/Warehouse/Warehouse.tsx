import * as React from "react";
import Layout from "Components/layout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NavBar } from "Components/Navbar";
import Button from "Components/Button";
import MuiIcon from "Components/icons/MuiIcons";
import WarehouseFilters from "Components/Admin/Warehouse/WarehouseFilters";
import { useDebounce } from "Hooks/useDebounce";
import { useWarehouses } from "Hooks/useWarehouses";
import WarehousesTable from "Components/Admin/Warehouse/WarehouseTable";

export const AdminWarehouses: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const debouncedParams = useDebounce(searchParams, 800);

  const { data: warehouses, isLoading } = useWarehouses(debouncedParams);

  return (
    <Layout title="Warehouse">
      <NavBar pageTitle="Warehouses">
        <Button
          onClick={() => navigate("/admin/warehouse/create")}
          icon={<MuiIcon icon="add" />}
          variant="contained"
          text="Add WareHouse"
        />
      </NavBar>
      <div style={{ padding: 30 }}>
        <WarehouseFilters />
        <br />
        <WarehousesTable isLoading={isLoading} warehouses={warehouses} />
      </div>
    </Layout>
  );
};
export default AdminWarehouses;
