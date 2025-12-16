import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiShoppingBag,
} from "react-icons/fi";
import useFetchData from "../../hooks/useFetchData";
import { ORDER_ROUTES } from "../../../utils/apiRoute";

const AdminPayment = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    fetchPaymentsFromOrders();
  }, []);

  const { fetchData, loading } = useFetchData(token);

  const fetchPaymentsFromOrders = async () => {
    await fetchData(ORDER_ROUTES.all, (data) => {
      if (data.success) {
        const orders = data.data || [];
        const paymentData = transformOrdersToPayments(orders);
        setPayments(paymentData);
      }
    });
  };

  const transformOrdersToPayments = (orders) => {
    return orders.map((order) => ({
      _id: order._id,
      paymentId: order.razorpayPaymentId || `pay_${order._id}`,
      orderId: order.orderNumber,
      customerName: order.shippingAddress?.fullName || "Unknown Customer",
      customerEmail: order.shippingAddress?.email || "No email",
      amount: order.totalAmount || 0,
      status: mapOrderStatusToPaymentStatus(
        order.paymentStatus,
        order.orderStatus
      ),
      paymentMethod: "razorpay",
      createdAt: order.createdAt,
      originalOrder: order,
    }));
  };

  const mapOrderStatusToPaymentStatus = (paymentStatus, orderStatus) => {
    switch (paymentStatus) {
      case "completed":
        return "completed";
      case "failed":
        return "failed";
      case "refunded":
        return "refunded";
      case "pending":
        if (orderStatus === "cancelled") {
          return "cancelled";
        }
        return "pending";
      default:
        return "pending";
    }
  };

  const calculateStats = () => {
    const totalRevenue = payments
      .filter((payment) => payment.status === "completed")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const successfulPayments = payments.filter(
      (payment) => payment.status === "completed"
    ).length;

    const failedPayments = payments.filter(
      (payment) => payment.status === "failed"
    ).length;

    const pendingPayments = payments.filter(
      (payment) => payment.status === "pending"
    ).length;

    const refundedPayments = payments.filter(
      (payment) => payment.status === "refunded"
    ).length;

    return {
      totalRevenue,
      successfulPayments,
      failedPayments,
      pendingPayments,
      refundedPayments,
    };
  };

  const stats = calculateStats();

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "refunded":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case "razorpay":
        return "bg-purple-100 text-purple-800";
      case "card":
        return "bg-indigo-100 text-indigo-800";
      case "upi":
        return "bg-blue-100 text-blue-800";
      case "netbanking":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      "Payment ID",
      "Order ID",
      "Customer",
      "Email",
      "Amount",
      "Status",
      "Payment Method",
      "Date",
    ];

    const csvData = filteredPayments.map((payment) => [
      payment.paymentId || "N/A",
      payment.orderId || "N/A",
      payment.customerName || "N/A",
      payment.customerEmail || "N/A",
      payment.amount || 0,
      payment.status || "N/A",
      payment.paymentMethod || "N/A",
      formatDate(payment.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Payment Management
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                View and manage all payment transactions from orders
              </p>
            </div>
            <button
              onClick={fetchPaymentsFromOrders}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <FiDollarSign className="text-green-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <FiCheckCircle className="text-blue-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Successful
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.successfulPayments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <FiRefreshCw className="text-yellow-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Pending
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.pendingPayments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <FiXCircle className="text-red-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Failed
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.failedPayments}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by payment ID, order ID, customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <div className="relative">
                  <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="w-full sm:w-48">
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>

              <button
                onClick={exportToCSV}
                disabled={filteredPayments.length === 0}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <FiDownload className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FiCreditCard className="mx-auto text-gray-400 text-3xl sm:text-4xl mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                {payments.length === 0
                  ? "No payments found"
                  : "No matching payments"}
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : payments.length === 0
                  ? "No payment transactions available from orders"
                  : "No payments match your current filters"}
              </p>
              {(searchTerm ||
                statusFilter !== "all" ||
                dateFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                  className="mt-4 text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Details
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status & Method
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 font-mono">
                              {payment.paymentId}
                            </p>
                            <p className="text-xs text-gray-500">
                              Order: {payment.orderId}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payment.customerName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.customerEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {payment.status}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(
                                payment.paymentMethod
                              )}`}
                            >
                              {payment.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {formatDate(payment.createdAt)}
                          </p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="lg:hidden">
                <div className="p-3 sm:p-4 space-y-4">
                  {filteredPayments.map((payment) => (
                    <div
                      key={payment._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm font-mono">
                              {payment.paymentId}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Order: {payment.orderId}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FiUser className="text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {payment.customerName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.customerEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(
                              payment.paymentMethod
                            )}`}
                          >
                            {payment.paymentMethod}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FiCalendar className="text-gray-400" />
                          {formatDate(payment.createdAt)}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <FiEye className="text-sm" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        {filteredPayments.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        )}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Payment & Order Details
                </h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <FiXCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Payment Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment ID:</span>
                      <span className="font-mono text-gray-900">
                        {selectedPayment.paymentId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order ID:</span>
                      <span className="font-mono text-gray-900">
                        {selectedPayment.orderId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(selectedPayment.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                          selectedPayment.status
                        )}`}
                      >
                        {selectedPayment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method:</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentMethodColor(
                          selectedPayment.paymentMethod
                        )}`}
                      >
                        {selectedPayment.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="text-gray-900">
                        {selectedPayment.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-900">
                        {selectedPayment.customerEmail}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="text-gray-900">
                        {formatDate(selectedPayment.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPayment.originalOrder && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Order Details
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Items:</span>
                        <p className="text-gray-900">
                          {selectedPayment.originalOrder.items?.length || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Order Status:</span>
                        <p className="text-gray-900 capitalize">
                          {selectedPayment.originalOrder.orderStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayment;
