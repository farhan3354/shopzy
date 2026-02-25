import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FiPackage,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiDownload,
} from "react-icons/fi";
import api from "../../../utils/api";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        "/getall-orders/vendors",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        setOrders(response.data.data);
      } else {
        setOrders([]); // fallback to empty if response is malformed
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to fetch orders");
      setOrders([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status, trackingData = {}) => {
    try {
      setUpdating(true);
      const response = await api.put(
        `/updatestatus/${orderId}/status`,
        {
          orderStatus: status,
          ...trackingData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Order status updated successfully!");
        setShowStatusModal(false);
        fetchAllOrders();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await api.delete(
        `/delete-oder/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Order deleted successfully!");
        fetchAllOrders();
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShowStatusModal(true);
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedOrder || !newStatus) return;

    const trackingData = {};
    if (newStatus === "shipped") {
      const trackingNumber = prompt("Enter tracking number:");
      const carrier = prompt("Enter shipping carrier:");
      if (trackingNumber) {
        trackingData.trackingNumber = trackingNumber;
        trackingData.shippingCarrier = carrier || "Standard Shipping";
      }
    }

    updateOrderStatus(selectedOrder._id, newStatus, trackingData);
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = safeOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;

    const matchesPaymentMethod =
      paymentMethodFilter === "all" || order.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTotalRevenue = () => {
    if (!Array.isArray(orders)) return 0;
    return orders
      .filter((order) => {
        if (order.paymentStatus === "completed") return true;
        if (order.paymentMethod === "cod" && (order.orderStatus === "confirmed" || order.orderStatus === "delivered")) return true;
        return false;
      })
      .reduce((total, order) => total + (order.totalAmount || 0), 0);
  };

  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = ["Order Number", "Customer", "Email", "Amount", "Status", "Payment", "Payment Method", "Date"];
    const csvData = filteredOrders.map(order => [
      order.orderNumber,
      order.shippingAddress?.fullName || "N/A",
      order.userId?.email || "N/A",
      order.totalAmount?.toFixed(2),
      order.orderStatus,
      order.paymentStatus,
      order.paymentMethod || "online",
      new Date(order.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `vendor_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
              <p className="text-gray-600 mt-2">
                Manage and track all customer orders
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <FiDownload /> Export CSV
            </button>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiPackage className="text-indigo-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiUser className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Unique Customers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(orders.map((order) => order.userId?._id)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiDollarSign className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{getTotalRevenue().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiCalendar className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    orders.filter((order) => order.orderStatus === "pending")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Payments</option>
                <option value="razorpay">Online (Razorpay)</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="mx-auto text-gray-400 text-4xl" />
              <p className="mt-4 text-gray-500">No orders found</p>
              {searchTerm || statusFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="mt-2 text-indigo-600 hover:text-indigo-500"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items?.length} items
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.shippingAddress?.fullName || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.userId?.email || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{order.totalAmount?.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.paymentMethod === 'cod' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openStatusModal(order)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title="Update Status"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteOrder(order._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Order"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                            title="View Details"
                            onClick={() => openDetailsModal(order)}
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredOrders.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}

        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Order Status
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Order: <strong>{selectedOrder.orderNumber}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Order Number</p>
                    <p className="text-lg font-bold text-indigo-600">#{selectedOrder.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Date</p>
                    <p className="text-gray-900 font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Customer Info</p>
                    <p className="text-sm text-gray-700">{selectedOrder.shippingAddress?.fullName}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.userId?.email}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.userId?.phone || "No phone provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Shipping Address</p>
                    <p className="text-sm text-gray-700">{selectedOrder.shippingAddress?.street}</p>
                    <p className="text-sm text-gray-700">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                    <p className="text-sm text-gray-700">{selectedOrder.shippingAddress?.pincode}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-3 ml-1">Order Items</p>
                  <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-center gap-4 bg-white hover:bg-gray-50 transition">
                        <img 
                          src={item.productId?.images?.[0] || 'https://via.placeholder.com/150'} 
                          alt={item.productId?.name} 
                          className="w-16 h-16 object-cover rounded shadow-sm"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productId?.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">₹{item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(selectedOrder.orderStatus)}`}>
                      {selectedOrder.orderStatus}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      selectedOrder.paymentMethod === 'cod' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedOrder.paymentMethod === 'cod' ? 'COD' : 'Online'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-3xl font-extrabold text-indigo-600">₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 shadow-sm transition">Close Details</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
