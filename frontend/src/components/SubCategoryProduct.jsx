import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import ProductCard from "./homePage/ProductCard";
import ProductFilters from "../components/common/ProductFilters";
import ActiveFilters from "../components/common/ActiveFilters";
import api from "../../utils/api";
import { updateCartCount } from "../redux/authSlice/cartSlice";
import { updateWishlistCount } from "../redux/authSlice/wishlistSlice";

const SubcategoryProducts = () => {
  const { categoryId, subcategoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [openAttributeSections, setOpenAttributeSections] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    priceRange: "",
    rating: "",
    sortBy: "featured",
    attributes: {},
  });

  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchSubcategoryData = async () => {
      try {
        setLoading(true);

        const [
          productsResponse,
          categoryResponse,
          subcategoryResponse,
          subcategoriesResponse,
        ] = await Promise.all([
          api.get(`/products`),
          categoryId
            ? api.get(`/categories/${categoryId}`)
            : Promise.resolve({ data: { success: false } }),
          api.get(`/subcategories/${subcategoryId}`),
          categoryId
            ? api.get(`/subcategories/category/${categoryId}`)
            : Promise.resolve({ data: { success: false, subcateg: [] } }),
        ]);

        if (productsResponse.data.success) {
          const subcategoryProducts = productsResponse.data.products.filter(
            (product) =>
              product.status === "active" &&
              (product.subcategory?._id === subcategoryId ||
                product.subcategory === subcategoryId)
          );
          setProducts(subcategoryProducts);
          setFilteredProducts(subcategoryProducts);
        }

        if (categoryResponse.data.success) {
          setCategory(categoryResponse.data.category);
        }

        if (subcategoryResponse.data.success) {
          setSubcategory(subcategoryResponse.data.subcategory);
          if (!category && subcategoryResponse.data.subcategory?.category) {
            setCategory(subcategoryResponse.data.subcategory.category);
          }
        }

        if (subcategoriesResponse.data.success) {
          setSubcategories(subcategoriesResponse.data.subcateg || []);
        }
      } catch (err) {
        console.error("Error fetching subcategory data:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    if (subcategoryId) {
      fetchSubcategoryData();
    }
  }, [categoryId, subcategoryId]);

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
      try {
        const response = await api.get("/attributes");
        if (response.data.success) {
          const allAttributes = response.data.data || [];
          const filteredAttributes = allAttributes.filter(
            (attr) => attr.subcategory?._id === subcategoryId
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
    };

    if (subcategoryId) {
      fetchAttributes();
    }
  }, [subcategoryId]);

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
      priceRange: "",
      rating: "",
      sortBy: "featured",
      attributes: {},
    });
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
        <nav className="flex mb-4 sm:mb-6 px-2 sm:px-0" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link to="/" className="hover:text-indigo-600">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            {category && (
              <>
                <li>
                  <Link
                    to={`/category/${category._id}`}
                    className="hover:text-indigo-600"
                  >
                    {category.name}
                  </Link>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
              </>
            )}
            <li className="text-gray-900 font-medium">
              {subcategory?.name || "Subcategory"}
            </li>
          </ol>
        </nav>
        <div className="mb-6 sm:mb-8 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {subcategory?.name || "Subcategory Products"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {subcategory?.description ||
              `Explore our ${subcategory?.name?.toLowerCase()} collection`}
          </p>
          <p className="text-gray-500 mt-1 text-sm">
            {filteredProducts.length} of {products.length} products found
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
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
                  showSubcategoryFilter={false}
                />
              </div>
            )}
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
                showSubcategoryFilter={false}
              />
            </div>
          </div>
          <div className="flex-1">
            <ActiveFilters
              filters={filters}
              setFilters={setFilters}
              categories={[]}
              subcategories={[]}
              attributes={attributes}
              clearAllFilters={clearAllFilters}
            />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4 px-2 sm:px-0">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {subcategory?.name} Products
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
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
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
                    ? "There are no products available in this subcategory."
                    : "No products match your current filters. Try adjusting your filters to see more results."}
                </p>
                {(filters.search ||
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

export default SubcategoryProducts;

// import React, { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import ProductCard from "./homePage/ProductCard";
// import ProductFilters from "../components/common/ProductFilters";
// import ActiveFilters from "../components/common/ActiveFilters";
// import api from "../../utils/api";

// const SubcategoryProducts = () => {
//   const { categoryId, subcategoryId } = useParams();
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [category, setCategory] = useState(null);
//   const [subcategory, setSubcategory] = useState(null);
//   const [subcategories, setSubcategories] = useState([]);
//   const [attributes, setAttributes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [wishlist, setWishlist] = useState([]);
//   const [openAttributeSections, setOpenAttributeSections] = useState({});

//   const [filters, setFilters] = useState({
//     search: "",
//     priceRange: "",
//     rating: "",
//     sortBy: "featured",
//     attributes: {},
//   });

//   useEffect(() => {
//     const fetchSubcategoryData = async () => {
//       try {
//         setLoading(true);

//         const [
//           productsResponse,
//           categoryResponse,
//           subcategoryResponse,
//           subcategoriesResponse,
//         ] = await Promise.all([
//           api.get(`/products`),
//           categoryId
//             ? api.get(`/categories/${categoryId}`)
//             : Promise.resolve({ data: { success: false } }),
//           api.get(`/subcategories/${subcategoryId}`),
//           categoryId
//             ? api.get(`/subcategories/category/${categoryId}`)
//             : Promise.resolve({ data: { success: false, subcateg: [] } }),
//         ]);

//         if (productsResponse.data.success) {
//           const subcategoryProducts = productsResponse.data.products.filter(
//             (product) =>
//               product.status === "active" &&
//               (product.subcategory?._id === subcategoryId ||
//                 product.subcategory === subcategoryId)
//           );
//           setProducts(subcategoryProducts);
//           setFilteredProducts(subcategoryProducts);
//         }

//         if (categoryResponse.data.success) {
//           setCategory(categoryResponse.data.category);
//         }

//         if (subcategoryResponse.data.success) {
//           setSubcategory(subcategoryResponse.data.subcategory);
//           if (!category && subcategoryResponse.data.subcategory?.category) {
//             setCategory(subcategoryResponse.data.subcategory.category);
//           }
//         }

//         if (subcategoriesResponse.data.success) {
//           setSubcategories(subcategoriesResponse.data.subcateg || []);
//         }
//       } catch (err) {
//         console.error("Error fetching subcategory data:", err);
//         setError("Failed to load products");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (subcategoryId) {
//       fetchSubcategoryData();
//     }
//   }, [categoryId, subcategoryId]);

//   useEffect(() => {
//     const fetchAttributes = async () => {
//       try {
//         const response = await api.get("/attributes");
//         if (response.data.success) {
//           const allAttributes = response.data.data || [];
//           const filteredAttributes = allAttributes.filter(
//             (attr) => attr.subcategory?._id === subcategoryId
//           );
//           setAttributes(filteredAttributes);

//           const initialOpenState = {};
//           filteredAttributes.forEach((attr) => {
//             initialOpenState[attr._id] = true;
//           });
//           setOpenAttributeSections(initialOpenState);
//         }
//       } catch (error) {
//         console.error("Error fetching attributes:", error);
//         setAttributes([]);
//       }
//     };

//     if (subcategoryId) {
//       fetchAttributes();
//     }
//   }, [subcategoryId]);

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
//       priceRange: "",
//       rating: "",
//       sortBy: "featured",
//       attributes: {},
//     });
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
//         <nav className="flex mb-6" aria-label="Breadcrumb">
//           <ol className="flex items-center space-x-2 text-sm text-gray-600">
//             <li>
//               <Link to="/" className="hover:text-indigo-600">
//                 Home
//               </Link>
//             </li>
//             <li>
//               <span className="mx-2">/</span>
//             </li>
//             {category && (
//               <>
//                 <li>
//                   <Link
//                     to={`/category/${category._id}`}
//                     className="hover:text-indigo-600"
//                   >
//                     {category.name}
//                   </Link>
//                 </li>
//                 <li>
//                   <span className="mx-2">/</span>
//                 </li>
//               </>
//             )}
//             <li className="text-gray-900 font-medium">
//               {subcategory?.name || "Subcategory"}
//             </li>
//           </ol>
//         </nav>

//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">
//             {subcategory?.name || "Subcategory Products"}
//           </h1>
//           <p className="text-gray-600 mt-2">
//             {subcategory?.description ||
//               `Explore our ${subcategory?.name?.toLowerCase()} collection`}
//           </p>
//           <p className="text-gray-500 mt-1">
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
//             showSubcategoryFilter={false}
//           />

//           <div className="flex-1">
//             <ActiveFilters
//               filters={filters}
//               setFilters={setFilters}
//               categories={[]}
//               subcategories={[]}
//               attributes={attributes}
//               clearAllFilters={clearAllFilters}
//             />
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {subcategory?.name} Products
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
//                     ? "There are no products available in this subcategory."
//                     : "No products match your current filters. Try adjusting your filters to see more results."}
//                 </p>
//                 {(filters.search ||
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

// export default SubcategoryProducts;
