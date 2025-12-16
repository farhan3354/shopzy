import React from "react";
import UserManagementTable from "./UserManagementTable";

export default function CustomersTable() {
  return (
    <UserManagementTable
      userRole="user"
      title="All Customers"
      placeholder="Search by name, email, or status..."
    />
  );
}
