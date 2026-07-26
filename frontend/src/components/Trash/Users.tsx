import * as React from "react";
import UsersTable from "../Admin/Users/UsersTable";
import UserFilters from "../Admin/Users/UserFilters";
import { QueryPagination, UserPageFilters } from "Interfaces/QueryFilters";

const UsersTrash: React.FC = () => {
  return (
    <div>
      <UserFilters
        handleUserFilters={function (filters: Partial<UserPageFilters>): void {
          throw new Error("Function not implemented");
        }}
      />
      <br />
      <UsersTable
        users={undefined}
        isLoading={false}
        handlePagination={function (filters: Partial<QueryPagination>): void {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
};

export default UsersTrash;
