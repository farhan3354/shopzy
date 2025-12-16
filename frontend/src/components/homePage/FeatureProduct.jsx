import React, { useEffect, useState } from "react";
import { FiHeart, FiShoppingCart, FiArrowRight, FiFilter, FiX, FiChevronDown } from "react-icons/fi";
import { HiFire } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import ProductCard from "./ProductCard";
import ProductFilters from "./../common/ProductFilters";
import ActiveFilters from "./../common/ActiveFilters";
import api from "../../../utils/api";
import { updateCartCount } from "../../redux/authSlice/cartSlice";
import { updateWishlistCount } from "../../redux/authSlice/wishlistSlice";
import { ProductLoading } from "../common/LoadingSpinner";

export default function FeatureProduct() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAttributeSections, setOpenAttributeSections] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    subcategory: "",
    priceRange: "",
    rating: "",
    sortBy: "featured",
    attributes: {},
  });

  const token = useSelector((state) => state.auth.token);
  const location = useLocation();
  const dispatch = useDispatch();

  const isHomePage = location.pathname === "/";
  const isProductPage = location.pathname === "/products";

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        if (productsResponse.data.success) {
          setProducts(productsResponse.data.products);
        }
        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (filters.category) {
        try {
          const response = await api.get(
            `/subcategories/category/${filters.category}`
          );
          if (response.data.success) {
            setSubcategories(response.data.subcateg || []);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
        setAttributes([]);
        setFilters((prev) => ({ ...prev, subcategory: "", attributes: {} }));
      }
    };

    fetchSubcategories();
  }, [filters.category]);

  // Fetch attributes when subcategory changes
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

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        setWishlist([]); // Clear wishlist if no token
        return;
      }
      try {
        const response = await api.get("/wishlist");
        if (response.data.success) {
          const wishlistData = response.data.wishlist || [];
          const wishlistIds = wishlistData
            .map((item) => item.productId?._id || item.productId)
            .filter(Boolean);
          setWishlist(wishlistIds);
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setWishlist([]); // Clear wishlist on error
      }
    };

    fetchWishlist();
  }, [token]);

  // Filter products
  useEffect(() => {
    if (!isProductPage) return;

    let result = products.filter((product) => product.status === "active");

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm) ||
          product.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.category) {
      result = result.filter(
        (product) =>
          product.category?._id === filters.category ||
          product.category === filters.category
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
        filters.priceRange === "200-10000"
          ? product.price >= 200
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

    // Apply sorting
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
  }, [filters, products, isProductPage]);

  // Group products by category for home page
  const getProductsByCategory = () => {
    const activeProducts = products.filter((item) => item.status === "active");
    const categoryMap = {};
    categories.forEach((category) => {
      categoryMap[category._id] = {
        category,
        products: [],
      };
    });
    activeProducts.forEach((product) => {
      const categoryId = product.category?._id || product.category;
      if (categoryId && categoryMap[categoryId]) {
        categoryMap[categoryId].products.push(product);
      }
    });
    const categoriesWithProducts = Object.values(categoryMap)
      .filter((item) => item.products.length > 0)
      .map((item) => ({
        ...item,
        products: item.products.slice(0, 4),
      }));
    return categoriesWithProducts.sort((a, b) => {
      const aHasFourOrMore = a.products.length >= 4;
      const bHasFourOrMore = b.products.length >= 4;

      if (aHasFourOrMore && !bHasFourOrMore) return -1;
      if (!aHasFourOrMore && bHasFourOrMore) return 1;
      return b.products.length - a.products.length;
    });
  };

  // Handler functions
  const handleWishlist = async (productId) => {
    if (!token) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to add to wishlist!",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#8F2B53",
      });
      return;
    }

    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/wishlist/remove/${productId}`);
        setWishlist((prev) => prev.filter((id) => id !== productId));
        Swal.fire({
          title: "Removed!",
          text: "Item removed from wishlist.",
          icon: "success",
          confirmButtonColor: "#8F2B53",
        });
      } else {
        await api.post("/wishlist/add", { productId });
        setWishlist((prev) => [...prev, productId]);
        Swal.fire({
          title: "Added!",
          text: "Item added to wishlist.",
          icon: "success",
          confirmButtonColor: "#8F2B53",
        });
      }

      // Update wishlist count in Redux
      dispatch(updateWishlistCount());
    } catch (err) {
      console.error("Wishlist error:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to update wishlist",
        icon: "error",
        confirmButtonColor: "#8F2B53",
      });
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!token) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to add to cart!",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#8F2B53",
      });
      return;
    }

    try {
      await api.post("/cart", {
        productId,
        quantity,
        selectedAttributes: {}, // Add default empty attributes
      });

      // Update cart count in Redux
      dispatch(updateCartCount());

      Swal.fire({
        title: "Success!",
        text: "Item added to cart.",
        icon: "success",
        confirmButtonColor: "#8F2B53",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add item to cart.";
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#8F2B53",
      });
    }
  };

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
      category: "",
      subcategory: "",
      priceRange: "",
      rating: "",
      sortBy: "featured",
      attributes: {},
    });
    setSubcategories([]);
    setAttributes([]);
    setMobileFiltersOpen(false);
  };

  // Home Page View
  if (isHomePage) {
    const productsByCategory = getProductsByCategory();

    return (
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="py-16">
              <ProductLoading />
            </div>
          ) : productsByCategory.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <FiShoppingCart className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're adding new products to our collection. Check back soon!
              </p>
            </div>
          ) : (
            productsByCategory.map((categoryGroup, index) => (
              <div key={categoryGroup.category._id} className="mb-16 last:mb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-8 bg-gradient-to-b from-[#BE386E] to-[#8F2B53] rounded-full"></div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
                        {categoryGroup.category.name}
                      </h2>
                    </div>
                    <p className="text-gray-600 ml-6">
                      Discover our amazing {categoryGroup.category.name.toLowerCase()} collection
                    </p>
                  </div>
                  <Link
                    to={`/category/${categoryGroup.category._id}`}
                    className="group flex items-center gap-2 text-[#8F2B53] hover:text-[#BE386E] font-semibold px-6 py-3 bg-[#f6e9ee] hover:bg-[#f0dce5] rounded-full transition-colors"
                  >
                    View All Products
                    <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categoryGroup.products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      wishlist={wishlist.includes(product._id)}
                      onWishlistToggle={handleWishlist}
                      onAddToCart={handleAddToCart}
                      showAttributes={true}
                      showDeliveryInfo={true}
                    />
                  ))}
                </div>

                {index < productsByCategory.length - 1 && (
                  <div className="mt-12 pt-8 border-t border-gray-100"></div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    );
  }

  // Product Page View
  const activeProducts = products.filter((item) => item.status === "active");
  const displayProducts = isProductPage ? filteredProducts : activeProducts;

  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner for Product Page */}
        {isProductPage && (
          <div className="mb-8 md:mb-12">
            <div className="bg-gradient-to-r from-[#8F2B53] to-[#BE386E] rounded-2xl p-6 md:p-8 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <HiFire className="w-8 h-8 text-yellow-300 animate-pulse" />
                  <h1 className="text-2xl md:text-3xl font-bold">Discover Amazing Products</h1>
                </div>
                <p className="text-white/90 max-w-2xl">
                  Find exactly what you're looking for with our extensive collection of premium products. Filter by category, price, ratings and more.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Filters Sidebar - Desktop */}
          {isProductPage && (
            <>
              <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
                <ProductFilters
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                  subcategories={subcategories}
                  attributes={attributes}
                  openAttributeSections={openAttributeSections}
                  toggleAttributeSection={toggleAttributeSection}
                  handleAttributeChange={handleAttributeChange}
                  clearAllFilters={clearAllFilters}
                  showCategoryFilter={true}
                  showSearchFilter={true}
                />
              </div>

              {/* Mobile Filters Button */}
              <div className="lg:hidden flex items-center justify-between mb-4">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:border-[#8F2B53] hover:text-[#8F2B53] transition-colors"
                >
                  <FiFilter className="w-5 h-5" />
                  <span>Filters</span>
                  {Object.keys(filters.attributes).length > 0 || 
                   filters.category || 
                   filters.priceRange || 
                   filters.rating ? (
                    <span className="ml-2 w-6 h-6 bg-[#8F2B53] text-white text-xs rounded-full flex items-center justify-center">
                      {[
                        Object.keys(filters.attributes).length,
                        filters.category ? 1 : 0,
                        filters.priceRange ? 1 : 0,
                        filters.rating ? 1 : 0
                      ].reduce((a, b) => a + b, 0)}
                    </span>
                  ) : null}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {displayProducts.length} products
                  </span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters({ ...filters, sortBy: e.target.value })
                    }
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F2B53] focus:border-transparent"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {/* Mobile Filters Modal */}
              {mobileFiltersOpen && (
                <>
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileFiltersOpen(false)}></div>
                  <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                      <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <FiX className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    <div className="p-4">
                      <ProductFilters
                        filters={filters}
                        setFilters={setFilters}
                        categories={categories}
                        subcategories={subcategories}
                        attributes={attributes}
                        openAttributeSections={openAttributeSections}
                        toggleAttributeSection={toggleAttributeSection}
                        handleAttributeChange={handleAttributeChange}
                        clearAllFilters={clearAllFilters}
                        showCategoryFilter={true}
                        showSearchFilter={true}
                      />
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <button
                        onClick={() => setMobileFiltersOpen(false)}
                        className="w-full py-3 bg-gradient-to-r from-[#8F2B53] to-[#BE386E] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Products Section */}
          <div className={`${isProductPage ? "lg:flex-1" : "w-full"}`}>
            {/* Header */}
            {!isProductPage && (
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-4 h-10 bg-gradient-to-b from-[#BE386E] to-[#8F2B53] rounded-full"></div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Products</h2>
                  <div className="w-4 h-10 bg-gradient-to-b from-[#8F2B53] to-[#BE386E] rounded-full"></div>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover our handpicked selection of premium products, curated just for you
                </p>
              </div>
            )}

            {/* Active Filters */}
            {isProductPage && (
              <ActiveFilters
                filters={filters}
                setFilters={setFilters}
                categories={categories}
                subcategories={subcategories}
                attributes={attributes}
                clearAllFilters={clearAllFilters}
              />
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="py-16">
                <ProductLoading />
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {isProductPage
                    ? "No products match your current filters. Try adjusting your search criteria."
                    : "We're adding new products to our collection. Check back soon!"}
                </p>
                {isProductPage && (
                  <button
                    onClick={clearAllFilters}
                    className="px-8 py-3 bg-gradient-to-r from-[#8F2B53] to-[#BE386E] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    isProductPage
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  }`}
                >
                  {displayProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      wishlist={wishlist.includes(product._id)}
                      onWishlistToggle={handleWishlist}
                      onAddToCart={handleAddToCart}
                      showAttributes={true}
                      showDeliveryInfo={true}
                    />
                  ))}
                </div>

                {/* Load More Button for Home Page */}
                {!isProductPage && displayProducts.length > 8 && (
                  <div className="mt-12 text-center">
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#8F2B53] to-[#BE386E] text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all"
                    >
                      View All Products
                      <FiArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Pagination for Product Page */}
            {isProductPage && displayProducts.length > 0 && (
              <div className="mt-12 flex items-center justify-between">
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{displayProducts.length}</span> of{" "}
                  <span className="font-semibold text-gray-900">{activeProducts.length}</span> products
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#8F2B53] hover:text-[#8F2B53] transition-colors">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-[#8F2B53] to-[#BE386E] text-white rounded-lg hover:opacity-90 transition-opacity">
                    1
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#8F2B53] hover:text-[#8F2B53] transition-colors">
                    2
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#8F2B53] hover:text-[#8F2B53] transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


// import React, { useEffect, useState } from "react";
// import { FiHeart, FiShoppingCart, FiArrowRight } from "react-icons/fi";
// import { Link, useLocation } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import Swal from "sweetalert2";
// import ProductCard from "./ProductCard";
// import ProductFilters from "./../common/ProductFilters";
// import ActiveFilters from "./../common/ActiveFilters";
// import api from "../../../utils/api";
// import { updateCartCount } from "../../redux/authSlice/cartSlice";
// import { updateWishlistCount } from "../../redux/authSlice/wishlistSlice";
// import { ProductLoading } from "../common/LoadingSpinner";

// export default function FeatureProduct() {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [attributes, setAttributes] = useState([]);
//   const [wishlist, setWishlist] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [openAttributeSections, setOpenAttributeSections] = useState({});

//   const [filters, setFilters] = useState({
//     search: "",
//     category: "",
//     subcategory: "",
//     priceRange: "",
//     rating: "",
//     sortBy: "featured",
//     attributes: {},
//   });

//   const token = useSelector((state) => state.auth.token);
//   const location = useLocation();
//   const dispatch = useDispatch();

//   const isHomePage = location.pathname === "/";
//   const isProductPage = location.pathname === "/product";

//   // Fetch data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [productsResponse, categoriesResponse] = await Promise.all([
//           api.get("/products"),
//           api.get("/categories"),
//         ]);

//         if (productsResponse.data.success) {
//           setProducts(productsResponse.data.products);
//         }
//         if (categoriesResponse.data.success) {
//           setCategories(categoriesResponse.data.categories || []);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Fetch subcategories when category changes
//   useEffect(() => {
//     const fetchSubcategories = async () => {
//       if (filters.category) {
//         try {
//           const response = await api.get(
//             `/subcategories/category/${filters.category}`
//           );
//           if (response.data.success) {
//             setSubcategories(response.data.subcateg || []);
//           }
//         } catch (error) {
//           console.error("Error fetching subcategories:", error);
//           setSubcategories([]);
//         }
//       } else {
//         setSubcategories([]);
//         setAttributes([]);
//         setFilters((prev) => ({ ...prev, subcategory: "", attributes: {} }));
//       }
//     };

//     fetchSubcategories();
//   }, [filters.category]);

//   // Fetch attributes when subcategory changes
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

//   // Fetch wishlist
//   useEffect(() => {
//     const fetchWishlist = async () => {
//       if (!token) {
//         setWishlist([]); // Clear wishlist if no token
//         return;
//       }
//       try {
//         const response = await api.get("/wishlist");
//         if (response.data.success) {
//           const wishlistData = response.data.wishlist || [];
//           const wishlistIds = wishlistData
//             .map((item) => item.productId?._id || item.productId)
//             .filter(Boolean);
//           setWishlist(wishlistIds);
//         }
//       } catch (err) {
//         console.error("Error fetching wishlist:", err);
//         setWishlist([]); // Clear wishlist on error
//       }
//     };

//     fetchWishlist();
//   }, [token]);

//   // Filter products
//   useEffect(() => {
//     if (!isProductPage) return;

//     let result = products.filter((product) => product.status === "active");

//     if (filters.search) {
//       const searchTerm = filters.search.toLowerCase();
//       result = result.filter(
//         (product) =>
//           product.name.toLowerCase().includes(searchTerm) ||
//           product.description?.toLowerCase().includes(searchTerm) ||
//           product.brand?.toLowerCase().includes(searchTerm) ||
//           product.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
//       );
//     }

//     if (filters.category) {
//       result = result.filter(
//         (product) =>
//           product.category?._id === filters.category ||
//           product.category === filters.category
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
//         filters.priceRange === "200-10000"
//           ? product.price >= 200
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

//     // Apply sorting
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
//   }, [filters, products, isProductPage]);

//   // Group products by category for home page
//   const getProductsByCategory = () => {
//     const activeProducts = products.filter((item) => item.status === "active");
//     const categoryMap = {};
//     categories.forEach((category) => {
//       categoryMap[category._id] = {
//         category,
//         products: [],
//       };
//     });
//     activeProducts.forEach((product) => {
//       const categoryId = product.category?._id || product.category;
//       if (categoryId && categoryMap[categoryId]) {
//         categoryMap[categoryId].products.push(product);
//       }
//     });
//     const categoriesWithProducts = Object.values(categoryMap)
//       .filter((item) => item.products.length > 0)
//       .map((item) => ({
//         ...item,
//         products: item.products.slice(0, 4),
//       }));
//     return categoriesWithProducts.sort((a, b) => {
//       const aHasFourOrMore = a.products.length >= 4;
//       const bHasFourOrMore = b.products.length >= 4;

//       if (aHasFourOrMore && !bHasFourOrMore) return -1;
//       if (!aHasFourOrMore && bHasFourOrMore) return 1;
//       return b.products.length - a.products.length;
//     });
//   };

//   // Handler functions
//   const handleWishlist = async (productId) => {
//     if (!token) {
//       Swal.fire({
//         title: "Login Required",
//         text: "Please login to add to wishlist!",
//         icon: "warning",
//         confirmButtonText: "OK",
//       });
//       return;
//     }

//     try {
//       if (wishlist.includes(productId)) {
//         await api.delete(`/wishlist/remove/${productId}`);
//         setWishlist((prev) => prev.filter((id) => id !== productId));
//         Swal.fire("Removed!", "Item removed from wishlist.", "success");
//       } else {
//         await api.post("/wishlist/add", { productId });
//         setWishlist((prev) => [...prev, productId]);
//         Swal.fire("Added!", "Item added to wishlist.", "success");
//       }

//       // Update wishlist count in Redux
//       dispatch(updateWishlistCount());
//     } catch (err) {
//       console.error("Wishlist error:", err);
//       Swal.fire("Error", "Failed to update wishlist", "error");
//     }
//   };

//   const handleAddToCart = async (productId, quantity = 1) => {
//     if (!token) {
//       Swal.fire({
//         title: "Login Required",
//         text: "Please login to add to cart!",
//         icon: "warning",
//         confirmButtonText: "OK",
//       });
//       return;
//     }

//     try {
//       await api.post("/cart", {
//         productId,
//         quantity,
//         selectedAttributes: {}, // Add default empty attributes
//       });

//       // Update cart count in Redux
//       dispatch(updateCartCount());

//       Swal.fire("Success!", "Item added to cart.", "success");
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       const errorMessage =
//         error.response?.data?.message || "Failed to add item to cart.";
//       Swal.fire("Error", errorMessage, "error");
//     }
//   };

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
//       category: "",
//       subcategory: "",
//       priceRange: "",
//       rating: "",
//       sortBy: "featured",
//       attributes: {},
//     });
//     setSubcategories([]);
//     setAttributes([]);
//   };

//   // Home Page View
//   if (isHomePage) {
//     const productsByCategory = getProductsByCategory();

//     return (
//       <section className="py-12 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {loading ? (
//             <div className="text-center py-10">
//               <ProductLoading />
//               {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div> */}
//               {/* <p className="mt-4 text-gray-600">Loading products...</p> */}
//             </div>
//           ) : productsByCategory.length === 0 ? (
//             <div className="text-center py-10">
//               <p className="text-gray-500">No products available.</p>
//             </div>
//           ) : (
//             productsByCategory.map((categoryGroup, index) => (
//               <div key={categoryGroup.category._id} className="mb-16">
//                 <div className="flex justify-between items-center mb-8">
//                   <div>
//                     <h2 className="text-3xl font-bold text-gray-900 capitalize">
//                       {categoryGroup.category.name}
//                     </h2>
//                     <p className="text-gray-600 mt-2">
//                       Discover our amazing{" "}
//                       {categoryGroup.category.name.toLowerCase()} collection
//                     </p>
//                   </div>
//                   <Link
//                     to={`/category/${categoryGroup.category._id}`}
//                     className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
//                   >
//                     View all <FiArrowRight className="ml-1" />
//                   </Link>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//                   {categoryGroup.products.map((product) => (
//                     <ProductCard
//                       key={product._id}
//                       product={product}
//                       wishlist={wishlist.includes(product._id)} // ✅ FIXED: Pass boolean
//                       onWishlistToggle={handleWishlist}
//                       onAddToCart={handleAddToCart}
//                       showAttributes={true}
//                       showDeliveryInfo={true}
//                     />
//                   ))}
//                 </div>

//                 {index < productsByCategory.length - 1 && (
//                   <div className="mt-12 border-t border-gray-200"></div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </section>
//     );
//   }

//   // Product Page View
//   const activeProducts = products.filter((item) => item.status === "active");
//   const displayProducts = isProductPage ? filteredProducts : activeProducts;

//   return (
//     <section className="bg-gray-50 py-10">
//       <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-6">
//         {/* Filters Sidebar */}
//         {isProductPage && (
//           <ProductFilters
//             filters={filters}
//             setFilters={setFilters}
//             categories={categories}
//             subcategories={subcategories}
//             attributes={attributes}
//             openAttributeSections={openAttributeSections}
//             toggleAttributeSection={toggleAttributeSection}
//             handleAttributeChange={handleAttributeChange}
//             clearAllFilters={clearAllFilters}
//             showCategoryFilter={true}
//             showSearchFilter={true}
//           />
//         )}

//         {/* Products Section */}
//         <div className={`${isProductPage ? "flex-1" : "w-full"}`}>
//           {/* Header */}
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">
//               {isProductPage ? "All Products" : "Featured Products"}
//             </h2>

//             {isProductPage && (
//               <div className="flex items-center gap-4">
//                 <select
//                   value={filters.sortBy}
//                   onChange={(e) =>
//                     setFilters({ ...filters, sortBy: e.target.value })
//                   }
//                   className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                 >
//                   <option value="featured">Featured</option>
//                   <option value="price-low">Price: Low to High</option>
//                   <option value="price-high">Price: High to Low</option>
//                   <option value="newest">Newest</option>
//                 </select>
//               </div>
//             )}
//           </div>

//           {/* Active Filters */}
//           {isProductPage && (
//             <ActiveFilters
//               filters={filters}
//               setFilters={setFilters}
//               categories={categories}
//               subcategories={subcategories}
//               attributes={attributes}
//               clearAllFilters={clearAllFilters}
//             />
//           )}

//           {/* Results Count */}
//           {isProductPage && (
//             <div className="mb-4">
//               <p className="text-gray-600">
//                 Showing {displayProducts.length} of {activeProducts.length}{" "}
//                 products
//               </p>
//             </div>
//           )}

//           {/* Products Grid */}
//           {loading ? (
//             <div className="text-center py-10">
//               <ProductLoading />
//               {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div> */}
//               {/* <p className="mt-4 text-gray-600">Loading products...</p> */}
//             </div>
//           ) : displayProducts.length === 0 ? (
//             <div className="text-center py-12 bg-white rounded-lg shadow-sm">
//               <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
//                 <svg
//                   className="w-8 h-8 text-gray-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
//                   />
//                 </svg>
//               </div>
//               <p className="text-gray-500 text-lg mb-4">
//                 {isProductPage
//                   ? "No products found with current filters."
//                   : "No products available."}
//               </p>
//               {isProductPage && (
//                 <button
//                   onClick={clearAllFilters}
//                   className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
//                 >
//                   Clear all filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <div
//               className={`grid gap-4 sm:gap-6 ${
//                 isProductPage
//                   ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
//                   : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
//               }`}
//             >
//               {displayProducts.map((product) => (
//                 <ProductCard
//                   key={product._id}
//                   product={product}
//                   wishlist={wishlist.includes(product._id)}
//                   onWishlistToggle={handleWishlist}
//                   onAddToCart={handleAddToCart}
//                   showAttributes={true}
//                   showDeliveryInfo={true}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }
