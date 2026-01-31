import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SearchBar from "./../common/SearchBar";
import { UsersLoading } from "../common/LoadingSpinner";
import useFetchData from "../../hooks/useFetchData";
import { USER_ROUTES } from "../../../utils/apiRoute";

export default function UserManagementTable({
  userRole,
  title,
  placeholder = "Search by name, email, or status...",
}) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const token = useSelector((state) => state.auth.token);

  const { fetchData, updateData, loading, error } = useFetchData(token);
  const fetchUsers = async () => {
    await fetchData(USER_ROUTES.customers, (data) => {
      if (data.success) {
        const filteredUsers = data.customer.filter(
          (user) => user.userRole === userRole
        );
        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers);
      }
    });
  };

  const changeUserStatus = async (id, status) => {
    try {
      await updateData(
        USER_ROUTES.changeStatus(id),
        { status },
        `User ${status === "active" ? "activated" : "blocked"} successfully!`
      );
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, userStatus: status } : user
        )
      );
      setFilteredUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, userStatus: status } : user
        )
      );
    } catch (err) {
      console.error("Error changing user status:", err, error);
    }
  };

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(lower) ||
        user.email?.toLowerCase().includes(lower) ||
        user.userStatus?.toLowerCase().includes(lower)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  useEffect(() => {
    fetchUsers();
  }, [userRole]);

  if (loading) return <UsersLoading userType={title} />;

  const StatusBadge = ({ status }) => (
    <span
      className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
        status === "active"
          ? "bg-green-100 text-green-800"
          : status === "blocked"
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {status}
    </span>
  );

  const RoleBadge = ({ role }) => (
    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wide border border-gray-200">
      {role}
    </span>
  );

  const ActionButtons = ({ user }) => (
    <div className="flex gap-2">
      <button
        onClick={() => changeUserStatus(user._id, "active")}
        disabled={user.userStatus === "active"}
        className={`px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors ${
          user.userStatus === "active"
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-900 text-white hover:bg-gray-800"
        }`}
      >
        Activate
      </button>
      <button
        onClick={() => changeUserStatus(user._id, "blocked")}
        disabled={user.userStatus === "blocked"}
        className={`px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors border ${
          user.userStatus === "blocked"
             ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
             : "bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        }`}
      >
        Block
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-tight">
            {title}
          </h2>

          <div className="w-full sm:w-64 lg:w-80">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder={placeholder}
            />
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto bg-white border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-900 uppercase tracking-wider text-xs">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 uppercase tracking-wider text-xs">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 uppercase tracking-wider text-xs">
                  Phone
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 uppercase tracking-wider text-xs">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 uppercase tracking-wider text-xs">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 uppercase tracking-wider text-xs">
                  Created
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 uppercase tracking-wider text-xs">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600">{user.phone}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.userStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.userRole} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons user={user} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500 italic"
                  >
                    No {title.toLowerCase()} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="hidden md:block lg:hidden overflow-x-auto bg-white border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-900 uppercase text-xs tracking-wider">
                  {userRole === "vendor" ? "Vendor" : "User"}
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-900 uppercase text-xs tracking-wider">
                  Contact
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-900 uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-900 uppercase text-xs tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          <RoleBadge role={user.userRole} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">
                          {user.phone}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={user.userStatus} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <ActionButtons user={user} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-3 py-4 text-center text-gray-500"
                  >
                    No {title.toLowerCase()} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white border border-gray-200 p-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <RoleBadge role={user.userRole} />
                        <StatusBadge status={user.userStatus} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-500">Email:</span>
                      <span className="text-gray-900 break-all">
                        {user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-500">Phone:</span>
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-500">Joined:</span>
                      <span className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => changeUserStatus(user._id, "active")}
                      className="flex-1 px-3 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors uppercase tracking-wider"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => changeUserStatus(user._id, "blocked")}
                      className="flex-1 px-3 py-2 bg-white text-gray-900 border border-gray-900 text-sm font-medium hover:bg-gray-100 transition-colors uppercase tracking-wider"
                    >
                      Block
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 p-6 text-center">
              <p className="text-gray-500">No {title.toLowerCase()} found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
