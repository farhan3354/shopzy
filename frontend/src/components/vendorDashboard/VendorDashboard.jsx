import React, { useState } from "react";
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "./StatCard";

export default function VendorDashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  const statsData = {
    revenue: 45678.9,
    orders: 1234,
    products: 89,
    customers: 567,
  };

  const salesData = [
    { date: "Mon", sales: 4200 },
    { date: "Tue", sales: 3800 },
    { date: "Wed", sales: 5100 },
    { date: "Thu", sales: 4600 },
    { date: "Fri", sales: 6200 },
    { date: "Sat", sales: 7800 },
    { date: "Sun", sales: 5900 },
  ];

  const categoryData = [
    { name: "Electronics", value: 45, color: "#3B82F6" },
    { name: "Clothing", value: 30, color: "#10B981" },
    { name: "Books", value: 15, color: "#F59E0B" },
    { name: "Home & Garden", value: 10, color: "#EF4444" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Vendor Dashboard
            </h1>
            <p className="text-gray-600 text-sm">Store performance overview</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Revenue" value={statsData.revenue} prefix="$" />
          <StatCard title="Orders" value={statsData.orders} />
          <StatCard title="Products" value={statsData.products} />
          <StatCard title="Customers" value={statsData.customers} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sales Overview
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sales by Category
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
