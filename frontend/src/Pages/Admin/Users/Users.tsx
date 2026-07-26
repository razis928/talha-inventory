import * as React from "react";
import Layout from "Components/layout";
import { useNavigate } from "react-router-dom";
import { NavBar } from "Components/Navbar";
import UserFilters from "Components/Admin/Users/UserFilters";
import {
  UserPageFilters,
  UserQueryFilters,
  QueryPagination
} from "Interfaces/QueryFilters";
import UsersTable from "Components/Admin/Users/UsersTable";
import Button from "Components/Button";
import MuiIcon from "Components/icons/MuiIcons";
import { useDebounce } from "Hooks/useDebounce";
import { useUsers } from "Hooks/useUsers";

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [queryFilters, setQueryFilters] = React.useState<UserQueryFilters>({
    count: "10"
  });
  const debouncedFilters = useDebounce(queryFilters, 800);
  const { data: users, isLoading, refetch } = useUsers(debouncedFilters);

  const handleUserFilters = (search: Partial<UserPageFilters>) => {
    setQueryFilters({ ...search, page: "1", count: "10" });
  };

  const handlePaginationChange = (pagination: Partial<QueryPagination>) => {
    setQueryFilters({ ...queryFilters, ...pagination });
  };

  return (
    <Layout title="Users">
      <NavBar pageTitle="Users">
        <Button
          onClick={() => navigate("/admin/user/create")}
          icon={<MuiIcon icon="add" />}
          variant="contained"
          text="Create User"
        />
      </NavBar>
      <div style={{ padding: 30 }}>
        <UserFilters onSearch={refetch} handleUserFilters={handleUserFilters} />
        <br />
        <UsersTable
          isLoading={isLoading}
          users={users}
          handlePagination={handlePaginationChange}
        />
      </div>
    </Layout>
  );
};

export default AdminUsers;
