import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../utils/api";

const OrderPending = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollingCount, setPollingCount] = useState(0);
  const [redirecting, setRedirecting] = useState(false);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!id) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    const checkOrderStatus = async () => {
      try {
        const response = await api.get(`/orders/status/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          const order = response.data.order;
          setOrder(order);

          // ✅ REDIRECT TO ORDERS PAGE WHEN PAYMENT IS COMPLETED
          if (order.paymentStatus === "completed" && order.webhookReceived) {
            setLoading(false);
            console.log(
              "✅ Order confirmed via webhook, redirecting to orders page..."
            );

            // Set redirecting state to show feedback to user
            setRedirecting(true);

            // Redirect to orders page after 2 seconds to show success message
            setTimeout(() => {
              navigate("/orders", {
                state: {
                  orderSuccess: true,
                  orderNumber: order.orderNumber,
                },
              });
            }, 2000);
          } else if (order.paymentStatus === "failed") {
            setLoading(false);
          } else {
            // Continue polling - wait for actual webhook
            if (pollingCount < 48) {
              // 4 minutes max (48 * 5 seconds)
              setTimeout(() => {
                setPollingCount((prev) => prev + 1);
              }, 5000);
            } else {
              setLoading(false);
              setError(
                "Order confirmation is taking longer than expected. Please check your email for updates or contact support."
              );
            }
          }
        }
      } catch (error) {
        console.error("Error checking order status:", error);
        if (pollingCount < 48) {
          setTimeout(() => {
            setPollingCount((prev) => prev + 1);
          }, 5000);
        } else {
          setLoading(false);
          setError(
            "Unable to verify order status. Please check your order history."
          );
        }
      }
    };

    checkOrderStatus();
  }, [id, pollingCount, token, navigate]);

  const getStatusColor = () => {
    if (!order) return "#F59E0B";
    switch (order.paymentStatus) {
      case "completed":
        return "#10B981";
      case "failed":
        return "#EF4444";
      default:
        return "#F59E0B";
    }
  };

  const getStatusMessage = () => {
    if (redirecting) return "🎉 Order Confirmed!";
    if (!order) return "Your Order is Being Processed";
    switch (order.paymentStatus) {
      case "completed":
        return "🎉 Your Order is Confirmed!";
      case "failed":
        return "❌ Payment Failed";
      default:
        return "⏳ Your Order is Being Processed";
    }
  };

  const getSubtitle = () => {
    if (redirecting) return "Redirecting to your orders page...";
    if (!order)
      return "Thank you for your purchase! We're preparing your order for shipment.";
    switch (order.paymentStatus) {
      case "completed":
        return "Your payment was successful and your order has been confirmed.";
      case "failed":
        return (
          order.failureReason ||
          "The payment could not be processed. Please try again."
        );
      default:
        return "Thank you for your purchase! We're preparing your order for shipment.";
    }
  };

  // Show redirecting state
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white shadow-md rounded-xl p-8 w-full max-w-md">
          <div className="text-green-500 text-5xl mb-4">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your order has been successfully placed.
          </p>
          <div className="animate-pulse mb-4">
            <p className="text-blue-600">Redirecting to orders page...</p>
          </div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white shadow-md rounded-xl p-8 w-full max-w-md">
          <div className="text-red-500 text-5xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </button>
            <button
              className="border border-gray-400 px-4 py-2 rounded-md hover:bg-gray-100"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div
            className="mx-auto w-16 h-16 flex items-center justify-center rounded-full"
            style={{ backgroundColor: `${getStatusColor()}20` }}
          >
            <i
              className={`fas ${
                order?.paymentStatus === "completed"
                  ? "fa-check-circle"
                  : order?.paymentStatus === "failed"
                  ? "fa-times-circle"
                  : "fa-clock"
              } text-3xl`}
              style={{ color: getStatusColor() }}
            ></i>
          </div>
          <h1 className="text-2xl font-bold mt-4">{getStatusMessage()}</h1>
          <p className="text-gray-600 mt-2">{getSubtitle()}</p>
        </div>

        {order && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-700">Order Number:</span>
              <span className="text-gray-800">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-700">Order Date:</span>
              <span className="text-gray-800">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-700">Total Amount:</span>
              <span className="text-gray-800">
                ₹{order.totalAmount?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-700">Payment Status:</span>
              <span
                className="font-semibold px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: `${getStatusColor()}20`,
                  color: getStatusColor(),
                }}
              >
                {order.paymentStatus?.charAt(0).toUpperCase() +
                  order.paymentStatus?.slice(1)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
          {order?.paymentStatus === "failed" && (
            <button
              className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
              onClick={() => navigate("/cart")}
            >
              <i className="fas fa-redo mr-2"></i> Try Again
            </button>
          )}

          {order?.paymentStatus === "completed" && (
            <button
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-center"
              onClick={() => navigate("/orders")}
            >
              <i className="fas fa-eye mr-2"></i> View Order Details
            </button>
          )}

          {order?.paymentStatus !== "completed" && (
            <Link
              to="/orders"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-center"
            >
              <i className="fas fa-eye mr-2"></i> View Order Details
            </Link>
          )}

          <button
            className="border border-gray-400 px-5 py-2 rounded-lg hover:bg-gray-100"
            onClick={() => navigate("/")}
          >
            <i className="fas fa-shopping-bag mr-2"></i> Continue Shopping
          </button>
        </div>

        {order?.paymentStatus === "pending" && (
          <p className="text-center text-gray-500 mt-6 text-sm">
            <i className="fas fa-envelope mr-1"></i>
            You will receive an email confirmation once your order is processed.
          </p>
        )}

        {/* Show polling status */}
        {order?.paymentStatus === "pending" && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse mr-2"></div>
              Checking order status... ({pollingCount}/48)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPending;
