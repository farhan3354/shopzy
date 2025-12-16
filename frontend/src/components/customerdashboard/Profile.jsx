import React, { useState } from "react";

export default function Profile() {
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    joinDate: "January 15, 2022",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    orders: 12,
    totalSpent: "$1,845.00",
  });

  const [orders, setOrders] = useState([
    {
      id: "#ORD-1234",
      date: "Oct 12, 2023",
      status: "Delivered",
      total: "$149.99",
    },
    {
      id: "#ORD-1233",
      date: "Oct 5, 2023",
      status: "Delivered",
      total: "$89.99",
    },
    {
      id: "#ORD-1232",
      date: "Sep 28, 2023",
      status: "Processing",
      total: "$245.50",
    },
    {
      id: "#ORD-1231",
      date: "Sep 15, 2023",
      status: "Delivered",
      total: "$599.99",
    },
  ]);

  //   const [addresses, setAddresses] = useState([
  //     {
  //       id: 1,
  //       name: "Home",
  //       street: "123 Main Street",
  //       city: "New York",
  //       state: "NY",
  //       zip: "10001",
  //       isDefault: true,
  //     },
  //     {
  //       id: 2,
  //       name: "Work",
  //       street: "456 Office Blvd",
  //       city: "New York",
  //       state: "NY",
  //       zip: "10002",
  //       isDefault: false,
  //     },
  //   ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4">
            <div className="bg-white min-h-56 shadow rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={userData.avatar}
                  alt={userData.name}
                />
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {userData.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Member since {userData.joinDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Account Summary
              </h3>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Orders</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {userData.orders}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Total Spent</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {userData.totalSpent}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="w-full md:w-3/4">
            <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Profile Information
                </h3>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Edit
                </button>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Full name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {userData.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Email address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {userData.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Phone number
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {userData.phone}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Member since
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {userData.joinDate}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Orders
                </h3>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  View all
                </button>
              </div>
              <div className="px-6 py-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Order ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "Processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a
                              href="#"
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              View
                            </a>
                            <a
                              href="#"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Reorder
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Saved Addresses
                </h3>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Add new address
                </button>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border rounded-lg p-4 relative"
                    >
                      {address.isDefault && (
                        <span className="absolute top-2 right-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Default
                        </span>
                      )}
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        {address.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {address.street}
                        <br />
                        {address.city}, {address.state} {address.zip}
                      </p>
                      <div className="mt-4 flex space-x-4">
                        <button className="text-sm text-indigo-600 hover:text-indigo-500">
                          Edit
                        </button>
                        {!address.isDefault && (
                          <button className="text-sm text-indigo-600 hover:text-indigo-500">
                            Set as default
                          </button>
                        )}
                        {!address.isDefault && (
                          <button className="text-sm text-red-600 hover:text-red-500">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
