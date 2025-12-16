import React, { useState, useEffect } from "react";
import { FiSearch, FiX, FiClock, FiTrendingUp } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../homePage/ProductCard";
import { useSelector } from "react-redux";
import api from "../../../utils/api";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const wishlist = useSelector((state) => state.auth.wishlist || []);

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    setPopularSearches([
      "Kurta",
      "Dress",
      "Saree",
      "Jeans",
      "Shirt",
      "Traditional Wear",
      "Western Wear",
    ]);
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("q");
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        if (response.data.success) {
          setProducts(response.data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const saveToRecentSearches = (query) => {
    if (!query.trim()) return;

    const updatedSearches = [
      query,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== query.toLowerCase()
      ),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const handleSearch = (query = searchQuery) => {
    if (!query.trim()) {
      setFilteredProducts([]);
      setShowSuggestions(true);
      return;
    }

    setLoading(true);
    setShowSuggestions(false);

    const filtered = products.filter(
      (product) =>
        product.status === "active" &&
        (product.name?.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase()) ||
          product.brand?.toLowerCase().includes(query.toLowerCase()) ||
          product.category?.name?.toLowerCase().includes(query.toLowerCase()) ||
          product.subcategory?.name
            ?.toLowerCase()
            .includes(query.toLowerCase()) ||
          product.tags?.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          ))
    );

    setFilteredProducts(filtered);
    saveToRecentSearches(query);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(true);
      setFilteredProducts([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredProducts([]);
    setShowSuggestions(true);
  };

  const removeRecentSearch = (searchToRemove, e) => {
    e.stopPropagation();
    const updatedSearches = recentSearches.filter(
      (item) => item !== searchToRemove
    );
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const handleAddToCart = async (productId) => {
    console.log("Add to cart:", productId);
  };

  const handleWishlistToggle = async (productId) => {
    console.log("Toggle wishlist:", productId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3">
              <FiSearch className="text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for products, brands, and more..."
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <FiX className="text-gray-400 w-4 h-4" />
                </button>
              )}
            </div>
            {showSuggestions && !filteredProducts.length && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-96 overflow-y-auto">
                {recentSearches.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center text-gray-500 text-sm font-medium mb-3">
                      <FiClock className="mr-2" />
                      Recent Searches
                    </div>
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(search)}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                      >
                        <div className="flex items-center">
                          <FiClock className="text-gray-400 mr-3" />
                          <span className="text-gray-700">{search}</span>
                        </div>
                        <button
                          onClick={(e) => removeRecentSearch(search, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                        >
                          <FiX className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center text-gray-500 text-sm font-medium mb-3">
                    <FiTrendingUp className="mr-2" />
                    Popular Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(search)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching products...</p>
          </div>
        ) : searchQuery && filteredProducts.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Search Results for "{searchQuery}"
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  wishlist={wishlist}
                  onWishlistToggle={handleWishlistToggle}
                  onAddToCart={handleAddToCart}
                  showAttributes={true}
                  showDeliveryInfo={true}
                />
              ))}
            </div>
          </div>
        ) : searchQuery && !loading ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any products matching "{searchQuery}"
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Try searching with:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleSuggestionClick("Kurta")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  Kurta
                </button>
                <button
                  onClick={() => handleSuggestionClick("Dress")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  Dress
                </button>
                <button
                  onClick={() => handleSuggestionClick("Traditional")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  Traditional
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Search for products
            </h3>
            <p className="text-gray-600">
              Find your favorite products by name, brand, or category
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
