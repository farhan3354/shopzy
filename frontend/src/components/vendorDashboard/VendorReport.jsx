import React, { useState, useEffect } from "react";
import {
  FiShoppingBag,
  FiBarChart2,
  FiDollarSign,
  FiTrendingUp,
  FiDownload,
} from "react-icons/fi";

const VendorReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const topProducts = [
    { id: 1, name: "Wireless Headphones", sales: 120, revenue: 11998.8 },
    { id: 2, name: "Running Shoes", sales: 85, revenue: 6799.15 },
    { id: 3, name: "Smart Watch", sales: 65, revenue: 12999.35 },
    { id: 4, name: "Cotton T-Shirt", sales: 142, revenue: 3548.58 },
    { id: 5, name: "Leather Wallet", sales: 78, revenue: 3899.22 },
  ];

  const categoryRevenue = [
    { category: "Electronics", revenue: 28500, percentage: 65 },
    { category: "Clothing", revenue: 8500, percentage: 19 },
    { category: "Footwear", revenue: 4800, percentage: 11 },
    { category: "Accessories", revenue: 2200, percentage: 5 },
  ];

  const salesData = [
    { day: "Mon", sales: 1200 },
    { day: "Tue", sales: 1900 },
    { day: "Wed", sales: 1500 },
    { day: "Thu", sales: 2100 },
    { day: "Fri", sales: 1800 },
    { day: "Sat", sales: 2500 },
    { day: "Sun", sales: 2200 },
  ];

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
    setEndDate(lastDayOfMonth.toISOString().split("T")[0]);
  }, []);

  const generateReport = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReportData({
        totalRevenue: 43700,
        totalOrders: 245,
        averageOrderValue: 178.36,
        topProducts,
        categoryRevenue,
        salesData,
      });
      setIsLoading(false);
    }, 1500);
  };

  const exportReport = () => {
    // In a real application, this would generate a CSV or PDF
    alert("Report exported successfully!");
  };

  const getCategoryColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
    ];
    return colors[index % colors.length];
  };

  const maxSales = reportData
    ? Math.max(...reportData.salesData.map((item) => item.sales))
    : 0;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold">Sales Reports</h2>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
              onClick={generateReport}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <FiTrendingUp className="mr-2" />
              )}
              {isLoading ? "Generating..." : "Generate Report"}
            </button>
          </div>
          <button
            className="px-4 py-2 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
            onClick={exportReport}
            disabled={!reportData}
          >
            <FiDownload className="mr-2" /> Export
          </button>
        </div>

        {!reportData ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <FiBarChart2 className="mx-auto text-gray-400 w-12 h-12 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Report Generated
            </h3>
            <p className="text-gray-600">
              Select a date range and generate a report to view sales analytics
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <FiDollarSign className="text-blue-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-blue-600">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      ${reportData.totalRevenue.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <FiShoppingBag className="text-purple-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-purple-600">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {reportData.totalOrders}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <FiTrendingUp className="text-green-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-green-600">Avg. Order Value</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      ${reportData.averageOrderValue.toFixed(2)}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Sales Overview</h3>
                <div className="h-64">
                  <div className="flex items-end h-48 gap-2 px-4 border-b border-l border-gray-200">
                    {reportData.salesData.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1"
                      >
                        <div
                          className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                          style={{
                            height: `${(item.sales / maxSales) * 100}%`,
                          }}
                          title={`$${item.sales}`}
                        ></div>
                        <span className="text-xs text-gray-500 mt-1">
                          {item.day}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-4">
                    <span className="text-sm text-gray-600">
                      Daily sales for the week
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Top Products</h3>
                <div className="space-y-4">
                  {reportData.topProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-3">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-gray-900">
                          {product.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${product.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.sales} units sold
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Revenue by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {reportData.categoryRevenue.map((item, index) => (
                    <div key={item.category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {item.category}
                        </span>
                        <span className="text-sm text-gray-900">
                          ${item.revenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getCategoryColor(
                            index
                          )}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">
                          {item.percentage}% of total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <div
                      className="absolute inset-0 rounded-full border-8 border-blue-500"
                      style={{
                        clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                      }}
                    ></div>
                    <div
                      className="absolute inset-0 rounded-full border-8 border-purple-500"
                      style={{
                        clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
                        transform: "rotate(234deg)",
                      }}
                    ></div>
                    <div
                      className="absolute inset-0 rounded-full border-8 border-green-500"
                      style={{
                        clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
                        transform: "rotate(198deg)",
                      }}
                    ></div>
                    <div
                      className="absolute inset-0 rounded-full border-8 border-yellow-500"
                      style={{
                        clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
                        transform: "rotate(216deg)",
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          ${reportData.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Total Revenue
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorReport;


