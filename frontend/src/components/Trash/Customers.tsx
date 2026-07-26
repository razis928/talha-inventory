import * as React from "react";
import { useSearchParams } from "react-router-dom";

import { useDebounce } from "Hooks/useDebounce";
import { useCompanies } from "Hooks/useCompanies";
import CustomerFilters from "../Customer/CustomerFilters";
import CustomerTable from "../Customer/CustomerTable";

const CustomersTrash: React.FC = () => {
  const [searchParams] = useSearchParams();
  const debouncedParams = useDebounce(searchParams, 800);

  const { data: companies, isLoading } = useCompanies(debouncedParams);

  return (
    <div>
      <CustomerFilters />
      <br />
      <CustomerTable isLoading={isLoading} companies={companies} />
    </div>
  );
};

export default CustomersTrash;
