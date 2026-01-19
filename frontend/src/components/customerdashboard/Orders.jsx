import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiSearch,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiEye,
} from "react-icons/fi";
import Modal from "./Model";

export default function Orders() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get(`${API_URL}/user/my-orders`, config);
      
      const mappedOrders = response.data.data.map(order => ({
        id: order._id,
        displayId: order.orderNumber || order._id.slice(-6).toUpperCase(),
        date: order.createdAt,
        status: order.orderStatus,
        items: order.items.length,
        total: order.totalAmount,
        tracking: order.trackingInfo?.trackingNumber || "N/A",
        deliveryDate: order.deliveredAt || order.expectedDelivery || "TBD",
        products: order.items.map(item => ({
            name: item.productId?.name || "Product",
            price: item.price,
            quantity: item.quantity,
            image: item.productId?.images?.[0] || "https://via.placeholder.com/150"
        })),
        shippingAddress: order.shippingAddress
      }));

      setOrders(mappedOrders);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    const matchesSearch =
      order.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tracking.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatus = (status) => {
    switch (status) {
      case "processing":
      case "pending":
        return {
          icon: <FiPackage className="text-blue-500" />,
          color: "bg-blue-100 text-blue-800",
        };
      case "shipped":
        return {
          icon: <FiTruck className="text-yellow-500" />,
          color: "bg-yellow-100 text-yellow-800",
        };
      case "delivered":
        return {
          icon: <FiCheckCircle className="text-green-500" />,
          color: "bg-green-100 text-green-800",
        };
      case "cancelled":
        return {
          icon: <FiXCircle className="text-red-500" />,
          color: "bg-red-100 text-red-800",
        };
      default:
        return {
          icon: <FiPackage className="text-gray-500" />,
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        <div className="flex items-center mb-6 space-x-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or tracking"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-3 text-sm font-medium capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? "border-b-2 border-indigo-500 text-indigo-600"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        <div className="bg-white rounded-lg shadow divide-y">
          {filteredOrders.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              No orders found 🚫
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = getStatus(order.status);
              return (
                <div key={order.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">Order #{order.displayId}</p>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-bold mt-1">${(order.total || 0).toFixed(2)}</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 mt-2 rounded-full text-xs font-medium ${status.color}`}
                      >
                        {status.icon}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </div>
                    <div className="mt-3 md:mt-0">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50"
                      >
                        <FiEye className="mr-2" /> View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
