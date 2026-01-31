import React from "react";
import UserManagementTable from "./UserManagementTable";

export default function CustomersTable() {
  return (
    <UserManagementTable className="mt-2 bg-white"
      userRole="user"
      title="All Customers"
      placeholder="Search by name, email, or status..."
    />
  );
}
