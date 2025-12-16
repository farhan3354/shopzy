import React, { useState } from "react";
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

  const orders = [
    {
      id: "ORD-12345",
      date: "2023-10-15",
      status: "delivered",
      items: 3,
      total: 149.99,
      tracking: "TRK-789456",
      deliveryDate: "2023-10-18",
      products: [
        {
          name: "Wireless Headphones",
          price: 89.99,
          quantity: 1,
          image:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=60",
        },
        {
          name: "Phone Case",
          price: 29.99,
          quantity: 2,
          image:
            "https://images.unsplash.com/photo-1601593346740-9b7d4d1f4495?auto=format&fit=crop&w=500&q=60",
        },
      ],
    },
    {
      id: "ORD-12346",
      date: "2023-10-10",
      status: "processing",
      items: 2,
      total: 199.5,
      tracking: "TRK-789457",
      deliveryDate: "2023-10-20",
      products: [
        {
          name: "Smart Watch",
          price: 159.99,
          quantity: 1,
          image:
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=60",
        },
        {
          name: "Screen Protector",
          price: 19.99,
          quantity: 1,
          image:
            "https://images.unsplash.com/photo-1605346572887-8d37167251c0?auto=format&fit=crop&w=500&q=60",
        },
      ],
    },
    {
      id: "ORD-12347",
      date: "2023-10-05",
      status: "shipped",
      items: 1,
      total: 79.99,
      tracking: "TRK-789458",
      deliveryDate: "2023-10-12",
      products: [
        {
          name: "Bluetooth Speaker",
          price: 79.99,
          quantity: 1,
          image:
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=60",
        },
      ],
    },
    {
      id: "ORD-12348",
      date: "2023-09-28",
      status: "cancelled",
      items: 4,
      total: 210.0,
      tracking: "TRK-789459",
      deliveryDate: "2023-10-05",
      products: [
        {
          name: "Wireless Earbuds",
          price: 59.99,
          quantity: 1,
          image:
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=60",
        },
        {
          name: "USB-C Cable",
          price: 15.0,
          quantity: 3,
          image:
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=500&q=60",
        },
      ],
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tracking.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatus = (status) => {
    switch (status) {
      case "processing":
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

        <div className="flex space-x-4 border-b mb-6">
          {["all", "processing", "shipped", "delivered", "cancelled"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-3 text-sm font-medium capitalize ${
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
                      <p className="font-medium">Order {order.id}</p>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
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
