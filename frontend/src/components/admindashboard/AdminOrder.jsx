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
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import useFetchData from "../../hooks/useFetchData";
import { ORDER_ROUTES } from "../../../utils/apiRoute";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const token = useSelector((state) => state.auth.token);
  const { fetchData, updateData, deleteData, loading } = useFetchData(token);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    await fetchData(ORDER_ROUTES.all, (data) => {
      if (data.success) {
        setOrders(data.data || []);
      }
    });
  };

  const updateOrderStatus = async (orderId, status, trackingData = {}) => {
    try {
      await updateData(
        // `/updatestatus/${orderId}/status`,
        ORDER_ROUTES.update(orderId),
        {
          orderStatus: status,
          ...trackingData,
        },
        "Order status updated successfully!"
      );
      setShowStatusModal(false);
      fetchAllOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteOrder = async (orderId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This order will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteData(
            ORDER_ROUTES.delete(orderId),
            "Order deleted successfully!"
          );
          fetchAllOrders();
        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShowStatusModal(true);
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
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
    return orders
      .filter((order) => order.paymentStatus === "completed")
      .reduce((total, order) => total + (order.totalAmount || 0), 0);
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            All Orders
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage and track all customer orders
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg">
                <FiPackage className="text-indigo-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <FiUser className="text-green-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Unique Customers
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {new Set(orders.map((order) => order.userId?._id)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <FiDollarSign className="text-blue-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  ₹{getTotalRevenue().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadowSm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <FiCalendar className="text-yellow-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Pending Orders
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {
                    orders.filter((order) => order.orderStatus === "pending")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
            <div className="text-center py-8 sm:py-12">
              <FiPackage className="mx-auto text-gray-400 text-3xl sm:text-4xl" />
              <p className="mt-4 text-gray-500 text-sm sm:text-base">
                No orders found
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  Clear filters
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
                        Order Details
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.items?.length} items
                            </p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {order.shippingAddress?.fullName || "N/A"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.userId?.email || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{order.totalAmount?.toFixed(2)}
                          </p>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                order.paymentStatus
                              )}`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openStatusModal(order)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                              title="Update Status"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteOrder(order._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                              title="Delete Order"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors"
                              title="View Details"
                              onClick={() => {
                                alert(
                                  `View details for order: ${order.orderNumber}`
                                );
                              }}
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
              <div className="lg:hidden">
                <div className="p-3 sm:p-4 space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {order.orderNumber}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {order.items?.length} items •{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{order.totalAmount?.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.shippingAddress?.fullName || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.userId?.email || "N/A"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => openStatusModal(order)}
                            className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <FiEdit className="text-sm" />
                            Status
                          </button>
                          <button
                            onClick={() => deleteOrder(order._id)}
                            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <FiTrash2 className="text-sm" />
                            Delete
                          </button>
                          <button
                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                            onClick={() => {
                              alert(
                                `View details for order: ${order.orderNumber}`
                              );
                            }}
                          >
                            <FiEye className="text-sm" />
                            View
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
        {filteredOrders.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Update Order Status
                </h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors w-full sm:w-auto"
                >
                  {loading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import {
//   FiPackage,
//   FiUser,
//   FiDollarSign,
//   FiCalendar,
//   FiSearch,
//   FiEdit,
//   FiTrash2,
//   FiEye,
//   FiX,
// } from "react-icons/fi";
// import api from "../../../utils/api";

// const AdminOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [newStatus, setNewStatus] = useState("");
//   const [updating, setUpdating] = useState(false);
//   const token = useSelector((state) => state.auth.token);

//   useEffect(() => {
//     fetchAllOrders();
//   }, []);

//   const fetchAllOrders = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get(
//         "/getall-orders",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data.success) {
//         setOrders(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       alert("Failed to fetch orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateOrderStatus = async (orderId, status, trackingData = {}) => {
//     try {
//       setUpdating(true);
//       const response = await api.put(
//         `/updatestatus/${orderId}/status`,
//         {
//           orderStatus: status,
//           ...trackingData,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data.success) {
//         alert("Order status updated successfully!");
//         setShowStatusModal(false);
//         fetchAllOrders();
//       }
//     } catch (error) {
//       console.error("Error updating order status:", error);
//       alert("Failed to update order status");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const deleteOrder = async (orderId) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this order? This action cannot be undone."
//       )
//     ) {
//       return;
//     }

//     try {
//       const response = await api.delete(
//         `/delete-oder/${orderId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data.success) {
//         alert("Order deleted successfully!");
//         fetchAllOrders(); // Refresh orders
//       }
//     } catch (error) {
//       console.error("Error deleting order:", error);
//       alert("Failed to delete order");
//     }
//   };

//   const openStatusModal = (order) => {
//     setSelectedOrder(order);
//     setNewStatus(order.orderStatus);
//     setShowStatusModal(true);
//   };

//   const handleStatusUpdate = () => {
//     if (!selectedOrder || !newStatus) return;

//     const trackingData = {};
//     if (newStatus === "shipped") {
//       const trackingNumber = prompt("Enter tracking number:");
//       const carrier = prompt("Enter shipping carrier:");
//       if (trackingNumber) {
//         trackingData.trackingNumber = trackingNumber;
//         trackingData.shippingCarrier = carrier || "Standard Shipping";
//       }
//     }

//     updateOrderStatus(selectedOrder._id, newStatus, trackingData);
//   };

//   const filteredOrders = orders.filter((order) => {
//     const matchesSearch =
//       order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.shippingAddress?.fullName
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus =
//       statusFilter === "all" || order.orderStatus === statusFilter;

//     return matchesSearch && matchesStatus;
//   });

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "delivered":
//         return "bg-green-100 text-green-800";
//       case "shipped":
//         return "bg-blue-100 text-blue-800";
//       case "confirmed":
//         return "bg-yellow-100 text-yellow-800";
//       case "pending":
//         return "bg-gray-100 text-gray-800";
//       case "cancelled":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getPaymentStatusColor = (status) => {
//     switch (status) {
//       case "completed":
//         return "bg-green-100 text-green-800";
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "failed":
//         return "bg-red-100 text-red-800";
//       case "refunded":
//         return "bg-purple-100 text-purple-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getTotalRevenue = () => {
//     return orders
//       .filter((order) => order.paymentStatus === "completed")
//       .reduce((total, order) => total + (order.totalAmount || 0), 0);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading orders...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="mb-6 sm:mb-8">
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Orders</h1>
//           <p className="text-gray-600 mt-2 text-sm sm:text-base">
//             Manage and track all customer orders
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
//           <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
//             <div className="flex items-center">
//               <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg">
//                 <FiPackage className="text-indigo-600 text-lg sm:text-xl" />
//               </div>
//               <div className="ml-3 sm:ml-4">
//                 <p className="text-xs sm:text-sm font-medium text-gray-600">
//                   Total Orders
//                 </p>
//                 <p className="text-xl sm:text-2xl font-bold text-gray-900">
//                   {orders.length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
//             <div className="flex items-center">
//               <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
//                 <FiUser className="text-green-600 text-lg sm:text-xl" />
//               </div>
//               <div className="ml-3 sm:ml-4">
//                 <p className="text-xs sm:text-sm font-medium text-gray-600">
//                   Unique Customers
//                 </p>
//                 <p className="text-xl sm:text-2xl font-bold text-gray-900">
//                   {new Set(orders.map((order) => order.userId?._id)).size}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
//             <div className="flex items-center">
//               <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
//                 <FiDollarSign className="text-blue-600 text-lg sm:text-xl" />
//               </div>
//               <div className="ml-3 sm:ml-4">
//                 <p className="text-xs sm:text-sm font-medium text-gray-600">
//                   Total Revenue
//                 </p>
//                 <p className="text-xl sm:text-2xl font-bold text-gray-900">
//                   ₹{getTotalRevenue().toFixed(2)}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
//             <div className="flex items-center">
//               <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
//                 <FiCalendar className="text-yellow-600 text-lg sm:text-xl" />
//               </div>
//               <div className="ml-3 sm:ml-4">
//                 <p className="text-xs sm:text-sm font-medium text-gray-600">
//                   Pending Orders
//                 </p>
//                 <p className="text-xl sm:text-2xl font-bold text-gray-900">
//                   {
//                     orders.filter((order) => order.orderStatus === "pending")
//                       .length
//                   }
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filter Section */}
//         <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="flex-1">
//               <div className="relative">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by order number, customer name, or email..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
//                 />
//               </div>
//             </div>
//             <div className="w-full sm:w-48">
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
//               >
//                 <option value="all">All Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="confirmed">Confirmed</option>
//                 <option value="shipped">Shipped</option>
//                 <option value="delivered">Delivered</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Orders List */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           {filteredOrders.length === 0 ? (
//             <div className="text-center py-8 sm:py-12">
//               <FiPackage className="mx-auto text-gray-400 text-3xl sm:text-4xl" />
//               <p className="mt-4 text-gray-500 text-sm sm:text-base">No orders found</p>
//               {(searchTerm || statusFilter !== "all") && (
//                 <button
//                   onClick={() => {
//                     setSearchTerm("");
//                     setStatusFilter("all");
//                   }}
//                   className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm"
//                 >
//                   Clear filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               {/* Desktop Table */}
//               <div className="hidden lg:block">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Order Details
//                       </th>
//                       <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Customer
//                       </th>
//                       <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Amount
//                       </th>
//                       <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Date
//                       </th>
//                       <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredOrders.map((order) => (
//                       <tr key={order._id} className="hover:bg-gray-50">
//                         <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">
//                               {order.orderNumber}
//                             </p>
//                             <p className="text-sm text-gray-500">
//                               {order.items?.length} items
//                             </p>
//                           </div>
//                         </td>
//                         <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">
//                               {order.shippingAddress?.fullName || "N/A"}
//                             </p>
//                             <p className="text-sm text-gray-500">
//                               {order.userId?.email || "N/A"}
//                             </p>
//                           </div>
//                         </td>
//                         <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                           <p className="text-sm font-medium text-gray-900">
//                             ₹{order.totalAmount?.toFixed(2)}
//                           </p>
//                         </td>
//                         <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                           <div className="flex flex-col gap-1">
//                             <span
//                               className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
//                                 order.orderStatus
//                               )}`}
//                             >
//                               {order.orderStatus}
//                             </span>
//                             <span
//                               className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
//                                 order.paymentStatus
//                               )}`}
//                             >
//                               {order.paymentStatus}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {new Date(order.createdAt).toLocaleDateString()}
//                         </td>
//                         <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center space-x-2">
//                             <button
//                               onClick={() => openStatusModal(order)}
//                               className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
//                               title="Update Status"
//                             >
//                               <FiEdit className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() => deleteOrder(order._id)}
//                               className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
//                               title="Delete Order"
//                             >
//                               <FiTrash2 className="w-4 h-4" />
//                             </button>
//                             <button
//                               className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors"
//                               title="View Details"
//                               onClick={() => {
//                                 alert(
//                                   `View details for order: ${order.orderNumber}`
//                                 );
//                               }}
//                             >
//                               <FiEye className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Mobile Cards */}
//               <div className="lg:hidden">
//                 <div className="p-3 sm:p-4 space-y-4">
//                   {filteredOrders.map((order) => (
//                     <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
//                       <div className="space-y-4">
//                         {/* Order Header */}
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <h3 className="font-semibold text-gray-900 text-sm">
//                               {order.orderNumber}
//                             </h3>
//                             <p className="text-xs text-gray-500">
//                               {order.items?.length} items • {new Date(order.createdAt).toLocaleDateString()}
//                             </p>
//                           </div>
//                           <p className="text-sm font-semibold text-gray-900">
//                             ₹{order.totalAmount?.toFixed(2)}
//                           </p>
//                         </div>

//                         {/* Customer Info */}
//                         <div>
//                           <p className="text-sm font-medium text-gray-900">
//                             {order.shippingAddress?.fullName || "N/A"}
//                           </p>
//                           <p className="text-xs text-gray-500">
//                             {order.userId?.email || "N/A"}
//                           </p>
//                         </div>

//                         {/* Status */}
//                         <div className="flex flex-wrap gap-2">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
//                               order.orderStatus
//                             )}`}
//                           >
//                             {order.orderStatus}
//                           </span>
//                           <span
//                             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
//                               order.paymentStatus
//                             )}`}
//                           >
//                             {order.paymentStatus}
//                           </span>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex gap-2 pt-3 border-t border-gray-200">
//                           <button
//                             onClick={() => openStatusModal(order)}
//                             className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1"
//                           >
//                             <FiEdit className="text-sm" />
//                             Status
//                           </button>
//                           <button
//                             onClick={() => deleteOrder(order._id)}
//                             className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
//                           >
//                             <FiTrash2 className="text-sm" />
//                             Delete
//                           </button>
//                           <button
//                             className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
//                             onClick={() => {
//                               alert(
//                                 `View details for order: ${order.orderNumber}`
//                               );
//                             }}
//                           >
//                             <FiEye className="text-sm" />
//                             View
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Orders Count */}
//         {filteredOrders.length > 0 && (
//           <div className="mt-4 text-sm text-gray-500">
//             Showing {filteredOrders.length} of {orders.length} orders
//           </div>
//         )}

//         {/* Status Update Modal */}
//         {showStatusModal && selectedOrder && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
//             <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-medium text-gray-900">
//                   Update Order Status
//                 </h3>
//                 <button
//                   onClick={() => setShowStatusModal(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <FiX className="w-5 h-5" />
//                 </button>
//               </div>

//               <p className="text-sm text-gray-600 mb-4">
//                 Order: <strong>{selectedOrder.orderNumber}</strong>
//               </p>

//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   New Status
//                 </label>
//                 <select
//                   value={newStatus}
//                   onChange={(e) => setNewStatus(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="confirmed">Confirmed</option>
//                   <option value="shipped">Shipped</option>
//                   <option value="delivered">Delivered</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </div>

//               <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
//                 <button
//                   onClick={() => setShowStatusModal(false)}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors w-full sm:w-auto"
//                   disabled={updating}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleStatusUpdate}
//                   disabled={updating}
//                   className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors w-full sm:w-auto"
//                 >
//                   {updating ? "Updating..." : "Update Status"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminOrders;
