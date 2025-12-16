import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import ProductCard from "./homePage/ProductCard";
import ProductFilters from "../components/common/ProductFilters";
import ActiveFilters from "../components/common/ActiveFilters";
import api from "../../utils/api";
import { updateCartCount } from "../redux/authSlice/cartSlice";
import { updateWishlistCount } from "../redux/authSlice/wishlistSlice";

const CategoryProducts = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAttributeSections, setOpenAttributeSections] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    subcategory: "",
    priceRange: "",
    rating: "",
    sortBy: "featured",
    attributes: {},
  });

  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);

        const [productsResponse, categoryResponse, subcategoriesResponse] =
          await Promise.all([
            api.get(`/products/category/${id}`),
            api.get(`/categories/${id}`),
            api.get(`/subcategories/category/${id}`),
          ]);

        if (productsResponse.data.success) {
          const activeProducts = productsResponse.data.products.filter(
            (product) => product.status === "active"
          );
          setProducts(activeProducts);
          setFilteredProducts(activeProducts);
        }

        if (categoryResponse.data.success) {
          setCategory(categoryResponse.data.category);
        }

        if (subcategoriesResponse.data.success) {
          setSubcategories(subcategoriesResponse.data.subcateg || []);
        }
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategoryData();
    }
  }, [id]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        setWishlist([]);
        return;
      }
      try {
        const response = await api.get("/wishlist");
        if (response.data.success) {
          const wishlistData =
            response.data.wishlist || response.data.wish || [];
          const wishlistIds = Array.isArray(wishlistData)
            ? wishlistData
                .map((item) => item.productId?._id || item.productId)
                .filter(Boolean)
            : [];
          setWishlist(wishlistIds);
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setWishlist([]);
      }
    };

    fetchWishlist();
  }, [token]);

  useEffect(() => {
    const fetchAttributes = async () => {
      if (filters.subcategory) {
        try {
          const response = await api.get("/attributes");
          if (response.data.success) {
            const allAttributes = response.data.data || [];
            const filteredAttributes = allAttributes.filter(
              (attr) => attr.subcategory?._id === filters.subcategory
            );
            setAttributes(filteredAttributes);

            const initialOpenState = {};
            filteredAttributes.forEach((attr) => {
              initialOpenState[attr._id] = true;
            });
            setOpenAttributeSections(initialOpenState);
          }
        } catch (error) {
          console.error("Error fetching attributes:", error);
          setAttributes([]);
        }
      } else {
        setAttributes([]);
        setFilters((prev) => ({ ...prev, attributes: {} }));
      }
    };

    fetchAttributes();
  }, [filters.subcategory]);

  useEffect(() => {
    let result = products;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm) ||
          product.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.subcategory) {
      result = result.filter(
        (product) =>
          product.subcategory?._id === filters.subcategory ||
          product.subcategory === filters.subcategory
      );
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      result = result.filter((product) =>
        filters.priceRange === "5000-100000"
          ? product.price >= 5000
          : product.price >= min && product.price <= max
      );
    }

    if (filters.rating) {
      result = result.filter((product) => product.rating >= filters.rating);
    }

    if (Object.keys(filters.attributes).length > 0) {
      result = result.filter((product) => {
        return Object.entries(filters.attributes).every(
          ([attributeId, selectedValues]) => {
            if (!selectedValues || selectedValues.length === 0) return true;

            const productAttribute = product.attributes?.find(
              (attr) =>
                attr.attribute === attributeId ||
                attr.attribute?._id === attributeId
            );

            if (!productAttribute) return false;
            const productValues = Array.isArray(productAttribute.value)
              ? productAttribute.value
              : [productAttribute.value];

            return selectedValues.some((selectedValue) =>
              productValues.includes(selectedValue)
            );
          }
        );
      });
    }

    switch (filters.sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [filters, products]);

  const handleAttributeChange = (attributeId, value, isChecked) => {
    setFilters((prev) => {
      const currentValues = prev.attributes[attributeId] || [];
      let newValues;

      if (isChecked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter((v) => v !== value);
      }

      const newAttributes = {
        ...prev.attributes,
        [attributeId]: newValues.length > 0 ? newValues : undefined,
      };

      if (!newAttributes[attributeId]) {
        delete newAttributes[attributeId];
      }

      return {
        ...prev,
        attributes: newAttributes,
      };
    });
  };

  const toggleAttributeSection = (attributeId) => {
    setOpenAttributeSections((prev) => ({
      ...prev,
      [attributeId]: !prev[attributeId],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      subcategory: "",
      priceRange: "",
      rating: "",
      sortBy: "featured",
      attributes: {},
    });
    setAttributes([]);
  };

  const handleWishlistToggle = async (productId) => {
    if (!token) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to add to wishlist!",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const currentWishlist = Array.isArray(wishlist) ? wishlist : [];

      if (currentWishlist.includes(productId)) {
        await api.delete(`/wishlist/remove/${productId}`);
        setWishlist((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return prevArray.filter((id) => id !== productId);
        });
        Swal.fire("Removed!", "Item removed from wishlist.", "success");
      } else {
        await api.post("/wishlist/add", { productId });
        setWishlist((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, productId];
        });
        Swal.fire("Added!", "Item added to wishlist.", "success");
      }

      dispatch(updateWishlistCount());
    } catch (err) {
      console.error("Wishlist error:", err);
      Swal.fire("Error", "Failed to update wishlist", "error");
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!token) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to add to cart!",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      await api.post("/cart", {
        productId,
        quantity,
        selectedAttributes: {},
      });

      dispatch(updateCartCount());
      Swal.fire("Success!", "Item added to cart.", "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add item to cart.";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  const isProductInWishlist = (productId) => {
    if (!Array.isArray(wishlist)) {
      console.warn("Wishlist is not an array:", wishlist);
      return false;
    }
    return wishlist.includes(productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm"
          >
            <span className="font-medium text-gray-700">Filters & Sort</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                showMobileFilters ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 px-2 sm:px-0">
            {category?.name || "Category Products"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base px-2 sm:px-0">
            {filteredProducts.length} of {products.length} products found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Filters Sidebar - Mobile Overlay */}
          <div
            className={`
            ${showMobileFilters ? "fixed inset-0 z-50 bg-white" : "hidden"} 
            lg:block lg:relative lg:w-80
          `}
          >
            {showMobileFilters && (
              <div className="h-full overflow-y-auto p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <ProductFilters
                  filters={filters}
                  setFilters={setFilters}
                  categories={[]}
                  subcategories={subcategories}
                  attributes={attributes}
                  openAttributeSections={openAttributeSections}
                  toggleAttributeSection={toggleAttributeSection}
                  handleAttributeChange={handleAttributeChange}
                  clearAllFilters={clearAllFilters}
                  showCategoryFilter={false}
                />
              </div>
            )}

            {/* Desktop Filters */}
            <div className="hidden lg:block">
              <ProductFilters
                filters={filters}
                setFilters={setFilters}
                categories={[]}
                subcategories={subcategories}
                attributes={attributes}
                openAttributeSections={openAttributeSections}
                toggleAttributeSection={toggleAttributeSection}
                handleAttributeChange={handleAttributeChange}
                clearAllFilters={clearAllFilters}
                showCategoryFilter={false}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <ActiveFilters
              filters={filters}
              setFilters={setFilters}
              categories={[]}
              subcategories={subcategories}
              attributes={attributes}
              clearAllFilters={clearAllFilters}
            />

            {/* Header with Sort */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4 px-2 sm:px-0">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {category?.name} Products
                </h2>
                {filteredProducts.length > 0 && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Showing {filteredProducts.length} products
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: High to low</option>
                  <option value="price-high">Price: Low to High</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm mx-2 sm:mx-0">
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base max-w-md mx-auto px-4">
                  {products.length === 0
                    ? "There are no products available in this category."
                    : "No products match your current filters. Try adjusting your filters to see more results."}
                </p>
                {(filters.search ||
                  filters.subcategory ||
                  filters.priceRange ||
                  Object.keys(filters.attributes).length > 0) && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-0">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    wishlist={isProductInWishlist(product._id)}
                    onWishlistToggle={handleWishlistToggle}
                    onAddToCart={handleAddToCart}
                    showAttributes={true}
                    showDeliveryInfo={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;

// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { useSelector } from "react-redux";
// import ProductCard from "./homePage/ProductCard";
// import ProductFilters from "../components/common/ProductFilters";
// import ActiveFilters from "../components/common/ActiveFilters";
// import api from "../../utils/api";

// const CategoryProducts = () => {
//   const { id } = useParams();
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [category, setCategory] = useState(null);
//   const [subcategories, setSubcategories] = useState([]);
//   const [attributes, setAttributes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [wishlist, setWishlist] = useState([]);
//   const [openAttributeSections, setOpenAttributeSections] = useState({});

//   const [filters, setFilters] = useState({
//     search: "",
//     subcategory: "",
//     priceRange: "",
//     rating: "",
//     sortBy: "featured",
//     attributes: {},
//   });

//   const token = useSelector((state) => state.auth.token);

//   useEffect(() => {
//     const fetchCategoryData = async () => {
//       try {
//         setLoading(true);

//         const [productsResponse, categoryResponse, subcategoriesResponse] =
//           await Promise.all([
//             api.get(`/products/category/${id}`),
//             api.get(`/categories/${id}`),
//             api.get(`/subcategories/category/${id}`),
//           ]);

//         if (productsResponse.data.success) {
//           const activeProducts = productsResponse.data.products.filter(
//             (product) => product.status === "active"
//           );
//           setProducts(activeProducts);
//           setFilteredProducts(activeProducts);
//         }

//         if (categoryResponse.data.success) {
//           setCategory(categoryResponse.data.category);
//         }

//         if (subcategoriesResponse.data.success) {
//           setSubcategories(subcategoriesResponse.data.subcateg || []);
//         }
//       } catch (err) {
//         console.error("Error fetching category data:", err);
//         setError("Failed to load products");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchCategoryData();
//     }
//   }, [id]);

//   useEffect(() => {
//     const fetchAttributes = async () => {
//       if (filters.subcategory) {
//         try {
//           const response = await api.get("/attributes");
//           if (response.data.success) {
//             const allAttributes = response.data.data || [];
//             const filteredAttributes = allAttributes.filter(
//               (attr) => attr.subcategory?._id === filters.subcategory
//             );
//             setAttributes(filteredAttributes);

//             const initialOpenState = {};
//             filteredAttributes.forEach((attr) => {
//               initialOpenState[attr._id] = true;
//             });
//             setOpenAttributeSections(initialOpenState);
//           }
//         } catch (error) {
//           console.error("Error fetching attributes:", error);
//           setAttributes([]);
//         }
//       } else {
//         setAttributes([]);
//         setFilters((prev) => ({ ...prev, attributes: {} }));
//       }
//     };

//     fetchAttributes();
//   }, [filters.subcategory]);

//   useEffect(() => {
//     const fetchWishlist = async () => {
//       if (!token) return;
//       try {
//         const response = await api.get("/wishlist");
//         if (response.data.success) {
//           const wishlistIds = response.data.wish.map(
//             (item) => item.productId._id
//           );
//           setWishlist(wishlistIds);
//         }
//       } catch (err) {
//         console.error("Error fetching wishlist:", err);
//       }
//     };

//     fetchWishlist();
//   }, [token]);

//   useEffect(() => {
//     let result = products;

//     if (filters.search) {
//       const searchTerm = filters.search.toLowerCase();
//       result = result.filter(
//         (product) =>
//           product.name?.toLowerCase().includes(searchTerm) ||
//           product.description?.toLowerCase().includes(searchTerm) ||
//           product.brand?.toLowerCase().includes(searchTerm) ||
//           product.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
//       );
//     }

//     if (filters.subcategory) {
//       result = result.filter(
//         (product) =>
//           product.subcategory?._id === filters.subcategory ||
//           product.subcategory === filters.subcategory
//       );
//     }

//     if (filters.priceRange) {
//       const [min, max] = filters.priceRange.split("-").map(Number);
//       result = result.filter((product) =>
//         filters.priceRange === "5000-100000"
//           ? product.price >= 5000
//           : product.price >= min && product.price <= max
//       );
//     }

//     if (filters.rating) {
//       result = result.filter((product) => product.rating >= filters.rating);
//     }

//     if (Object.keys(filters.attributes).length > 0) {
//       result = result.filter((product) => {
//         return Object.entries(filters.attributes).every(
//           ([attributeId, selectedValues]) => {
//             if (!selectedValues || selectedValues.length === 0) return true;

//             const productAttribute = product.attributes?.find(
//               (attr) =>
//                 attr.attribute === attributeId ||
//                 attr.attribute?._id === attributeId
//             );

//             if (!productAttribute) return false;
//             const productValues = Array.isArray(productAttribute.value)
//               ? productAttribute.value
//               : [productAttribute.value];

//             return selectedValues.some((selectedValue) =>
//               productValues.includes(selectedValue)
//             );
//           }
//         );
//       });
//     }

//     switch (filters.sortBy) {
//       case "price-low":
//         result.sort((a, b) => a.price - b.price);
//         break;
//       case "price-high":
//         result.sort((a, b) => b.price - a.price);
//         break;
//       case "newest":
//         result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//         break;
//       default:
//         break;
//     }

//     setFilteredProducts(result);
//   }, [filters, products]);

//   const handleAttributeChange = (attributeId, value, isChecked) => {
//     setFilters((prev) => {
//       const currentValues = prev.attributes[attributeId] || [];
//       let newValues;

//       if (isChecked) {
//         newValues = [...currentValues, value];
//       } else {
//         newValues = currentValues.filter((v) => v !== value);
//       }

//       const newAttributes = {
//         ...prev.attributes,
//         [attributeId]: newValues.length > 0 ? newValues : undefined,
//       };

//       if (!newAttributes[attributeId]) {
//         delete newAttributes[attributeId];
//       }

//       return {
//         ...prev,
//         attributes: newAttributes,
//       };
//     });
//   };

//   const toggleAttributeSection = (attributeId) => {
//     setOpenAttributeSections((prev) => ({
//       ...prev,
//       [attributeId]: !prev[attributeId],
//     }));
//   };

//   const clearAllFilters = () => {
//     setFilters({
//       search: "",
//       subcategory: "",
//       priceRange: "",
//       rating: "",
//       sortBy: "featured",
//       attributes: {},
//     });
//     setAttributes([]);
//   };

//   const handleWishlistToggle = async (productId) => {
//     if (!token) {
//       alert("Please login to add to wishlist!");
//       return;
//     }

//     try {
//       if (wishlist.includes(productId)) {
//         await api.delete(`/wishlist/remove/${productId}`);
//         setWishlist((prev) => prev.filter((id) => id !== productId));
//       } else {
//         await api.post("/wishlist/add", { productId });
//         setWishlist((prev) => [...prev, productId]);
//       }
//     } catch (err) {
//       console.error("Wishlist error:", err);
//       alert("Failed to update wishlist");
//     }
//   };

//   const handleAddToCart = async (productId) => {
//     if (!token) {
//       alert("Please login to add to cart!");
//       return;
//     }

//     try {
//       await api.post(
//         "/cart",
//         { productId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("Product added to cart");
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       alert("Failed to add item to cart");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading products...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-red-600 text-lg mb-4">{error}</div>
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">
//             {category?.name || "Category Products"}
//           </h1>
//           <p className="text-gray-600 mt-2">
//             {filteredProducts.length} of {products.length} products found
//           </p>
//         </div>

//         <div className="flex flex-col lg:flex-row gap-6">
//           <ProductFilters
//             filters={filters}
//             setFilters={setFilters}
//             categories={[]}
//             subcategories={subcategories}
//             attributes={attributes}
//             openAttributeSections={openAttributeSections}
//             toggleAttributeSection={toggleAttributeSection}
//             handleAttributeChange={handleAttributeChange}
//             clearAllFilters={clearAllFilters}
//             showCategoryFilter={false}
//           />

//           <div className="flex-1">
//             <ActiveFilters
//               filters={filters}
//               setFilters={setFilters}
//               categories={[]}
//               subcategories={subcategories}
//               attributes={attributes}
//               clearAllFilters={clearAllFilters}
//             />

//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {category?.name} Products
//                 </h2>
//                 {filteredProducts.length > 0 && (
//                   <p className="text-sm text-gray-600 mt-1">
//                     Showing {filteredProducts.length} products
//                   </p>
//                 )}
//               </div>

//               <div className="flex items-center gap-4">
//                 <select
//                   value={filters.sortBy}
//                   onChange={(e) =>
//                     setFilters({ ...filters, sortBy: e.target.value })
//                   }
//                   className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                 >
//                   <option value="featured">Featured</option>
//                   <option value="newest">Newest</option>
//                   <option value="price-low">Price: Low to High</option>
//                   <option value="price-high">Price: High to Low</option>
//                   <option value="rating">Highest Rated</option>
//                 </select>
//               </div>
//             </div>
//             {filteredProducts.length === 0 ? (
//               <div className="text-center py-12 bg-white rounded-lg shadow-sm">
//                 <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
//                   <svg
//                     className="w-8 h-8 text-gray-400"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
//                     />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                   No products found
//                 </h3>
//                 <p className="text-gray-600 mb-6 max-w-md mx-auto">
//                   {products.length === 0
//                     ? "There are no products available in this category."
//                     : "No products match your current filters. Try adjusting your filters to see more results."}
//                 </p>
//                 {(filters.search ||
//                   filters.subcategory ||
//                   filters.priceRange ||
//                   Object.keys(filters.attributes).length > 0) && (
//                   <button
//                     onClick={clearAllFilters}
//                     className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
//                   >
//                     Clear All Filters
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {filteredProducts.map((product) => (
//                   <ProductCard
//                     key={product._id}
//                     product={product}
//                     wishlist={wishlist}
//                     onWishlistToggle={handleWishlistToggle}
//                     onAddToCart={handleAddToCart}
//                     showAttributes={true}
//                     showDeliveryInfo={true}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CategoryProducts;
