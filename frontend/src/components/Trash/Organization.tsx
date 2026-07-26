import { OrganizationPageFilters, OrganizationQueryFilters, QueryPagination } from "Interfaces/QueryFilters";
import * as React from "react";
import OrganizationFilters from "../Admin/Organizations/OrganizationFilters";
import OrganizationTable from "../Admin/Organizations/OrganizationTable";
import { useDebounce } from "Hooks/useDebounce";
import { useOrganizations } from "Hooks/useOrgs";

const OrganizationTrash: React.FC = () => {
  const [queryFilters, setQueryFilters] = React.useState<OrganizationQueryFilters>({});
  const debouncedFilters = useDebounce({ ...queryFilters, is_trash: 1 }, 800);
  const { data: organizations, isLoading } = useOrganizations(debouncedFilters);
  const handleFilters = (search: Partial<OrganizationPageFilters>) => {
    setQueryFilters({ ...search, page: "1", count: "10" });
  };
  const handlePagination = (pagination: Partial<QueryPagination>) => {
    setQueryFilters({ ...queryFilters, ...pagination });
  };
  return (
    <div>
      <OrganizationFilters handleOrganizationFilters={handleFilters} />
      <br />
      <OrganizationTable isLoading={isLoading}
        organizations={organizations}
        handlePagination={handlePagination} />
    </div>
  );
};

export default OrganizationTrash;
