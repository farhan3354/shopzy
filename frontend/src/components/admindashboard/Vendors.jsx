import React from "react";
import UserManagementTable from "./UserManagementTable";

export default function Vendor() {
  return (
    <UserManagementTable
      userRole="vendor"
      title="All Vendors"
      placeholder="Search by name, email, or status..."
    />
  );
}
