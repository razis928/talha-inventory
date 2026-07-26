import * as React from "react";
import Layout from "Components/layout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NavBar } from "Components/Navbar";
import Button from "Components/Button";
import MuiIcon from "Components/icons/MuiIcons";
import VendorFilters from "Components/Admin/Vendors/VendorFilters";
import { useVendors } from "Hooks/useVendors";
import { useDebounce } from "Hooks/useDebounce";
import VendorsTable from "Components/Admin/Vendors/VendorsTable";

export const AdminVendors: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const debouncedParams = useDebounce(searchParams, 800);
  const { data: vendors, isLoading } = useVendors(debouncedParams);
  return (
    <Layout title="Vendor">
      <NavBar pageTitle="Vendors">
        <Button
          onClick={() => navigate("/admin/vendor/create")}
          icon={<MuiIcon icon="add" />}
          variant="contained"
          text="Add Vendor"
        />
      </NavBar>
      <div style={{ padding: 30 }}>
        <VendorFilters />
        <br />
        <VendorsTable isLoading={isLoading} vendors={vendors} />
      </div>
    </Layout>
  );
};
export default AdminVendors;
