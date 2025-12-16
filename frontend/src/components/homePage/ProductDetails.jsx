import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiArrowLeft,
  FiMinus,
  FiPlus,
  FiChevronDown,
  FiShare2,
  FiHeart,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import ProductDescription from "./ProductDescripition";
import ProductImageSlider from "./ProductImageSlider";
import WhyPeople from "./WhyPeople";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useFetchData from "../../hooks/useFetchData";
import { ProductLoading } from "../../components/common/LoadingSpinner";
import { updateCartCount } from "../../redux/authSlice/cartSlice";
import { updateWishlistCount } from "../../redux/authSlice/wishlistSlice";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [message, setMessage] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const { fetchData, postData, deleteData, loading, error } =
    useFetchData(token);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      await fetchData(`/products/${id}`, (data) => {
        if (data.success) {
          setProduct(data.product);

          // Initialize selected attributes with first available option
          const initial = {};
          data.product.attributes?.forEach((attr) => {
            if (attr.value && attr.value.length > 0) {
              initial[attr.name] = attr.value[0];
            }
          });
          setSelectedAttributes(initial);
        }
      });
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) return;
      await fetchData("/wishlist", (data) => {
        if (data.success) {
          const wishlistIds =
            data.wishlist?.map((item) => item.productId?._id) || [];
          setWishlist(wishlistIds);
        }
      });
    };

    fetchWishlist();
  }, [token]);

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity((prev) => Math.min(prev + 1, product?.stock || 10));
    } else {
      setQuantity((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleAttributeSelect = (name, value) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAttributes = () => {
    if (!product?.attributes) return true;

    for (let attr of product.attributes) {
      if (!selectedAttributes[attr.name]) {
        setMessage(`⚠️ Please select ${attr.name}`);
        setTimeout(() => setMessage(""), 3000);
        return false;
      }
    }
    return true;
  };

  const handleWishlist = async () => {
    if (!token) {
      toast.warning("Please login to add to wishlist!", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      if (wishlist.includes(product._id)) {
        await deleteData(`/wishlist/remove/${product._id}`);
        setWishlist((prev) => prev.filter((id) => id !== product._id));
        toast.info("Removed from wishlist", {
          position: "bottom-right",
          autoClose: 3000,
        });
      } else {
        await postData("/wishlist/add", { productId: product._id });
        setWishlist((prev) => [...prev, product._id]);
        toast.success("❤️ Added to wishlist!", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }

      // Update wishlist count in Redux
      dispatch(updateWishlistCount());
    } catch (err) {
      console.error("Wishlist error:", err);
      toast.error("Failed to update wishlist", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      toast.warning("Please login to add to cart!", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    if (!validateAttributes()) return;

    try {
      await postData("/cart", {
        productId: product._id,
        quantity,
        selectedAttributes,
      });

      // Update cart count in Redux
      dispatch(updateCartCount());

      setMessage("✅ Added to cart!");
      setTimeout(() => setMessage(""), 3000);

      toast.success("Item added to cart!", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to add to cart";
      setMessage("❌ " + errorMessage);
      setTimeout(() => setMessage(""), 3000);

      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      toast.warning("Please login to proceed!", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    if (!validateAttributes()) return;

    try {
      await postData("/cart", {
        productId: product._id,
        quantity,
        selectedAttributes,
      });

      dispatch(updateCartCount());

      toast.success("Item added to cart! Redirecting...", {
        position: "bottom-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/cart");
      }, 1500);
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to add to cart";
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
        toast.success("Product shared successfully!", {
          position: "bottom-right",
          autoClose: 3000,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success("Link copied to clipboard!", {
          position: "bottom-right",
          autoClose: 3000,
        });
      });
    }
  };

  const calculateDiscount = () => {
    if (!product?.originalPrice) return 0;
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
  };

  // ✅ Use reusable loading component
  if (loading) return <ProductLoading />;

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">
            {error || "Product not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
            >
              <FiArrowLeft className="mr-2" />
              Back
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <ProductImageSlider product={product} />
            </div>

            <div className="space-y-6">
              <div
                className="d-flex flex-column gap-2"
                style={{ color: "rgb(51, 50, 49)" }}
              >
                <div className="product-title-wrapper">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <p
                          style={{
                            marginRight: "8px",
                            margin: 0,
                            fontSize: "14px",
                            color: "rgb(51, 50, 49)",
                            fontWeight: "500",
                          }}
                        >
                          {product?.brand || "Aramya"}
                        </p>
                      </div>

                      <div className="flex align-items-center gap-3">
                        {/* Wishlist Icon */}
                        <button
                          onClick={handleWishlist}
                          className="component-SvgIcons"
                          style={{
                            backgroundColor: "inherit",
                            cursor: "pointer",
                            width: "20px",
                            height: "20px",
                            marginTop: "2px",
                            border: "none",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title={
                            wishlist.includes(product._id)
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          <FiHeart
                            style={{
                              fill: wishlist.includes(product._id)
                                ? "rgb(143, 42, 83)"
                                : "none",
                              color: wishlist.includes(product._id)
                                ? "rgb(143, 42, 83)"
                                : "rgb(143, 42, 83)",
                              width: "20px",
                              height: "20px",
                              transition: "all 0.2s ease-in-out",
                            }}
                          />
                        </button>

                        <button
                          onClick={handleShare}
                          className="component-SvgIcons"
                          style={{
                            backgroundColor: "inherit",
                            cursor: "pointer",
                            width: "24px",
                            height: "24px",
                            marginTop: "2px",
                            border: "none",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Share product"
                        >
                          <FiShare2
                            style={{
                              color: "rgb(143, 42, 83)",
                              width: "20px",
                              height: "20px",
                              transition: "all 0.2s ease-in-out",
                            }}
                          />
                        </button>
                      </div>
                    </div>
                    <h1
                      className="text-xl sm:text-2xl font-normal text-gray-900 leading-tight"
                      style={{
                        lineHeight: "1.4",
                        margin: "0",
                        color: "rgb(51, 50, 49)",
                      }}
                    >
                      {product.name}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= 4
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  4.7 (2.6K Reviews)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ₹{product.price?.toLocaleString("en-IN")}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{product.originalPrice?.toLocaleString("en-IN")}
                      </span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-semibold">
                        -{calculateDiscount()}%
                      </span>
                    </>
                  )}
              </div>

              {product.attributes && product.attributes.length > 0 && (
                <div className="space-y-6 border-t border-gray-200 pt-6">
                  {product.attributes.map((attr, idx) => (
                    <div key={idx}>
                      <p className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
                        {attr.name}:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {attr.value?.map((val, i) => (
                          <button
                            key={i}
                            onClick={() =>
                              handleAttributeSelect(attr.name, val)
                            }
                            className={`px-4 py-2 rounded-none border text-sm transition-all duration-200 ${
                              selectedAttributes[attr.name] === val
                                ? "bg-gray-900 text-white border-gray-900"
                                : "border-gray-300 text-gray-700 hover:border-gray-400 bg-white"
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <p className="font-medium text-gray-900 min-w-20">
                    Quantity:
                  </p>
                  <div className="flex items-center border border-gray-300 rounded-none bg-white">
                    <button
                      onClick={() => handleQuantityChange("decrement")}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiMinus size={16} />
                    </button>
                    <span className="px-4 py-2 border-l border-r border-gray-300 min-w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange("increment")}
                      disabled={quantity >= (product.stock || 10)}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.stock || 10} available
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.status !== "active"}
                    className="flex-1 bg-white text-gray-900 py-3 px-6 rounded-none border border-gray-900 hover:bg-gray-900 hover:text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                  >
                    <FiShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.status !== "active"}
                    className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-none hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${
                    message.includes("✅")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              {product.status !== "active" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-700 text-sm font-medium">
                    ⚠️ This product is currently unavailable
                  </p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-green-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-green-700 font-medium">
                    Free Delivery • Delivery by Tomorrow, 4 PM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <ProductDescription description={product.description} />
        </div>
      </div>
      <WhyPeople />
      <ToastContainer />
    </>
  );
}

// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   FiShoppingCart,
//   FiArrowLeft,
//   FiMinus,
//   FiPlus,
//   FiChevronDown,
//   FiShare2,
//   FiHeart,
// } from "react-icons/fi";
// import { useSelector } from "react-redux";
// import ProductDescription from "./ProductDescripition";
// import ProductImageSlider from "./ProductImageSlider";
// import WhyPeople from "./WhyPeople";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import useFetchData from "../../hooks/useFetchData";
// import { ProductLoading } from "../../components/common/LoadingSpinner";

// export default function ProductDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [selectedAttributes, setSelectedAttributes] = useState({});
//   const [message, setMessage] = useState("");
//   const [wishlist, setWishlist] = useState([]);
//   const token = useSelector((state) => state.auth.token);
//   const { fetchData, postData, deleteData, loading, error } =
//     useFetchData(token);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       await fetchData(`/products/${id}`, (data) => {
//         if (data.success) {
//           setProduct(data.product);

//           const initial = {};
//           data.product.attributes?.forEach((attr) => {
//             initial[attr.name] = attr.value?.[0] || "";
//           });
//           setSelectedAttributes(initial);
//         }
//       });
//     };

//     fetchProduct();
//   }, [id]);

//   useEffect(() => {
//     const fetchWishlist = async () => {
//       if (!token) return;
//       await fetchData("/wishlist", (data) => {
//         if (data.success) {
//           const wishlistIds =
//             data.wishlist?.map((item) => item.productId._id) || [];
//           setWishlist(wishlistIds);
//         }
//       });
//     };

//     fetchWishlist();
//   }, [token]);

//   const handleQuantityChange = (type) => {
//     if (type === "increment") {
//       setQuantity((prev) => Math.min(prev + 1, product?.stock || 10));
//     } else {
//       setQuantity((prev) => Math.max(prev - 1, 1));
//     }
//   };

//   const handleAttributeSelect = (name, value) => {
//     setSelectedAttributes((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const validateAttributes = () => {
//     if (!product?.attributes) return true;

//     for (let attr of product.attributes) {
//       if (!selectedAttributes[attr.name]) {
//         setMessage(`⚠️ Please select ${attr.name}`);
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleWishlist = async () => {
//     if (!token) {
//       toast.warning("Please login to add to wishlist!", {
//         position: "bottom-right",
//         autoClose: 3000,
//       });
//       return;
//     }

//     try {
//       if (wishlist.includes(product._id)) {
//         await deleteData(`/wishlist/remove/${product._id}`);
//         setWishlist((prev) => prev.filter((id) => id !== product._id));
//         toast.info("Removed from wishlist", {
//           position: "bottom-right",
//           autoClose: 3000,
//         });
//       } else {
//         await postData(
//           "/wishlist/add",
//           { productId: product._id },
//           "Added to wishlist!"
//         );
//         setWishlist((prev) => [...prev, product._id]);
//         toast.success("❤️ Added to wishlist!", {
//           position: "bottom-right",
//           autoClose: 3000,
//         });
//       }
//     } catch (err) {
//       console.error("Wishlist error:", err);
//       toast.error("Failed to update wishlist", {
//         position: "bottom-right",
//         autoClose: 3000,
//       });
//     }
//   };

//   const handleAddToCart = async () => {
//     if (!token) {
//       alert("Please login to add to cart!");
//       return;
//     }

//     if (!validateAttributes()) return;

//     try {
//       await postData(
//         "/cart",
//         {
//           productId: product._id,
//           quantity,
//           selectedAttributes,
//         },
//         "Added to cart!"
//       );
//       setMessage("✅ Added to cart!");
//       setTimeout(() => setMessage(""), 2000);
//     } catch (err) {
//       console.error("❌ Error adding to cart:", err);
//       setMessage("❌ Failed to add to cart");
//     }
//   };

//   const handleBuyNow = async () => {
//     if (!validateAttributes()) return;
//     await handleAddToCart();
//     navigate("/cart");
//   };

//   const calculateDiscount = () => {
//     if (!product?.originalPrice) return 0;
//     return Math.round(
//       ((product.originalPrice - product.price) / product.originalPrice) * 100
//     );
//   };

//   // ✅ Use reusable loading component
//   if (loading) return <ProductLoading />;

//   if (error || !product) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white">
//         <div className="text-center">
//           <p className="text-red-600 text-lg mb-4">
//             {error || "Product not found"}
//           </p>
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-700"
//           >
//             <FiArrowLeft className="mr-2" />
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="min-h-screen bg-white">
//         <div className="border-b border-gray-200">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
//             >
//               <FiArrowLeft className="mr-2" />
//               Back
//             </button>
//           </div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
//             <div>
//               <ProductImageSlider product={product} />
//             </div>

//             <div className="space-y-6">
//               <div
//                 className="d-flex flex-column gap-2"
//                 style={{ color: "rgb(51, 50, 49)" }}
//               >
//                 <div className="product-title-wrapper">
//                   <div
//                     style={{
//                       display: "flex",
//                       flexDirection: "column",
//                       justifyContent: "space-between",
//                       width: "100%",
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "row",
//                         justifyContent: "space-between",
//                         alignItems: "flex-start",
//                         marginBottom: "12px",
//                       }}
//                     >
//                       <div
//                         style={{
//                           display: "flex",
//                           flexDirection: "row",
//                           alignItems: "center",
//                         }}
//                       >
//                         <p
//                           style={{
//                             marginRight: "8px",
//                             margin: 0,
//                             fontSize: "14px",
//                             color: "rgb(51, 50, 49)",
//                             fontWeight: "500",
//                           }}
//                         >
//                           {product?.brand || "Aramya"}
//                         </p>
//                       </div>

//                       <div className="flex align-items-center gap-3">
//                         {/* Wishlist Icon */}
//                         <button
//                           onClick={handleWishlist}
//                           className="component-SvgIcons"
//                           style={{
//                             backgroundColor: "inherit",
//                             cursor: "pointer",
//                             width: "20px",
//                             height: "20px",
//                             marginTop: "2px",
//                             border: "none",
//                             padding: 0,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <FiHeart
//                             style={{
//                               fill: wishlist.includes(product._id)
//                                 ? "rgb(143, 42, 83)"
//                                 : "none",
//                               color: wishlist.includes(product._id)
//                                 ? "rgb(143, 42, 83)"
//                                 : "rgb(143, 42, 83)",
//                               width: "20px",
//                               height: "20px",
//                               transition: "all 0.2s ease-in-out",
//                             }}
//                           />
//                         </button>

//                         <button
//                           className="component-SvgIcons"
//                           style={{
//                             backgroundColor: "inherit",
//                             cursor: "pointer",
//                             width: "24px",
//                             height: "24px",
//                             marginTop: "2px",
//                             border: "none",
//                             padding: 0,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <FiShare2
//                             style={{
//                               color: "rgb(143, 42, 83)",
//                               width: "20px",
//                               height: "20px",
//                               transition: "all 0.2s ease-in-out",
//                             }}
//                           />
//                         </button>
//                       </div>
//                     </div>
//                     <h1
//                       className="text-xl sm:text-2xl font-normal text-gray-900 leading-tight"
//                       style={{
//                         lineHeight: "1.4",
//                         margin: "0",
//                         color: "rgb(51, 50, 49)",
//                       }}
//                     >
//                       {product.name}
//                     </h1>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="flex items-center">
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <svg
//                       key={star}
//                       className={`w-4 h-4 ${
//                         star <= 4
//                           ? "text-yellow-400 fill-yellow-400"
//                           : "text-gray-300"
//                       }`}
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                     </svg>
//                   ))}
//                 </div>
//                 <span className="text-sm text-gray-600">
//                   4.7 (2.6K Reviews)
//                 </span>
//               </div>
//               <div className="flex flex-wrap items-center gap-3">
//                 <span className="text-2xl sm:text-3xl font-bold text-gray-900">
//                   ₹{product.price?.toLocaleString("en-IN")}
//                 </span>
//                 {product.originalPrice &&
//                   product.originalPrice > product.price && (
//                     <>
//                       <span className="text-lg text-gray-500 line-through">
//                         ₹{product.originalPrice?.toLocaleString("en-IN")}
//                       </span>
//                       <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-semibold">
//                         -{calculateDiscount()}%
//                       </span>
//                     </>
//                   )}
//               </div>
//               {product.attributes && product.attributes.length > 0 && (
//                 <div className="space-y-6 border-t border-gray-200 pt-6">
//                   {product.attributes.map((attr, idx) => (
//                     <div key={idx}>
//                       <p className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
//                         {attr.name}:
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {attr.value?.map((val, i) => (
//                           <button
//                             key={i}
//                             onClick={() =>
//                               handleAttributeSelect(attr.name, val)
//                             }
//                             className={`px-4 py-2 rounded-none border text-sm transition-all duration-200 ${
//                               selectedAttributes[attr.name] === val
//                                 ? "bg-gray-900 text-white border-gray-900"
//                                 : "border-gray-300 text-gray-700 hover:border-gray-400 bg-white"
//                             }`}
//                           >
//                             {val}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
//                 <div className="flex items-center gap-4">
//                   <p className="font-medium text-gray-900 min-w-20">
//                     Quantity:
//                   </p>
//                   <div className="flex items-center border border-gray-300 rounded-none bg-white">
//                     <button
//                       onClick={() => handleQuantityChange("decrement")}
//                       disabled={quantity <= 1}
//                       className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       <FiMinus size={16} />
//                     </button>
//                     <span className="px-4 py-2 border-l border-r border-gray-300 min-w-12 text-center">
//                       {quantity}
//                     </span>
//                     <button
//                       onClick={() => handleQuantityChange("increment")}
//                       disabled={quantity >= (product.stock || 10)}
//                       className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       <FiPlus size={16} />
//                     </button>
//                   </div>
//                   <span className="text-sm text-gray-500">
//                     {product.stock || 10} available
//                   </span>
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <button
//                     onClick={handleAddToCart}
//                     disabled={product.status !== "active"}
//                     className="flex-1 bg-white text-gray-900 py-3 px-6 rounded-none border border-gray-900 hover:bg-gray-900 hover:text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
//                   >
//                     <FiShoppingCart size={18} />
//                     Add to Cart
//                   </button>
//                   <button
//                     onClick={handleBuyNow}
//                     disabled={product.status !== "active"}
//                     className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-none hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
//                   >
//                     Buy Now
//                   </button>
//                 </div>
//               </div>
//               {message && (
//                 <div
//                   className={`p-3 rounded-lg text-sm font-medium ${
//                     message.includes("✅")
//                       ? "bg-green-50 text-green-700 border border-green-200"
//                       : "bg-red-50 text-red-700 border border-red-200"
//                   }`}
//                 >
//                   {message}
//                 </div>
//               )}

//               {product.status !== "active" && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                   <p className="text-yellow-700 text-sm font-medium">
//                     ⚠️ This product is currently unavailable
//                   </p>
//                 </div>
//               )}
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                 <div className="flex items-center gap-2 text-sm">
//                   <svg
//                     className="w-4 h-4 text-green-600 flex-shrink-0"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                   <span className="text-green-700 font-medium">
//                     Free Delivery • Delivery by Tomorrow, 4 PM
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
//           <ProductDescription description={product.description} />
//         </div>
//       </div>
//       <WhyPeople />
//     </>
//   );
// }
