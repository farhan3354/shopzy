import React, { useState, useEffect } from "react";
import {
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiPackage,
  FiShoppingBag,
  FiClock,
  FiChevronRight,
  FiActivity,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import api from "../../../utils/api";
import { ORDER_ROUTES, PRODUCT_ROUTES, USER_ROUTES } from "../../../utils/apiRoute";

const COLORS = ["#4A90E2", "#FFD166", "#06D6A0", "#EF476F", "#118AB2"];

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:shadow-md">
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1 font-['Outfit']">{title}</p>
      <h3 className="text-2xl font-bold text-black font-['Outfit']">{value}</h3>
      {trend && (
        <div className={`flex items-center mt-2 text-xs font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          <FiTrendingUp className={`mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
          <span>{Math.abs(trend)}% from last month</span>
        </div>
      )}
    </div>
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
      <Icon size={24} className={color === 'bg-blue-500' ? 'text-[#4A90E2]' : color === 'bg-yellow-500' ? 'text-[#FFD166]' : ''} />
    </div>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orderCount: 0,
    averageOrderValue: 0,
    customerCount: 0,
    productCount: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch Analytics
        const analyticsRes = await api.get(ORDER_ROUTES.analytics);
        if (analyticsRes.data.success) {
          const { overview, statusDistribution, monthlyRevenue } = analyticsRes.data.data;
          
          setStats(prev => ({
            ...prev,
            totalRevenue: overview.totalRevenue,
            orderCount: overview.orderCount,
            averageOrderValue: overview.averageOrderValue,
          }));

          // Format chart data
          const formattedChart = monthlyRevenue.map(item => ({
            name: `${item._id.month}/${item._id.year}`,
            revenue: item.revenue,
            orders: item.orders,
          }));
          setChartData(formattedChart);

          // Format status distribution
          const formattedStatus = statusDistribution.map(item => ({
            name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            value: item.count,
          }));
          setStatusData(formattedStatus);
        }

        // Fetch Recent Orders
        const recentRes = await api.get(ORDER_ROUTES.recent);
        if (recentRes.data.success) {
          setRecentOrders(recentRes.data.data);
        }

        // Fetch Total Customers
        const customersRes = await api.get(USER_ROUTES.customers);
        if (customersRes.data.success) {
          const totalCustomers = (customersRes.data.customer || []).filter(
            (u) => u.userRole === "user"
          ).length;
          setStats((prev) => ({
            ...prev,
            customerCount: totalCustomers,
          }));
        }

        // Fetch Total Products
        const productsRes = await api.get(PRODUCT_ROUTES.all);
        if (productsRes.data.success) {
          setStats(prev => ({
            ...prev,
            productCount: productsRes.data.products?.length || 0,
          }));
        }

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A90E2]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black font-['Outfit'] mb-2">Dashboard Overview</h1>
        <p className="text-gray-500 font-['Outfit'] tracking-wide">Welcome back to Marotix admin panel.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          icon={FiDollarSign} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orderCount.toLocaleString()} 
          icon={FiShoppingBag} 
          color="bg-yellow-500"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.customerCount.toLocaleString()} 
          icon={FiUsers} 
          color="bg-green-500"
        />
        <StatCard 
          title="Total Products" 
          value={stats.productCount.toLocaleString()} 
          icon={FiPackage} 
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-black font-['Outfit']">Revenue Trend</h3>
            <div className="flex items-center text-xs font-medium text-gray-400">
              <span className="flex items-center mr-4"><div className="w-3 h-3 rounded-full bg-[#4A90E2] mr-2"></div> Revenue</span>
            </div>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4A90E2" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm italic font-['Outfit']">No revenue data available for this period.</div>
            )}
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-black font-['Outfit'] mb-6">Order Status</h3>
          <div className="h-[250px] relative flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm italic font-['Outfit'] text-center">No status data available.</div>
            )}
          </div>
          {statusData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {statusData.map((item, index) => (
                <div key={item.name} className="flex items-center text-xs">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-600 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-black font-['Outfit']">Recent Orders</h3>
          <button className="text-[#4A90E2] text-sm font-semibold flex items-center hover:underline">
            View All <FiChevronRight className="ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#4A90E2]">#{order.orderNumber || order._id.slice(-6)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-black">{order.userId?.name || 'Guest'}</span>
                      <span className="text-xs text-gray-400">{order.userId?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-black">
                    ${order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' :
                      order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-[#4A90E2]'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400 italic">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
