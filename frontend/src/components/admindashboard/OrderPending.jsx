import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../utils/api";
import { FiCheckCircle, FiXCircle, FiClock, FiAlertTriangle, FiLoader, FiShoppingBag, FiArrowRight } from "react-icons/fi";

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

  // Show loading state
  if (loading && !order && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <FiLoader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Your Order</h2>
          <p className="text-gray-600">Please wait while we verify your payment and confirm your items.</p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show redirecting state
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center bg-white shadow-xl rounded-2xl p-10 w-full max-w-md border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-8">
            Your order has been successfully placed and is being prepared.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
              <FiLoader className="animate-spin" />
              <span>Redirecting to your orders...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center bg-white shadow-xl rounded-2xl p-10 w-full max-w-md border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle className="text-red-500 text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </button>
            <button
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
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
            {order?.paymentStatus === "completed" ? (
              <FiCheckCircle className="text-4xl" style={{ color: getStatusColor() }} />
            ) : order?.paymentStatus === "failed" ? (
              <FiXCircle className="text-4xl" style={{ color: getStatusColor() }} />
            ) : (
              <FiClock className="text-4xl" style={{ color: getStatusColor() }} />
            )}
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
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center shadow-lg shadow-red-200"
              onClick={() => navigate("/cart")}
            >
              <FiLoader className="mr-2" /> Try Again
            </button>
          )}

          {order?.paymentStatus === "completed" && (
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg shadow-blue-200"
              onClick={() => navigate("/orders")}
            >
              <FiShoppingBag className="mr-2" /> View Order Details
            </button>
          )}

          {order?.paymentStatus !== "completed" && (
            <Link
              to="/orders"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg shadow-blue-200"
            >
              <FiShoppingBag className="mr-2" /> View Order Details
            </Link>
          )}

          <button
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
            onClick={() => navigate("/")}
          >
            <FiArrowRight className="mr-2" rotate={180} /> Continue Shopping
          </button>
        </div>

        {order?.paymentStatus === "pending" && (
          <p className="text-center text-gray-500 mt-6 text-sm flex items-center justify-center gap-2">
            <FiMail />
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
