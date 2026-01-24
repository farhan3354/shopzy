import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiCreditCard,
  FiRefreshCw,
  FiTag,
  FiX,
  FiAlertTriangle,
  FiPlus,
  FiCheck,
  FiTruck,
} from "react-icons/fi";
import api from "../../utils/api";
import { fetchCartCount } from "../redux/authSlice/cartSlice";

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [checkingCart, setCheckingCart] = useState(true);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);



  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [priceValidation, setPriceValidation] = useState({
    checking: false,
    hasChanges: false,
    changedItems: [],
    originalTotal: 0,
    currentTotal: 0,
  });

  const [checkoutSessionId, setCheckoutSessionId] = useState(null);
  const [cartLocked, setCartLocked] = useState(false);

  const token = useSelector((state) => state.auth.token);
  const email = useSelector((state) => state.auth.user?.email);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [newShippingAddress, setNewShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    phone: "",
    addressType: "home",
  });

  useEffect(() => {
    let sessionId = sessionStorage.getItem('checkoutSessionId');
    if (!sessionId) {
      sessionId = `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('checkoutSessionId', sessionId);
    }
    setCheckoutSessionId(sessionId);
    
    fetchCart(sessionId);
    fetchUserAddresses();

    return () => {
      if (sessionId) {
        unlockCartOnUnmount(sessionId);
      }
    };
  }, []);

  const unlockCartOnUnmount = async (sessionId) => {
    try {
      await api.post('/cart/unlock', {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-Checkout-Session': sessionId
        }
      });
      console.log("✅ Cart unlocked on component unmount");
    } catch (error) {
      console.error("Error unlocking cart:", error);
    }
  };

  const fetchCart = async (sessionIdOverride = null) => {
    try {
      setCheckingCart(true);
      const activeSessionId = sessionIdOverride || checkoutSessionId;
      const headers = {
        Authorization: `Bearer ${token}`,
        ...(activeSessionId && { 'X-Checkout-Session': activeSessionId })
      };

      const res = await api.get("/cartproducts", { headers });

      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Handle cart locked error
      if (error.response?.status === 423) {
        alert("Cart is locked in another session. Please wait or refresh the page.");
      }
    } finally {
      setCheckingCart(false);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      setFetchingAddresses(true);
      const res = await api.get("/user/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setUserAddresses(res.data.addresses);
        const defaultAddress = res.data.addresses.find(
          (addr) => addr.isDefault
        );
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setFetchingAddresses(false);
    }
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();

    const required = [
      "fullName",
      "address",
      "city",
      "state",
      "pinCode",
      "phone",
    ];
    const isValid = required.every((field) => newShippingAddress[field].trim());

    if (!isValid) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await api.post("/user/addresses/add", newShippingAddress, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setUserAddresses(res.data.addresses);
        const newAddress = res.data.addresses[res.data.addresses.length - 1];
        setSelectedAddress(newAddress);
        setShowNewAddressForm(false);

        setNewShippingAddress({
          fullName: "",
          address: "",
          city: "",
          state: "",
          pinCode: "",
          country: "India",
          phone: "",
          addressType: "home",
        });

        alert("Address added successfully!");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      alert("Failed to add address. Please try again.");
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAddress) {
      alert("Please select a shipping address");
      return;
    }

    if (!checkoutSessionId) {
      alert("Checkout session not ready. Please refresh the page.");
      return;
    }

    try {
      setLoading(true);
      
      const headers = {
        Authorization: `Bearer ${token}`,
        'X-Checkout-Session': checkoutSessionId
      };

      const stockCheckResponse = await api.post(
        "/cart/validate-stock",
        {},
        { headers }
      );

      if (!stockCheckResponse.data.success) {
        alert(stockCheckResponse.data.message || "Some items are out of stock");
        await fetchCart();
        return;
      }

      setCartLocked(true);
      setStep(2);
    } catch (error) {
      console.error("Error validating stock:", error);
      if (error.response?.status === 423) {
        alert("Cart is locked in another session. Please refresh the page.");
        window.location.reload();
      } else {
        alert("Error validating cart items. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewShippingAddress({
      ...newShippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const calculateCartSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.productId?.price || item.price) * item.quantity;
    }, 0);
  };

  const calculateCartTotal = () => {
    const subtotal = calculateCartSubtotal();
    const discount =
      appliedCoupon && appliedCoupon.coupantype !== "cashback"
        ? appliedCoupon.discountAmount
        : 0;

    return Math.max(0, subtotal - discount);
  };



  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      setApplyingCoupon(true);
      setCouponError("");

      const cartLength = cart?.items?.length || 0;
      const totalQuantity =
        cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      const response = await api.post(
        "/coupons/validate",
        {
          code: couponCode,
          cartTotal: calculateCartSubtotal(),
          cartItems: cart?.items || [],
          cartLength: cartLength,
          totalQuantity: totalQuantity,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        setCouponCode("");
        console.log("✅ Coupon applied:", response.data.coupon);
      } else {
        setCouponError(response.data.message);
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || "Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const validateCartPrices = async () => {
    try {
      setPriceValidation((prev) => ({
        ...prev,
        checking: true,
        hasChanges: false,
        changedItems: [],
      }));

      console.log("💰 Validating cart prices...");
      
      const headers = {
        Authorization: `Bearer ${token}`,
        ...(checkoutSessionId && { 'X-Checkout-Session': checkoutSessionId })
      };

      const freshCartResponse = await api.get("/cartproducts", { headers });

      if (!freshCartResponse.data.success) {
        console.error("❌ Failed to fetch fresh cart data");
        return { isValid: false, message: "Failed to validate cart" };
      }

      const freshCart = freshCartResponse.data.cart;

      if (!freshCart || !freshCart.items || freshCart.items.length === 0) {
        return { isValid: false, message: "Your cart is empty" };
      }
      if (!cart || cart.items.length !== freshCart.items.length) {
        setCart(freshCart);
        return {
          isValid: false,
          message: "Your cart has been updated. Please review the changes.",
        };
      }

      const changedItems = [];
      let hasPriceChanges = false;
      for (let i = 0; i < cart.items.length; i++) {
        const originalItem = cart.items[i];
        const freshItem = freshCart.items[i];
        if (originalItem.productId?._id !== freshItem.productId?._id) {
          setCart(freshCart);
          return {
            isValid: false,
            message: "Your cart items have changed. Please review.",
          };
        }
        const originalPrice =
          originalItem.productId?.price || originalItem.price;
        const freshPrice = freshItem.productId?.price || freshItem.price;

        if (originalPrice !== freshPrice) {
          hasPriceChanges = true;
          changedItems.push({
            name: freshItem.productId?.name || freshItem.name,
            originalPrice,
            newPrice: freshPrice,
            quantity: freshItem.quantity,
            difference: (freshPrice - originalPrice) * freshItem.quantity,
          });
          console.log(
            `💰 Price changed for ${freshItem.productId?.name}: ₹${originalPrice} → ₹${freshPrice}`
          );
        }
        if (freshItem.productId?.stock < freshItem.quantity) {
          return {
            isValid: false,
            message: `"${freshItem.productId?.name}" is out of stock. Available: ${freshItem.productId?.stock}`,
          };
        }
      }
      const originalSubtotal = calculateCartSubtotal();
      const freshSubtotal = freshCart.items.reduce((total, item) => {
        return total + (item.productId?.price || item.price) * item.quantity;
      }, 0);

      let freshTotal = freshSubtotal;
      let updatedCoupon = appliedCoupon;
      if (hasPriceChanges && appliedCoupon) {
        console.log("🔄 Re-validating coupon with new prices...");

        try {
          const cartLength = freshCart.items.length;
          const totalQuantity = freshCart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          const couponResponse = await api.post(
            "/coupons/validate",
            {
              code: appliedCoupon.code,
              cartTotal: freshSubtotal,
              cartItems: freshCart.items,
              cartLength: cartLength,
              totalQuantity: totalQuantity,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (couponResponse.data.success) {
            updatedCoupon = couponResponse.data.coupon;
            freshTotal = updatedCoupon.finalAmount;
            console.log(
              "✅ Coupon re-validated with new prices:",
              updatedCoupon
            );
          } else {
            updatedCoupon = null;
            console.log("❌ Coupon no longer valid with new prices");
          }
        } catch (error) {
          console.error("❌ Error re-validating coupon:", error);
          updatedCoupon = null;
        }
      } else {
        freshTotal =
          appliedCoupon && appliedCoupon.coupantype !== "cashback"
            ? freshSubtotal - (appliedCoupon.discountAmount || 0)
            : freshSubtotal;
      }

      const originalTotal = calculateCartTotal();

      setPriceValidation({
        checking: false,
        hasChanges: hasPriceChanges,
        changedItems,
        originalTotal,
        currentTotal: freshTotal,
      });

      if (hasPriceChanges) {
        setCart(freshCart);
        if (updatedCoupon !== appliedCoupon) {
          setAppliedCoupon(updatedCoupon);
        }
        console.log("🔄 Cart updated with new prices and coupon");
      }

      return {
        isValid: !hasPriceChanges,
        hasPriceChanges,
        changedItems,
        originalTotal,
        currentTotal: freshTotal,
        message: hasPriceChanges
          ? "Product prices have been updated" +
            (updatedCoupon !== appliedCoupon
              ? " and coupon was re-validated"
              : "")
          : "Prices are valid",
      };
    } catch (error) {
      console.error("❌ Price validation error:", error);
      setPriceValidation((prev) => ({ ...prev, checking: false }));
      return {
        isValid: false,
        message: "Failed to validate prices. Please try again.",
      };
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const clearCartAfterPayment = async () => {
    try {
      console.log("🗑️ Clearing cart after successful payment...");

      const response = await api.delete("/cart/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        console.log("✅ Cart cleared successfully after payment");
        setCart({ ...cart, items: [] });
      } else {
        console.error("❌ Failed to clear cart:", response.data.message);
      }
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
    }
  };

  const startOrderStatusPolling = (razorpayOrderId) => {
    console.log("🔄 Starting status polling for:", razorpayOrderId);

    let pollCount = 0;
    const maxPolls = 200;

    const interval = setInterval(async () => {
      try {
        pollCount++;
        console.log(
          `🔍 Polling order status (attempt ${pollCount}) for:`,
          razorpayOrderId
        );

        const response = await api.get(`/orders/status/${razorpayOrderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const order = response.data.order;
          console.log("📦 Order status:", order.paymentStatus);

          if (order.paymentStatus === "completed") {
            clearInterval(interval);
            console.log(
              "✅ Payment completed, clearing cart and redirecting..."
            );

            await clearCartAfterPayment();

            navigate(`/order-success/${order._id}`);
          }

          if (order.paymentStatus === "failed") {
            clearInterval(interval);
            console.log("❌ Payment failed");
            alert(`Payment failed: ${order.failureReason || "Unknown error"}`);
          }
        }
      } catch (error) {
        console.log(`🔄 Poll ${pollCount} - Status:`, error.response?.status);

        if (error.response?.status === 404) {
          console.log("⏳ Order not found yet, webhook might be processing...");

          if (pollCount > 20) {
            console.log("⏰ Still waiting for order creation...");
          }
        } else if (error.response?.status === 400) {
          console.error("❌ Invalid order ID format");
          clearInterval(interval);
          alert(
            "There was an issue with the order ID. Please contact support."
          );
        } else {
          console.error("❌ Error polling order status:", error);
        }

        if (pollCount >= maxPolls) {
          clearInterval(interval);
          console.log("⏰ Stopped polling after maximum attempts");
          alert(
            "Payment is taking longer than expected. Please check your orders page for status."
          );
        }
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      console.log("⏰ Stopped polling after 10 minutes (safety timeout)");
    }, 600000);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  // UPDATED: COD Order with session management
  const handleCODOrder = async () => {
    if (!cart || cart.items.length === 0) {
      alert("Your cart is empty. Please add items to proceed.");
      return;
    }

    if (!selectedAddress) {
      alert("Please select a shipping address");
      return;
    }

    if (!checkoutSessionId) {
      alert("Checkout session not ready. Please refresh the page.");
      return;
    }

    try {
      setLoading(true);

      console.log("🔍 Validating cart prices before COD order...");
      const priceValidation = await validateCartPrices();

      if (!priceValidation.isValid) {
        if (priceValidation.hasPriceChanges) {
          const priceChangeMessage = priceValidation.changedItems
            .map(
              (item) =>
                `• ${item.name}: ₹${item.originalPrice} → ₹${item.newPrice} (Qty: ${item.quantity})`
            )
            .join("\n");

          const totalChange =
            priceValidation.currentTotal - priceValidation.originalTotal;
          const changeType = totalChange > 0 ? "increased" : "decreased";
          const changeAmount = Math.abs(totalChange);

          const userConfirmed = window.confirm(
            `Product prices have been updated:\n\n${priceChangeMessage}\n\nOrder total has ${changeType} from ₹${priceValidation.originalTotal} to ₹${priceValidation.currentTotal} (${changeType} by ₹${changeAmount}).\n\nDo you want to continue with the updated prices?`
          );

          if (!userConfirmed) {
            setLoading(false);
            return;
          }
        } else {
          alert(`Order validation failed: ${priceValidation.message}`);
          setLoading(false);
          return;
        }
      }

      console.log("🔄 Creating COD order...");

      let couponCodeToSend = null;

      if (appliedCoupon) {
          couponCodeToSend = appliedCoupon.code;
          console.log(`🎫 Sending coupon code: ${couponCodeToSend}`);
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'X-Checkout-Session': checkoutSessionId
      };

      const orderResponse = await api.post(
        "/orders/create-cod",
        {
          shippingAddress: selectedAddress,
          couponCode: couponCodeToSend,
        },
        { headers }
      );

      console.log("📦 COD order response:", orderResponse.data);

      if (!orderResponse.data.success) {
        alert(orderResponse.data.message || "Failed to create COD order");
        return;
      }

      const { order } = orderResponse.data;

      await clearCartAfterPayment();

      // Update cart count in navbar
      dispatch(fetchCartCount());

      navigate('/');
    } catch (error) {
      console.error("❌ COD order error:", error);
      
      if (error.response?.status === 423) {
        alert("Cart session expired. Please refresh the page and try again.");
        window.location.reload();
      } else {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to create COD order. Please try again.";
        alert(errorMessage);
      }
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!cart || cart.items.length === 0) {
      alert("Your cart is empty. Please add items to proceed.");
      return;
    }

    if (!checkoutSessionId) {
      alert("Checkout session not ready. Please refresh the page.");
      return;
    }

    try {
      setLoading(true);

      console.log("🔍 Validating cart prices before payment...");
      const priceValidation = await validateCartPrices();

      if (!priceValidation.isValid) {
        if (priceValidation.hasPriceChanges) {
          const priceChangeMessage = priceValidation.changedItems
            .map(
              (item) =>
                `• ${item.name}: ₹${item.originalPrice} → ₹${item.newPrice} (Qty: ${item.quantity})`
            )
            .join("\n");

          const totalChange =
            priceValidation.currentTotal - priceValidation.originalTotal;
          const changeType = totalChange > 0 ? "increased" : "decreased";
          const changeAmount = Math.abs(totalChange);

          const userConfirmed = window.confirm(
            `Product prices have been updated:\n\n${priceChangeMessage}\n\nOrder total has ${changeType} from ₹${priceValidation.originalTotal} to ₹${priceValidation.currentTotal} (${changeType} by ₹${changeAmount}).\n\nDo you want to continue with the updated prices?`
          );

          if (!userConfirmed) {
            setLoading(false);
            return;
          }
        } else {
          alert(`Payment validation failed: ${priceValidation.message}`);
          setLoading(false);
          return;
        }
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Please refresh the page.");
        return;
      }

      console.log("🔄 Creating payment with cart items...");

      let couponCodeToSend = null;

      if (appliedCoupon) {
          couponCodeToSend = appliedCoupon.code;
          console.log(`🎫 Sending coupon code: ${couponCodeToSend}`);
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'X-Checkout-Session': checkoutSessionId
      };

      const paymentResponse = await api.post(
        "/payments/create-from-cart",
        {
          shippingAddress: selectedAddress,
          couponCode: couponCodeToSend,
        },
        { headers }
      );

      console.log("📦 Payment response:", paymentResponse.data);

      if (!paymentResponse.data.success) {
        alert(paymentResponse.data.message || "Failed to create payment");
        return;
      }

      const {
        order: razorpayOrder,
        orderId,
        amountDetails,
        sessionId: paymentSessionId,
      } = paymentResponse.data;

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      const finalRazorpayAmount = amountDetails
        ? amountDetails.razorpayAmount
        : calculateCartTotal();

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount, 
        currency: razorpayOrder.currency,
        name: "Shop Now",
        description: `Order Payment - ₹${finalRazorpayAmount}`, 
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            console.log(
              "✅ Payment successful, waiting for webhook...",
              response
            );
            
            // Refresh wallet balance after successful payment
            await fetchCart();
            
            // Update cart count in navbar
            dispatch(fetchCartCount());
            
            startOrderStatusPolling(razorpayOrder.id);
            navigate('/');
          } catch (error) {
            console.error("❌ Payment handler error:", error);
            alert(
              "Payment completed but there was an issue. Please check your orders."
            );
            navigate(`/order-pending/${razorpayOrder.id}`);
          }
        },
        prefill: {
          name: selectedAddress.fullName,
          contact: selectedAddress.phone,
          email: email || "customer@example.com",
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: async function () {
            console.log("❌ Payment modal dismissed - refreshing wallet balance");
            
            try {
              // Refresh wallet balance after modal dismissal
              await fetchCart();
              console.log("🔄 Wallet balance refreshed after modal dismissal");
            } catch (error) {
              console.error("❌ Error refreshing wallet balance:", error);
            }
            
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("❌ Payment failed:", response.error);
        
        // Refresh wallet balance on payment failure
        setTimeout(() => {
          fetchCart();
        }, 1000);
        
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("❌ Payment error:", error);
      
      if (error.response?.status === 423) {
        alert("Cart session expired. Please refresh the page and try again.");
        window.location.reload();
      } else {
        const errorMessage =
          error.response?.data?.message || "Payment failed. Please try again.";
        alert(errorMessage);
      }
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (selectedPaymentMethod === "razorpay") {
      await handleRazorpayPayment();
    } else if (selectedPaymentMethod === "cod") {
      await handleCODOrder();
    } else {
      alert("Please select a payment method");
    }
  };

  // NEW: Handle back button to unlock cart
  const handleBackToAddress = () => {
    setStep(1);
    // Optionally unlock cart when going back
    if (cartLocked) {
      unlockCartOnUnmount(checkoutSessionId);
      setCartLocked(false);
    }
  };

  if (checkingCart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="animate-spin text-indigo-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">
            Loading your cart...
          </h2>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 ml-4">Checkout</h1>
        </div>

        {priceValidation.hasChanges && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiAlertTriangle className="text-yellow-500 mr-3" />
              <div>
                <p className="text-yellow-800 font-medium">
                  Product prices have been updated
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Please review the updated prices before proceeding with
                  payment.
                </p>
                {priceValidation.changedItems.map((item, index) => (
                  <div key={index} className="text-yellow-600 text-xs mt-1">
                    • {item.name}: ₹{item.originalPrice} → ₹{item.newPrice}
                    (Qty: {item.quantity}, Change: ₹{item.difference})
                  </div>
                ))}
                <p className="text-yellow-800 text-sm font-semibold mt-2">
                  Total changed from ₹{priceValidation.originalTotal} to ₹
                  {priceValidation.currentTotal}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                    1
                  </div>
                  <h2 className="text-xl font-semibold ml-3">
                    Shipping Address
                  </h2>
                </div>

                {fetchingAddresses ? (
                  <div className="text-center py-8">
                    <FiRefreshCw className="animate-spin text-indigo-600 text-2xl mx-auto mb-2" />
                    <p>Loading addresses...</p>
                  </div>
                ) : (
                  <>
                    {userAddresses.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Select Address
                        </h3>
                        <div className="space-y-3">
                          {userAddresses.map((address, index) => (
                            <div
                              key={index}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                selectedAddress?._id === address._id
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleAddressSelect(address)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <FiMapPin className="text-gray-400 mr-2" />
                                    <span className="font-semibold">
                                      {address.fullName}
                                    </span>
                                    {address.isDefault && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                        Default
                                      </span>
                                    )}
                                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                      {address.addressType}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {address.address}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {address.city}, {address.state} -{" "}
                                    {address.pinCode}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Phone: {address.phone}
                                  </p>
                                </div>
                                {selectedAddress?._id === address._id && (
                                  <FiCheck className="text-indigo-600 text-xl" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!showNewAddressForm ? (
                      <button
                        onClick={() => setShowNewAddressForm(true)}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                      >
                        <FiPlus className="text-2xl text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 font-medium">
                          Add New Address
                        </p>
                      </button>
                    ) : (
                      <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Add New Address
                        </h3>
                        <form onSubmit={handleAddNewAddress}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                name="fullName"
                                value={newShippingAddress.fullName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address *
                              </label>
                              <textarea
                                name="address"
                                value={newShippingAddress.address}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                City *
                              </label>
                              <input
                                type="text"
                                name="city"
                                value={newShippingAddress.city}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                State *
                              </label>
                              <input
                                type="text"
                                name="state"
                                value={newShippingAddress.state}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                PIN Code *
                              </label>
                              <input
                                type="text"
                                name="pinCode"
                                value={newShippingAddress.pinCode}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone *
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={newShippingAddress.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Type
                              </label>
                              <select
                                name="addressType"
                                value={newShippingAddress.addressType}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="home">Home</option>
                                <option value="work">Work</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-6">
                            <button
                              type="submit"
                              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
                            >
                              Save Address
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowNewAddressForm(false)}
                              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    {selectedAddress && (
                      <button
                        onClick={handleAddressSubmit}
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
                      >
                        {loading ? "Validating..." : "Continue to Payment"}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                    2
                  </div>
                  <h2 className="text-xl font-semibold ml-3">Payment Method</h2>
                </div>

                {selectedAddress && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Shipping to:</h3>
                    <p className="text-sm">{selectedAddress.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {selectedAddress.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedAddress.city}, {selectedAddress.state} -{" "}
                      {selectedAddress.pinCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {selectedAddress.phone}
                    </p>
                    <button
                      onClick={handleBackToAddress}
                      className="text-indigo-600 text-sm mt-2 hover:text-indigo-800"
                    >
                      Change address
                    </button>
                  </div>
                )}
                <div className="mb-6 border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FiTag className="mr-2 text-green-600" />
                    Apply Coupon
                  </h3>

                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                      >
                        {applyingCoupon ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`border rounded-lg p-4 ${
                        appliedCoupon.coupantype === "cashback"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p
                            className={`font-semibold ${
                              appliedCoupon.coupantype === "cashback"
                                ? "text-blue-800"
                                : "text-green-800"
                            }`}
                          >
                            {appliedCoupon.name}
                            {appliedCoupon.coupantype === "cashback" && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                Cashback
                              </span>
                            )}
                          </p>
                          <p
                            className={`text-sm ${
                              appliedCoupon.coupantype === "cashback"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            {appliedCoupon.description}
                          </p>
                          <p
                            className={`text-sm ${
                              appliedCoupon.coupantype === "cashback"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            {appliedCoupon.coupantype === "cashback"
                              ? `Get ₹${appliedCoupon.discountAmount} cashback after order`
                              : `Discount: ₹${appliedCoupon.discountAmount}`}
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiX size={20} />
                        </button>
                      </div>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-red-600 text-sm mt-2">{couponError}</p>
                  )}
                </div>
                <div className="space-y-4 mb-6">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === "razorpay"
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePaymentMethodSelect("razorpay")}
                  >
                    <div className="flex items-center">
                      <FiCreditCard className="text-indigo-600 text-xl mr-3" />
                      <div className="flex-1">
                        <h3 className="font-semibold">Pay with Razorpay</h3>
                        <p className="text-sm text-gray-600">
                          Secure payment processing
                        </p>
                      </div>
                      {selectedPaymentMethod === "razorpay" && (
                        <FiCheck className="text-indigo-600 text-xl" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === "cod"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePaymentMethodSelect("cod")}
                  >
                    <div className="flex items-center">
                      <FiTruck className="text-green-600 text-xl mr-3" />
                      <div className="flex-1">
                        <h3 className="font-semibold">Cash on Delivery</h3>
                        <p className="text-sm text-gray-600">
                          Pay when you receive your order
                        </p>
                      </div>
                      {selectedPaymentMethod === "cod" && (
                        <FiCheck className="text-green-600 text-xl" />
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={
                    loading ||
                    priceValidation.checking ||
                    !selectedPaymentMethod
                  }
                  className={`w-full text-white py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center ${
                    selectedPaymentMethod === "cod"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {priceValidation.checking ? (
                    <>
                      <FiRefreshCw className="animate-spin mr-2" />
                      Checking Prices...
                    </>
                  ) : loading ? (
                    "Processing..."
                  ) : selectedPaymentMethod === "cod" ? (
                    `Place COD Order - ₹${calculateCartTotal()}`
                  ) : (
                    `Pay ₹${calculateCartTotal()}`
                  )}
                </button>

                <button
                  onClick={handleBackToAddress}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 mt-3"
                >
                  Back to Address
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {cart?.items && cart.items.length > 0 ? (
                  cart.items.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.productId?.name || item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × ₹
                          {item.productId?.price || item.price}
                        </p>
                        {item.selectedAttributes &&
                          Object.keys(item.selectedAttributes).length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {Object.entries(item.selectedAttributes).map(
                                ([key, value]) => (
                                  <span key={key} className="block">
                                    {key}: {value}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                      </div>
                      <span className="font-semibold">
                        ₹{(item.productId?.price || item.price) * item.quantity}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No items in cart</p>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{calculateCartSubtotal()}</span>
                </div>

                {appliedCoupon && appliedCoupon.coupantype !== "cashback" && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Amount to Pay</span>
                  <span>₹{calculateCartTotal()}</span>
                </div>

                {appliedCoupon && appliedCoupon.coupantype !== "cashback" && (
                  <p className="text-green-600 text-sm text-center">
                    You saved ₹{appliedCoupon.discountAmount}!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
