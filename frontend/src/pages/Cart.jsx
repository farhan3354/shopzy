import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiHeart,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useFetchData from "../hooks/useFetchData";
import { CartLoading } from "../components/common/LoadingSpinner";
import { updateCartCount } from "../redux/authSlice/cartSlice";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showAttributesModal, setShowAttributesModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempAttributes, setTempAttributes] = useState({});

  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const { fetchData, updateData, deleteDataCart, loading, error } =
    useFetchData(token);

  const quantityModalRef = useRef(null);
  const attributesModalRef = useRef(null);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showQuantityModal &&
        quantityModalRef.current &&
        !quantityModalRef.current.contains(event.target)
      ) {
        setShowQuantityModal(false);
      }
      if (
        showAttributesModal &&
        attributesModalRef.current &&
        !attributesModalRef.current.contains(event.target)
      ) {
        setShowAttributesModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showQuantityModal, showAttributesModal]);

  const fetchCart = async () => {
    await fetchData("/cartproduct", (data) => {
      if (data.success) setCart(data.cart);
    });
  };

  const getItemPrice = (item) => {
    return item.productId?.price || 0;
  };

  const calculateItemTotal = (item) => {
    const price = getItemPrice(item);
    return price * item.quantity;
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
      await updateData(
        "/cart/update",
        { itemId, quantity: newQuantity },
        `Quantity updated to ${newQuantity}`
      );
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      }));
      setShowQuantityModal(false);
    } catch (error) {
      console.error("❌ Error updating quantity:", error);
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const updateAttributes = async (itemId, newAttributes) => {
    try {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
      await updateData(
        "/cart/update-attributes",
        { itemId, selectedAttributes: newAttributes },
        "Attributes updated successfully"
      );
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item._id === itemId
            ? { ...item, selectedAttributes: newAttributes }
            : item
        ),
      }));
      setShowAttributesModal(false);
    } catch (error) {
      console.error("❌ Error updating attributes:", error);
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // const removeItem = async (itemId) => {
  //   const confirm = await Swal.fire({
  //     title: "Are you sure?",
  //     text: "Do you want to remove this item from your cart?",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#3085d6",
  //     confirmButtonText: "Yes, remove it",
  //     cancelButtonText: "Cancel",
  //   });

  //   if (!confirm.isConfirmed) return;

  //   try {
  //     await deleteDataCart("/cart/remove", { itemId }, "Item removed from cart");
  //     setCart((prevCart) => ({
  //       ...prevCart,
  //       items: prevCart.items.filter((item) => item._id !== itemId),
  //     }));
  //   } catch (error) {
  //     console.error("❌ Error removing item:", error);
  //   }
  // };
  const dispatch = useDispatch();
  const removeItem = async (itemId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this item from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteDataCart("/cart/remove", { itemId }, "Item removed from cart");

      // Update local state
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter((item) => item._id !== itemId),
      }));

      // Update cart count in Redux
      dispatch(updateCartCount());
    } catch (error) {
      console.error("❌ Error removing item:", error);
    }
  };

  const openQuantityModal = (item) => {
    setSelectedItem(item);
    setTempQuantity(item.quantity);
    setShowQuantityModal(true);
  };

  const openAttributesModal = (item) => {
    setSelectedItem(item);
    setTempAttributes(item.selectedAttributes || {});
    setShowAttributesModal(true);
  };

  const handleQuantitySelect = (quantity, e) => {
    if (e) e.stopPropagation();
    setTempQuantity(quantity);
  };

  const handleAttributeSelect = (attributeName, value, e) => {
    if (e) e.stopPropagation();
    setTempAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  const handleQuantityIncrement = (e) => {
    if (e) e.stopPropagation();
    setTempQuantity((prev) => prev + 1);
  };

  const handleQuantityDecrement = (e) => {
    if (e) e.stopPropagation();
    setTempQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleQuantityDone = (e) => {
    if (e) e.stopPropagation();
    if (selectedItem) {
      updateQuantity(selectedItem._id, tempQuantity);
    }
  };

  const handleAttributesDone = (e) => {
    if (e) e.stopPropagation();
    if (selectedItem) {
      updateAttributes(selectedItem._id, tempAttributes);
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const getFirstAttribute = (selectedAttributes) => {
    if (!selectedAttributes || Object.keys(selectedAttributes).length === 0) {
      return { name: "Select", value: "Options" };
    }

    const firstKey = Object.keys(selectedAttributes)[0];
    return {
      name: firstKey,
      value: selectedAttributes[firstKey],
    };
  };

  const getAvailableAttributes = (product) => {
    if (!product || !product.attributes) return [];

    return product.attributes.map((attr) => ({
      name: attr.name,
      values: attr.value || [],
    }));
  };

  const calculateSubtotal = () =>
    cart?.items?.reduce((total, item) => total + calculateItemTotal(item), 0) ||
    0;

  const shippingCharge = 100;
  const calculateTotal = () => calculateSubtotal() + shippingCharge;

  // ✅ FIXED: Calculate discounted price for display
  const getDiscountedPrice = (price) => {
    return Math.round(price * 2.5); // 150% markup for display
  };

  const getDiscountPercentage = (price) => {
    const discountedPrice = getDiscountedPrice(price);
    const discount = ((discountedPrice - price) / discountedPrice) * 100;
    return Math.round(discount);
  };

  const QuantityModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={() => setShowQuantityModal(false)}
    >
      <div
        ref={quantityModalRef}
        className="bottomsheet-wrapper w-full max-w-md bg-white rounded-t-2xl animate-slide-up"
        onClick={handleModalClick}
      >
        <div className="close-icon-wrapper p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Select Quantity
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQuantityModal(false);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="bottomsheet-container p-6">
          <div className="options-item-container grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((quantity) => (
              <button
                key={quantity}
                onClick={(e) => handleQuantitySelect(quantity, e)}
                className={`component-OptionItemBox py-3 px-4 rounded-lg border-2 text-center font-semibold transition-all ${
                  tempQuantity === quantity
                    ? "border-[#8F2B53] bg-[#f6e9ee] text-[#8F2B53]"
                    : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
                }`}
              >
                {quantity}
              </button>
            ))}
          </div>

          <div
            className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg"
            onClick={handleModalClick}
          >
            <button
              onClick={handleQuantityDecrement}
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <FiMinus size={16} />
            </button>

            <span className="text-lg font-semibold">{tempQuantity}</span>

            <button
              onClick={handleQuantityIncrement}
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <FiPlus size={16} />
            </button>
          </div>

          <button
            onClick={handleQuantityDone}
            disabled={updatingItems[selectedItem?._id]}
            className="w-full bg-[#8F2B53] text-white py-4 rounded-lg font-semibold hover:bg-[#7a2450] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatingItems[selectedItem?._id] ? "Updating..." : "Done"}
          </button>
        </div>
      </div>
    </div>
  );

  const AttributesModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={() => setShowAttributesModal(false)}
    >
      <div
        ref={attributesModalRef}
        className="bottomsheet-wrapper w-full max-w-md bg-white rounded-t-2xl animate-slide-up max-h-[80vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <div className="close-icon-wrapper p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Select Options
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAttributesModal(false);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="bottomsheet-container p-6">
          {selectedItem &&
            getAvailableAttributes(selectedItem.productId).map(
              (attribute, index) => (
                <div key={index} className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3 capitalize">
                    {attribute.name}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attribute.values.map((value, valueIndex) => (
                      <button
                        key={valueIndex}
                        onClick={(e) =>
                          handleAttributeSelect(attribute.name, value, e)
                        }
                        className={`px-4 py-2 text-sm border-2 rounded-lg transition-all ${
                          tempAttributes[attribute.name] === value
                            ? "border-[#8F2B53] bg-[#f6e9ee] text-[#8F2B53] font-semibold"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

          <button
            onClick={handleAttributesDone}
            disabled={updatingItems[selectedItem?._id]}
            className="w-full bg-[#8F2B53] text-white py-4 rounded-lg font-semibold hover:bg-[#7a2450] transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {updatingItems[selectedItem?._id] ? "Updating..." : "Done"}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <CartLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FiShoppingCart className="text-5xl text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-6">
            {error || "Cart not found"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FiShoppingCart className="text-5xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to get started!
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>

      <div
        className="component-BannerImage animateFadeInForCLS"
        style={{ margin: "0px" }}
      >
        <a href="/cart">
          <div className="flex justify-center" style={{ height: "100%" }}>
            <img
              alt="aramya-app-download"
              src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/4_af606352-2da8-4089-bb27-0bcdb05ac08d_585x.jpg?v=1758529607"
              className="mx-auto img-fluid"
              style={{ borderRadius: "0px" }}
            />
          </div>
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => {
              const firstAttribute = getFirstAttribute(item.selectedAttributes);
              const itemPrice = getItemPrice(item);
              const discountedPrice = getDiscountedPrice(itemPrice);
              const discountPercentage = getDiscountPercentage(itemPrice);

              return (
                <div
                  key={item._id}
                  className="bg-white border-b border-gray-200 pb-6"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-32 flex-shrink-0 relative">
                      <img
                        src={
                          item.productId?.images?.[0] ||
                          "/placeholder-image.jpg"
                        }
                        alt={item.productId?.name}
                        className="w-full h-full object-cover object-center"
                        style={{ filter: "grayscale(0%)" }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 py-1">
                        <span className="text-xs text-white text-center block font-medium">
                          {item.selectedAttributes?.Category || "Product"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-normal text-gray-900 line-clamp-2">
                          {item.productId?.name}
                        </p>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                          >
                            <path d="m12 10.587 4.95-4.95 1.415 1.414-4.95 4.95 4.95 4.95-1.415 1.414-4.95-4.95-4.95 4.95-1.413-1.415 4.95-4.95-4.95-4.95L7.05 5.638z"></path>
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{itemPrice}
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          ₹{discountedPrice}
                        </p>
                        <p className="text-sm text-red-600 font-medium">
                          -{discountPercentage}%
                        </p>
                      </div>
                      {item.selectedAttributes &&
                        Object.keys(item.selectedAttributes).length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(item.selectedAttributes).map(
                                ([key, value]) => (
                                  <span
                                    key={key}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border"
                                  >
                                    {key}:{" "}
                                    <span className="font-medium">{value}</span>
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      <div className="flex gap-4 mb-3">
                        <div className="relative">
                          <button
                            onClick={() => openQuantityModal(item)}
                            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 min-w-[100px]"
                          >
                            <span className="text-gray-600">Qty:</span>
                            <span className="font-medium">{item.quantity}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              className="w-3 h-3 text-gray-500"
                            >
                              <path d="m12 13.171 4.95-4.95 1.414 1.415L12 16 5.636 9.636 7.05 8.222z"></path>
                            </svg>
                          </button>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => openAttributesModal(item)}
                            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 min-w-[120px]"
                          >
                            <span className="text-gray-600">
                              {firstAttribute.name}:
                            </span>
                            <span className="font-medium">
                              {firstAttribute.value}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              className="w-3 h-3 text-gray-500"
                            >
                              <path d="m12 13.171 4.95-4.95 1.414 1.415L12 16 5.636 9.636 7.05 8.222z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 15 15"
                          className="w-4 h-4"
                          style={{ fill: "rgb(143, 42, 83)" }}
                        >
                          <path
                            stroke="#8F2B53"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="0.883"
                            d="m7.067 12.8-4.712-2.65v-5.3L7.067 2.2l4.71 2.65V7.5m-4.711 0 4.712-2.65M7.066 7.5v5.3m.001-5.3L2.355 4.85m10.599 6.184H8.832m1.767-1.767-1.767 1.767 1.767 1.766"
                          ></path>
                        </svg>
                        <p className="text-xs text-gray-700">
                          <b>14 days</b> return available
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">Subtotal</p>
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{calculateSubtotal()}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-gray-700">Shipping charges</p>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                      >
                        <path
                          fill="#6C6C6C"
                          d="M7.334 11.334h1.333v-4H7.334zM8.001 6a.65.65 0 0 0 .475-.192.64.64 0 0 0 .191-.474.65.65 0 0 0-.192-.475.64.64 0 0 0-.474-.192.64.64 0 0 0-.475.192.65.65 0 0 0-.192.474q0 .283.192.476A.64.64 0 0 0 8.001 6m0 8.667a6.5 6.5 0 0 1-2.6-.525 6.7 6.7 0 0 1-2.117-1.425A6.7 6.7 0 0 1 1.859 10.6 6.5 6.5 0 0 1 1.334 8q0-1.383.525-2.6a6.8 6.8 0 0 1 1.425-2.117q.9-.9 2.117-1.424A6.5 6.5 0 0 1 8 1.333q1.382 0 2.6.526 1.218.525 2.116 1.425T14.143 5.4t.524 2.6a6.5 6.5 0 0 1-.525 2.6 6.7 6.7 0 0 1-1.425 2.117q-.9.9-2.116 1.425a6.5 6.5 0 0 1-2.6.525m0-1.333q2.233 0 3.783-1.55T13.334 8t-1.55-3.783-3.783-1.55-3.784 1.55T2.667 8t1.55 3.784 3.784 1.55"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{shippingCharge}
                  </p>
                </div>

                <hr className="border-gray-200" />
                <div className="flex justify-between items-center pt-4">
                  <p className="text-lg font-semibold text-gray-900">
                    Total Payable
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{calculateTotal()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-black text-white py-4 rounded font-semibold hover:bg-gray-800 transition mb-4"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full bg-white text-gray-700 py-3 rounded font-semibold border border-gray-300 hover:bg-gray-50 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      {showQuantityModal && <QuantityModal />}
      {showAttributesModal && <AttributesModal />}
    </div>
  );
}
