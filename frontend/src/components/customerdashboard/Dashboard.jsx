import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiDollarSign,
  FiUser,
  FiHeart,
  FiMapPin,
  FiSettings,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    joinDate: "",
    orders: 0,
    totalSpent: "$0.00",
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState([
    {
      title: "Total Orders",
      value: 0,
      change: "+0",
      changeType: "up",
      icon: <FiPackage className="text-blue-500" />,
    },
    {
      title: "Pending Orders",
      value: 0,
      change: "0",
      changeType: "neutral",
      icon: <FiTruck className="text-yellow-500" />,
    },
    {
      title: "Delivered Orders",
      value: 0,
      change: "+0",
      changeType: "up",
      icon: <FiCheckCircle className="text-green-500" />,
    },
    {
      title: "Total Spent",
      value: "$0.00",
      change: "+$0.00",
      changeType: "up",
      icon: <FiDollarSign className="text-purple-500" />,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

  const quickActions = [
    {
      title: "My Profile",
      icon: <FiUser className="text-blue-500" />,
      link: "profile",
    },
    {
      title: "My Orders",
      icon: <FiPackage className="text-green-500" />,
      link: "orders",
    },
    {
      title: "My Wishlist",
      icon: <FiHeart className="text-red-500" />,
      link: "wishlist",
    },
    {
      title: "Support",
      icon: <FiSettings className="text-gray-500" />,
      link: "support",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [profileRes, ordersRes] = await Promise.all([
          axios.get(`${API_URL}/profile`, config),
          axios.get(`${API_URL}/user/my-orders`, config),
        ]);

        const profile = profileRes.data.user;
        const orders = ordersRes.data.data;

        // Process Orders logic
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((o) =>
          ["pending", "processing"].includes(o.orderStatus)
        ).length;
        const deliveredOrders = orders.filter(
          (o) => o.orderStatus === "delivered"
        ).length;
        const totalSpent = orders
            .filter(o => o.orderStatus !== 'cancelled')
            .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

        setUserData({
          name: profile.name,
          email: profile.email,
          joinDate: new Date(profile.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          orders: totalOrders,
          totalSpent: `$${totalSpent.toFixed(2)}`,
        });

        // Update Stats
        setStats([
          {
            title: "Total Orders",
            value: totalOrders,
            change: "0", // Logic for change can be added if historical data exists
            changeType: "neutral",
            icon: <FiPackage className="text-blue-500" />,
          },
          {
            title: "Pending Orders",
            value: pendingOrders,
            change: "0",
            changeType: "neutral",
            icon: <FiTruck className="text-yellow-500" />,
          },
          {
            title: "Delivered Orders",
            value: deliveredOrders,
            change: "0",
            changeType: "neutral",
            icon: <FiCheckCircle className="text-green-500" />,
          },
          {
            title: "Total Spent",
            value: `$${totalSpent.toFixed(2)}`,
            change: "0",
            changeType: "neutral",
            icon: <FiDollarSign className="text-purple-500" />,
          },
        ]);

        // Recent Orders
        setRecentOrders(
          orders.slice(0, 5).map((order) => ({
            id: order._id,
            displayId: order.orderNumber || order._id.slice(-6).toUpperCase(),
            date: new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            status: order.orderStatus,
            total: `$${(order.totalAmount || 0).toFixed(2)}`,
            items: order.items.length,
          }))
        );

        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {userData.name}!
          </h2>
          <p className="opacity-90">
            Here's what's happening with your orders and account today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-opacity-20 bg-blue-100">
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
              {/* Change indicator removed for simplicity as backend doesn't support history comparison yet */}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Orders
                </h3>
                <Link to="orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all
               </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            #{order.displayId}
                          </p>
                          <p className="text-sm text-gray-500">
                            Placed on {order.date}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {order.items} item{order.items !== 1 ? "s" : ""}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.total}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-4 text-center text-gray-500">
                    No recent orders found.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <a
                      key={index}
                      href={action.link}
                      className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
                    >
                      <div className="p-2 rounded-full bg-gray-100 mb-2">
                        {action.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700 text-center">
                        {action.title}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
