import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiShoppingBag,
  FiDollarSign,
  FiMapPin,
} from "react-icons/fi";
import useFetchData from "../hooks/useFetchData";
import { OrdersLoading } from "../components/common/LoadingSpinner";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const { fetchData, loading, error } = useFetchData(token);

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    await fetchData("/user/my-orders", (data) => {
      if (data.success) {
        setOrders(data.data || []);
      }
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FiCheckCircle className="w-4 h-4" />;
      case "shipped":
        return <FiTruck className="w-4 h-4" />;
      case "confirmed":
        return <FiCheckCircle className="w-4 h-4" />;
      case "pending":
        return <FiClock className="w-4 h-4" />;
      default:
        return <FiPackage className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "confirmed":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "pending":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs";
      case "failed":
        return "text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs";
      case "pending":
        return "text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs";
      default:
        return "text-gray-600 bg-gray-50 px-2 py-1 rounded-full text-xs";
    }
  };

  if (loading) {
    return <OrdersLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiPackage className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Unable to load orders
          </h3>
          <p className="text-gray-500 text-lg mb-6">
            {error ||
              "There was an error loading your orders. Please try again."}
          </p>
          <button
            onClick={fetchUserOrders}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
              <FiShoppingBag className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Track and manage all your orders in one place
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No orders yet
            </h3>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
              When you place orders, they will appear here with all the details
              you need to track them.
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-lg"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-8">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <FiShoppingBag className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <FiClock className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-500 text-sm">
                            Placed on{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-2 capitalize font-semibold">
                          {order.orderStatus}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="grid gap-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      >
                        <img
                          src={item.productImage || "/placeholder-image.jpg"}
                          alt={item.productName}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">
                            {item.productName}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">
                            Quantity: {item.quantity}
                          </p>
                          {item.selectedAttributes && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(item.selectedAttributes).map(
                                ([key, value]) => (
                                  <span
                                    key={key}
                                    className="bg-white px-2 py-1 rounded-lg text-xs text-gray-600 border"
                                  >
                                    {key}: {value}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-gray-500 text-sm">
                            ₹{item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-600">
                            Payment:{" "}
                            <span
                              className={getPaymentStatusColor(
                                order.paymentStatus
                              )}
                            >
                              {order.paymentStatus}
                            </span>
                          </p>
                        </div>
                        {order.trackingInfo && (
                          <div className="flex items-center gap-2">
                            <FiMapPin className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-600 text-sm">
                              Tracking:{" "}
                              <span className="font-medium">
                                {order.trackingInfo.trackingNumber}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">
                          Total Amount
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;

// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiShoppingBag, FiDollarSign, FiMapPin } from "react-icons/fi";
// import api from "../../utils/api";

// const UserOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const token = useSelector((state) => state.auth.token);

//   useEffect(() => {
//     fetchUserOrders();
//   }, []);

//   const fetchUserOrders = async () => {
//     try {
//       const response = await api.get("/user/my-orders",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data.success) {
//         setOrders(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "delivered":
//         return <FiCheckCircle className="w-4 h-4" />;
//       case "shipped":
//         return <FiTruck className="w-4 h-4" />;
//       case "confirmed":
//         return <FiCheckCircle className="w-4 h-4" />;
//       case "pending":
//         return <FiClock className="w-4 h-4" />;
//       default:
//         return <FiPackage className="w-4 h-4" />;
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "delivered":
//         return "bg-green-50 text-green-700 border-green-200";
//       case "shipped":
//         return "bg-blue-50 text-blue-700 border-blue-200";
//       case "confirmed":
//         return "bg-yellow-50 text-yellow-700 border-yellow-200";
//       case "pending":
//         return "bg-gray-50 text-gray-700 border-gray-200";
//       case "cancelled":
//         return "bg-red-50 text-red-700 border-red-200";
//       default:
//         return "bg-gray-50 text-gray-700 border-gray-200";
//     }
//   };

//   const getPaymentStatusColor = (status) => {
//     switch (status) {
//       case "completed":
//         return "text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs";
//       case "failed":
//         return "text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs";
//       case "pending":
//         return "text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs";
//       default:
//         return "text-gray-600 bg-gray-50 px-2 py-1 rounded-full text-xs";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 text-lg font-medium">Loading your orders...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center mb-4">
//             <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
//               <FiShoppingBag className="w-6 h-6 text-indigo-600" />
//             </div>
//             <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
//           </div>
//           <p className="text-gray-600 text-lg max-w-2xl mx-auto">
//             Track and manage all your orders in one place
//           </p>
//         </div>

//         {orders.length === 0 ? (
//           <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
//             <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <FiPackage className="w-10 h-10 text-indigo-500" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-900 mb-3">
//               No orders yet
//             </h3>
//             <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
//               When you place orders, they will appear here with all the details you need to track them.
//             </p>
//             <button
//               onClick={() => (window.location.href = "/")}
//               className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-lg"
//             >
//               Start Shopping
//             </button>
//           </div>
//         ) : (
//           <div className="grid gap-8">
//             {orders.map((order) => (
//               <div
//                 key={order._id}
//                 className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
//               >
//                 {/* Order Header */}
//                 <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
//                   <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
//                         <FiShoppingBag className="w-6 h-6 text-indigo-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-900">
//                           Order #{order.orderNumber}
//                         </h3>
//                         <div className="flex items-center gap-2 mt-1">
//                           <FiClock className="w-4 h-4 text-gray-400" />
//                           <p className="text-gray-500 text-sm">
//                             Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
//                               year: 'numeric',
//                               month: 'long',
//                               day: 'numeric'
//                             })}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex flex-col sm:flex-row gap-3">
//                       <span
//                         className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
//                           order.orderStatus
//                         )}`}
//                       >
//                         {getStatusIcon(order.orderStatus)}
//                         <span className="ml-2 capitalize font-semibold">
//                           {order.orderStatus}
//                         </span>
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Order Items */}
//                 <div className="p-6">
//                   <div className="grid gap-4">
//                     {order.items.map((item, index) => (
//                       <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
//                         <img
//                           src={item.productImage || "/placeholder-image.jpg"}
//                           alt={item.productName}
//                           className="w-20 h-20 object-cover rounded-lg shadow-sm"
//                         />
//                         <div className="flex-1 min-w-0">
//                           <h4 className="text-lg font-semibold text-gray-900 truncate">
//                             {item.productName}
//                           </h4>
//                           <p className="text-gray-600 text-sm mt-1">
//                             Quantity: {item.quantity}
//                           </p>
//                           {item.selectedAttributes && (
//                             <div className="flex flex-wrap gap-2 mt-2">
//                               {Object.entries(item.selectedAttributes).map(
//                                 ([key, value]) => (
//                                   <span key={key} className="bg-white px-2 py-1 rounded-lg text-xs text-gray-600 border">
//                                     {key}: {value}
//                                   </span>
//                                 )
//                               )}
//                             </div>
//                           )}
//                         </div>
//                         <div className="text-right">
//                           <p className="text-lg font-bold text-gray-900">
//                             ₹{(item.price * item.quantity).toFixed(2)}
//                           </p>
//                           <p className="text-gray-500 text-sm">
//                             ₹{item.price.toFixed(2)} each
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Order Footer */}
//                   <div className="mt-8 pt-6 border-t border-gray-200">
//                     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                       <div className="space-y-3">
//                         <div className="flex items-center gap-2">
//                           <FiDollarSign className="w-4 h-4 text-gray-400" />
//                           <p className="text-gray-600">
//                             Payment:{" "}
//                             <span className={getPaymentStatusColor(order.paymentStatus)}>
//                               {order.paymentStatus}
//                             </span>
//                           </p>
//                         </div>
//                         {order.trackingInfo && (
//                           <div className="flex items-center gap-2">
//                             <FiMapPin className="w-4 h-4 text-gray-400" />
//                             <p className="text-gray-600 text-sm">
//                               Tracking: <span className="font-medium">{order.trackingInfo.trackingNumber}</span>
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-500 mb-1">Total Amount</p>
//                         <p className="text-2xl font-bold text-gray-900">
//                           ₹{order.totalAmount.toFixed(2)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserOrders;
