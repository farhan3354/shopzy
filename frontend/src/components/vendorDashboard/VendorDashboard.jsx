import React, { useState, useEffect } from "react";
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
import api from "../../../utils/api"
import { useSelector } from "react-redux"

export default function VendorDashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [analyticsRes, productsRes] = await Promise.all([
          api.get("/getall-orders/orders/vendor/analytics", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          api.get("/products/vendor", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (analyticsRes.data.success) {
          setStats(analyticsRes.data.data.stats);
          setSalesData(analyticsRes.data.data.salesData);
          setCategoryData(analyticsRes.data.data.categoryData || []);
        }

        if (productsRes.data.success) {
          const lowStock = productsRes.data.products.filter(p => p.stock < 10);
          setLowStockProducts(lowStock.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

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
          <StatCard title="Revenue" value={stats.revenue} prefix="₹" />
          <StatCard title="Orders" value={stats.orders} />
          <StatCard title="Products" value={stats.products} />
          <StatCard title="Customers" value={stats.customers} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sales Overview
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => value.split("-").slice(1).join("/")} />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, "Sales"]} />
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
              {categoryData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No category data available
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Low Stock Alerts
              </h3>
              <a href="/vendor/products" className="text-sm text-blue-600 hover:underline">View all products</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 object-cover rounded shadow-sm bg-white" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{product.name}</p>
                    <p className="text-xs text-red-600 font-bold">{product.stock} items left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

