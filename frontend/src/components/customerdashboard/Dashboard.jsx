import React from "react";
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

export default function Dashboard() {
  const userData = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    joinDate: "January 15, 2022",
    orders: 12,
    totalSpent: "$1,845.00",
  };

  const recentOrders = [
    {
      id: "ORD-1234",
      date: "Oct 12, 2023",
      status: "Delivered",
      total: "$149.99",
      items: 3,
    },
    {
      id: "ORD-1233",
      date: "Oct 5, 2023",
      status: "Delivered",
      total: "$89.99",
      items: 2,
    },
    {
      id: "ORD-1232",
      date: "Sep 28, 2023",
      status: "Processing",
      total: "$245.50",
      items: 1,
    },
    {
      id: "ORD-1231",
      date: "Sep 15, 2023",
      status: "Shipped",
      total: "$599.99",
      items: 4,
    },
  ];

  const stats = [
    {
      title: "Total Orders",
      value: 12,
      change: "+2",
      changeType: "up",
      icon: <FiPackage className="text-blue-500" />,
    },
    {
      title: "Pending Orders",
      value: 1,
      change: "-1",
      changeType: "down",
      icon: <FiTruck className="text-yellow-500" />,
    },
    {
      title: "Delivered Orders",
      value: 9,
      change: "+3",
      changeType: "up",
      icon: <FiCheckCircle className="text-green-500" />,
    },
    {
      title: "Total Spent",
      value: "$1,845.00",
      change: "+$245.50",
      changeType: "up",
      icon: <FiDollarSign className="text-purple-500" />,
    },
  ];

  const quickActions = [
    {
      title: "My Profile",
      icon: <FiUser className="text-blue-500" />,
      link: "/profile",
    },
    {
      title: "My Orders",
      icon: <FiPackage className="text-green-500" />,
      link: "/orders",
    },
    {
      title: "My Wishlist",
      icon: <FiHeart className="text-red-500" />,
      link: "/wishlist",
    },
    {
      title: "Addresses",
      icon: <FiMapPin className="text-yellow-500" />,
      link: "/addresses",
    },
    {
      title: "Payment Methods",
      icon: <FiDollarSign className="text-purple-500" />,
      link: "/payments",
    },
    {
      title: "Account Settings",
      icon: <FiSettings className="text-gray-500" />,
      link: "/settings",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
              <div
                className={`mt-4 flex items-center text-sm ${
                  stat.changeType === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.changeType === "up" ? (
                  <FiArrowUp className="mr-1" />
                ) : (
                  <FiArrowDown className="mr-1" />
                )}
                <span>{stat.change} from last month</span>
              </div>
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
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <div key={order.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Placed on {order.date}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
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
                ))}
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
