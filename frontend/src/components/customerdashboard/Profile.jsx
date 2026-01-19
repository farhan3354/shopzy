import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    joinDate: "",
    avatar: "https://via.placeholder.com/150", 
    orders: 0,
    totalSpent: "$0.00",
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [profileRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/profile`, config),
        axios.get(`${API_URL}/user/my-orders`, config)
      ]);

      const user = profileRes.data.user;
      const allOrders = ordersRes.data.data;
      
      const totalSpent = allOrders
        .filter(o => o.orderStatus !== 'cancelled')
        .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

      setUserData({
        name: user.name,
        email: user.email,
        phone: user.phone || "N/A",
        joinDate: new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        avatar: user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        orders: allOrders.length,
        totalSpent: `$${totalSpent.toFixed(2)}`
      });

      setOrders(allOrders.slice(0, 5).map(order => ({
        id: order._id,
        displayId: order.orderNumber || order._id.slice(-6).toUpperCase(),
        date: new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        status: order.orderStatus,
        total: `$${(order.totalAmount || 0).toFixed(2)}`
      })));

      setLoading(false);
    } catch (error) {
      console.error("Error loading profile:", error);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

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
                {/* <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Edit
                </button> */}
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
                <a href="/user-dashboard/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  View all
                </a>
              </div>
              <div className="px-6 py-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        {/* <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th> */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.displayId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize 
                              ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : ["processing", "pending"].includes(order.status)
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
                          {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-4">
                              View
                            </a>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
