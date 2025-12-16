import React, { useState, useEffect, useRef } from "react";
import {
  FiMenu,
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiShoppingCart,
  FiHome,
  FiInfo,
  FiMail,
  FiGrid,
  FiPackage,
} from "react-icons/fi";
import { HiFire } from "react-icons/hi";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice/authSlice";
import {
  fetchWishlistCount,
  clearWishlistCount,
} from "../../redux/authSlice/wishlistSlice";
import {
  fetchCartCount,
  clearCartCount,
} from "../../redux/authSlice/cartSlice";
import LoginModal from "./../Login/AuthModal";
import RegisterModal from "../Login/RegisterModel";
import TopSlide from "./TopSlide";
import api from "../../../utils/api";

const Header = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [clickedCategory, setClickedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const clickTimeoutRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const { user, token } = useSelector((state) => state.auth);
  const { count: wishlistCount } = useSelector((state) => state.wishlist);
  const { count: cartCount } = useSelector((state) => state.cart);
  const isAuthenticated = !!user && !!token;

  const navLinks = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Products", path: "/product", icon: FiPackage },
    { name: "About Us", path: "/about", icon: FiInfo },
    { name: "Contact Us", path: "/contact-us", icon: FiMail },
  ];

  const announcementMessages = [
    {
      text: "🔥Sale is Live Now! 🔥🔥",
      icon: HiFire,
      bgGradient: "from-red-600 via-orange-500 to-red-600",
    },
    {
      text: "Everything at FLAT ₹499!!",
      icon: HiFire,
      bgGradient: "from-purple-600 via-pink-500 to-purple-600",
    },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlistCount());
      dispatch(fetchCartCount());
    } else {
      dispatch(clearWishlistCount());
      dispatch(clearCartCount());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setClickedCategory(null);
        setShowUserDropdown(false);
      }
    };

    const handleClickOutside = (e) => {
      if (isMenuOpen && e.target.closest(".mobile-menu-container") === null) {
        setIsMenuOpen(false);
      }
      if (!e.target.closest(".category-item")) {
        setClickedCategory(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % announcementMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcementMessages.length]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("/categories");

        if (response.data.success) {
          setCategories(response.data.categories || []);
        } else {
          setError("Failed to load categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async (categoryId) => {
      if (!subcategories[categoryId]) {
        try {
          const response = await api.get(
            `/subcategories/category/${categoryId}`
          );
          if (response.data.success) {
            setSubcategories((prev) => ({
              ...prev,
              [categoryId]: response.data.subcateg || [],
            }));
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          setSubcategories((prev) => ({
            ...prev,
            [categoryId]: [],
          }));
        }
      }
    };

    if (hoveredCategory || clickedCategory) {
      fetchSubcategories(hoveredCategory || clickedCategory);
    }
  }, [hoveredCategory, clickedCategory, subcategories]);

  const getCategoryName = (category) => {
    return category.name || category.title || category;
  };

  const handleCategoryHover = (categoryId) => {
    setHoveredCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
  };

  const handleCategoryClick = (categoryId, category) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      navigate(`/category/${category._id}`);
      setClickedCategory(null);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setClickedCategory(clickedCategory === categoryId ? null : categoryId);
        clickTimeoutRef.current = null;
      }, 300);
    }
  };

  const handleSubcategoryClick = () => {
    setClickedCategory(null);
    setHoveredCategory(null);
    setIsMenuOpen(false);
  };

  const handleSearchClick = () => {
    navigate("/search");
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      setShowUserDropdown(!showUserDropdown);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearWishlistCount());
    dispatch(clearCartCount());
    setShowUserDropdown(false);
    navigate("/");
  };

  const handleOrdersClick = () => {
    navigate("/orders");
    setShowUserDropdown(false);
  };

  const renderDesktopCategories = () => {
    if (loading) {
      return (
        <div className="flex space-x-8">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-4 w-20 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-500 text-sm">Failed to load categories</div>
      );
    }

    const visibleCategories = categories.slice(0, 6);
    const moreCategories = categories.slice(6);

    return (
      <>
        <div className="flex items-center space-x-6">
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={index}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-1 text-gray-700 font-medium hover:text-[#8F2B53] transition-colors ${
                    isActive ? "text-[#8F2B53] border-b-2 border-[#8F2B53]" : ""
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </div>
        <div className="flex items-center space-x-6 border-l border-gray-200 pl-6">
          <div
            className="relative category-item"
            onMouseEnter={() => setHoveredCategory("all-categories")}
            onMouseLeave={handleCategoryLeave}
          >
            <div className="flex items-center text-gray-700 font-medium hover:text-[#8F2B53] transition cursor-pointer select-none">
              <FiGrid className="w-4 h-4 mr-1" />
              Shop Categories
              <FiChevronDown
                className={`ml-1 w-4 h-4 transition-transform ${
                  hoveredCategory === "all-categories" ? "rotate-180" : ""
                }`}
              />
            </div>

            {hoveredCategory === "all-categories" && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl border border-gray-200 rounded-lg z-50">
                <div className="p-4 max-h-80 overflow-y-auto">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    All Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="relative category-subitem"
                        onMouseEnter={() => handleCategoryHover(category._id)}
                      >
                        <Link
                          to={`/category/${category._id}`}
                          className="flex items-center justify-between py-2 px-3 text-sm text-gray-600 hover:text-[#8F2B53] hover:bg-[#f6e9ee] rounded-lg transition-colors"
                          onClick={() => setHoveredCategory(null)}
                        >
                          <span>{getCategoryName(category)}</span>
                          {subcategories[category._id]?.length > 0 && (
                            <FiChevronDown className="w-3 h-3" />
                          )}
                        </Link>
                        {hoveredCategory === category._id &&
                          subcategories[category._id]?.length > 0 && (
                            <div className="absolute left-full top-0 ml-1 w-56 bg-white shadow-2xl border border-gray-200 rounded-lg z-50">
                              <div className="p-3">
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                  {getCategoryName(category)}
                                </h4>
                                <div className="space-y-1">
                                  {subcategories[category._id].map(
                                    (subcategory) => (
                                      <Link
                                        key={subcategory._id}
                                        to={`/category/${category._id}/subcategory/${subcategory._id}`}
                                        className="block py-1.5 px-3 text-xs text-gray-600 hover:text-[#8F2B53] hover:bg-[#f6e9ee] rounded transition-colors"
                                        onClick={() => setHoveredCategory(null)}
                                      >
                                        {getCategoryName(subcategory)}
                                      </Link>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="sticky top-0 z-50 flex flex-col w-full bg-white">
      <TopSlide
        announcementMessages={announcementMessages}
        currentSlide={currentSlide}
      />

      <div
        className={`bg-white transition-all duration-300 ${
          isScrolled ? "shadow-md py-1" : "shadow-sm py-2"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 sm:hidden"
                aria-label="menu"
              >
                <FiMenu className="w-6 h-6 text-gray-800" />
              </button>

              <Link
                to="/"
                className="flex items-center transform hover:scale-105 transition-transform duration-200"
              >
                <img
                  alt="Aramya"
                  height="40"
                  width="120"
                  src="https://assets.aramya.in/images/images/logo-360x120.png"
                  className="object-contain"
                />
              </Link>
            </div>
            <nav className="hidden lg:flex items-center space-x-6">
              {renderDesktopCategories()}
            </nav>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSearchClick}
                className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 sm:hidden"
              >
                <FiSearch className="w-5 h-5 text-gray-800" />
              </button>
              <button
                onClick={handleSearchClick}
                className="hidden lg:flex p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <FiSearch className="w-5 h-5 text-gray-800" />
              </button>
              <Link
                to="/wishlist"
                className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
                aria-label="Wishlist"
              >
                <FiHeart className="w-5 h-5 text-gray-800 hover:text-red-500" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
                aria-label="Cart"
              >
                <FiShoppingBag className="w-5 h-5 text-gray-800 hover:text-[#8F2B53]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8F2B53] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={handleUserClick}
                  className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <FiUser className="w-5 h-5 text-gray-800 hover:text-[#8F2B53]" />
                </button>
                {isAuthenticated && showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-2xl border border-gray-200 rounded-lg z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">
                          Hello, {user?.name || user?.email || "User"}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-1"
                      >
                        <FiUser className="w-4 h-4" />
                        My Profile
                      </Link>

                      <button
                        onClick={handleOrdersClick}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <FiShoppingCart className="w-4 h-4" />
                        My Orders
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="lg:hidden mt-2">
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              {navLinks.slice(0, 3).map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={index}
                    to={link.path}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-[#8F2B53] whitespace-nowrap"
                  >
                    <Icon className="w-3 h-3" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="mobile-menu-container fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out sm:hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <img
                    alt="Aramya"
                    height="32"
                    width="96"
                    src="https://assets.aramya.in/images/images/logo-360x120.png"
                    className="object-contain"
                  />
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="h-full overflow-y-auto pb-20">
                <div className="p-4 bg-gradient-to-r from-[#f6e9ee] to-[#f8f0f3] border-b border-gray-200">
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#8F2B53] rounded-full flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user?.name || "Welcome!"}
                        </p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#8F2B53] rounded-full flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Welcome!</p>
                        <p className="text-sm text-gray-600">
                          Sign in to your account
                        </p>
                      </div>
                    </div>
                  )}
                  {!isAuthenticated && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => {
                          setIsLoginModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex-1 bg-[#8F2B53] text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-[#7a2450] transition-colors"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setIsRegisterModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex-1 border border-[#8F2B53] text-[#8F2B53] text-center py-2 px-4 rounded-lg font-medium hover:bg-[#8F2B53] hover:text-white transition-colors"
                      >
                        Register
                      </button>
                    </div>
                  )}

                  {isAuthenticated && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => {
                          navigate("/orders");
                          setIsMenuOpen(false);
                        }}
                        className="flex-1 bg-[#8F2B53] text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-[#7a2450] transition-colors"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex-1 border border-[#8F2B53] text-[#8F2B53] text-center py-2 px-4 rounded-lg font-medium hover:bg-[#8F2B53] hover:text-white transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                <div className="py-2">
                  <div className="px-4 py-2">
                    <h3 className="font-semibold text-gray-800 mb-2 px-2">
                      Navigation
                    </h3>
                    <div className="space-y-1">
                      {navLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={index}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 py-3 px-4 text-gray-600 hover:text-[#8F2B53] hover:bg-[#f6e9ee] rounded-lg transition-colors"
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{link.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                      Product Categories
                    </h3>

                    {loading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, index) => (
                          <div key={index} className="py-2 px-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    ) : error ? (
                      <p className="text-red-500 text-sm py-2">{error}</p>
                    ) : categories.length === 0 ? (
                      <p className="text-gray-500 text-sm py-2">
                        No categories found
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {categories.map((category, index) => (
                          <div
                            key={category._id || index}
                            className="border-b border-gray-100 last:border-b-0"
                          >
                            <Link
                              to={`/category/${category._id}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="block py-3 px-3 text-gray-600 hover:text-[#8F2B53] hover:bg-[#f6e9ee] rounded-lg transition-colors font-medium"
                            >
                              {getCategoryName(category)}
                            </Link>
                            {subcategories[category._id] &&
                              subcategories[category._id].length > 0 && (
                                <div className="ml-4 mt-1 space-y-1">
                                  {subcategories[category._id].map(
                                    (subcategory) => (
                                      <Link
                                        key={subcategory._id}
                                        to={`/category/${category._id}/subcategory/${subcategory._id}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block py-2 px-3 text-sm text-gray-500 hover:text-[#8F2B53] hover:bg-[#f6e9ee] rounded-lg transition-colors"
                                      >
                                        {getCategoryName(subcategory)}
                                      </Link>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleSearchClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium"
                    >
                      <FiSearch className="w-5 h-5" />
                      Search Products
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {!isAuthenticated && (
        <>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onSwitchToRegister={() => {
              setIsLoginModalOpen(false);
              setIsRegisterModalOpen(true);
            }}
          />

          <RegisterModal
            isOpen={isRegisterModalOpen}
            onClose={() => setIsRegisterModalOpen(false)}
            onSwitchToLogin={() => {
              setIsRegisterModalOpen(false);
              setIsLoginModalOpen(true);
            }}
          />
        </>
      )}
    </div>
  );
};

export default Header;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   FiMenu,
//   FiSearch,
//   FiHeart,
//   FiShoppingBag,
//   FiUser,
//   FiX,
//   FiChevronDown,
//   FiLogOut,
//   FiShoppingCart,
// } from "react-icons/fi";
// import { HiFire } from "react-icons/hi";
// import { Link, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../../redux/authSlice/authSlice";
// import {
//   fetchWishlistCount,
//   clearWishlistCount,
// } from "../../redux/authSlice/wishlistSlice";
// import {
//   fetchCartCount,
//   clearCartCount,
// } from "../../redux/authSlice/cartSlice";
// import LoginModal from "./../Login/AuthModal";
// import RegisterModal from "../Login/RegisterModel";
// import TopSlide from "./TopSlide";
// import api from "../../../utils/api";

// const Header = () => {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
//   const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
//   const [hoveredCategory, setHoveredCategory] = useState(null);
//   const [clickedCategory, setClickedCategory] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showUserDropdown, setShowUserDropdown] = useState(false);
//   const clickTimeoutRef = useRef(null);
//   const userDropdownRef = useRef(null);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   // Redux selectors
//   const { user, token } = useSelector((state) => state.auth);
//   const { count: wishlistCount } = useSelector((state) => state.wishlist);
//   const { count: cartCount } = useSelector((state) => state.cart);
//   const isAuthenticated = !!user && !!token;

//   const announcementMessages = [
//     {
//       text: "🔥🔥 Diwali Sale is Live Now! 🔥🔥",
//       icon: HiFire,
//       bgGradient: "from-red-600 via-orange-500 to-red-600",
//     },
//     {
//       text: "Everything at FLAT ₹499!!",
//       icon: HiFire,
//       bgGradient: "from-purple-600 via-pink-500 to-purple-600",
//     },
//   ];

//   // Fetch wishlist and cart counts when component mounts or authentication changes
//   useEffect(() => {
//     if (isAuthenticated) {
//       dispatch(fetchWishlistCount());
//       dispatch(fetchCartCount());
//     } else {
//       // Clear counts when user logs out
//       dispatch(clearWishlistCount());
//       dispatch(clearCartCount());
//     }
//   }, [isAuthenticated, dispatch]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         userDropdownRef.current &&
//         !userDropdownRef.current.contains(event.target)
//       ) {
//         setShowUserDropdown(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     const handleEscape = (e) => {
//       if (e.key === "Escape") {
//         setIsMenuOpen(false);
//         setClickedCategory(null);
//         setShowUserDropdown(false);
//       }
//     };

//     const handleClickOutside = (e) => {
//       if (isMenuOpen && e.target.closest(".mobile-menu-container") === null) {
//         setIsMenuOpen(false);
//       }
//       if (!e.target.closest(".category-item")) {
//         setClickedCategory(null);
//       }
//     };

//     document.addEventListener("keydown", handleEscape);
//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("keydown", handleEscape);
//       document.removeEventListener("mousedown", handleClickOutside);
//       if (clickTimeoutRef.current) {
//         clearTimeout(clickTimeoutRef.current);
//       }
//     };
//   }, [isMenuOpen]);

//   useEffect(() => {
//     if (isMenuOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isMenuOpen]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % announcementMessages.length);
//     }, 4000);
//     return () => clearInterval(interval);
//   }, [announcementMessages.length]);

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 20);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         setLoading(true);
//         const response = await api.get("/categories");

//         if (response.data.success) {
//           setCategories(response.data.categories || []);
//         } else {
//           setError("Failed to load categories");
//         }
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//         setError("Failed to load categories");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const fetchSubcategories = async (categoryId) => {
//       if (!subcategories[categoryId]) {
//         try {
//           const response = await api.get(
//             `/subcategories/category/${categoryId}`
//           );
//           if (response.data.success) {
//             setSubcategories((prev) => ({
//               ...prev,
//               [categoryId]: response.data.subcateg || [],
//             }));
//           }
//         } catch (error) {
//           console.error("Error fetching subcategories:", error);
//           setSubcategories((prev) => ({
//             ...prev,
//             [categoryId]: [],
//           }));
//         }
//       }
//     };

//     if (hoveredCategory || clickedCategory) {
//       fetchSubcategories(hoveredCategory || clickedCategory);
//     }
//   }, [hoveredCategory, clickedCategory, subcategories]);

//   const getCategoryName = (category) => {
//     return category.name || category.title || category;
//   };

//   const handleCategoryHover = (categoryId) => {
//     setHoveredCategory(categoryId);
//   };

//   const handleCategoryLeave = () => {
//     setHoveredCategory(null);
//   };

//   const handleCategoryClick = (categoryId, category) => {
//     if (clickTimeoutRef.current) {
//       clearTimeout(clickTimeoutRef.current);
//       clickTimeoutRef.current = null;
//       navigate(`/category/${category._id}`);
//       setClickedCategory(null);
//     } else {
//       clickTimeoutRef.current = setTimeout(() => {
//         setClickedCategory(clickedCategory === categoryId ? null : categoryId);
//         clickTimeoutRef.current = null;
//       }, 300);
//     }
//   };

//   const handleSubcategoryClick = () => {
//     setClickedCategory(null);
//     setHoveredCategory(null);
//     setIsMenuOpen(false);
//   };

//   const handleSearchClick = () => {
//     navigate("/search");
//   };

//   const handleUserClick = () => {
//     if (isAuthenticated) {
//       setShowUserDropdown(!showUserDropdown);
//     } else {
//       setIsLoginModalOpen(true);
//     }
//   };

//   const handleLogout = () => {
//     dispatch(logout());
//     dispatch(clearWishlistCount());
//     dispatch(clearCartCount());
//     setShowUserDropdown(false);
//     navigate("/");
//   };

//   const handleOrdersClick = () => {
//     navigate("/orders");
//     setShowUserDropdown(false);
//   };

//   // Function to handle many categories on desktop
//   const renderDesktopCategories = () => {
//     if (loading) {
//       return (
//         <div className="flex space-x-8">
//           {[...Array(4)].map((_, index) => (
//             <div
//               key={index}
//               className="h-4 w-20 bg-gray-200 rounded animate-pulse"
//             ></div>
//           ))}
//         </div>
//       );
//     }

//     if (error) {
//       return (
//         <div className="text-red-500 text-sm">Failed to load categories</div>
//       );
//     }

//     // Show only first 6 categories and "More" dropdown for rest
//     const visibleCategories = categories.slice(0, 6);
//     const moreCategories = categories.slice(6);

//     return (
//       <>
//         {visibleCategories.map((category) => (
//           <div
//             key={category._id}
//             className="relative category-item"
//             onMouseEnter={() => handleCategoryHover(category._id)}
//             onMouseLeave={handleCategoryLeave}
//           >
//             <div
//               onClick={() => handleCategoryClick(category._id, category)}
//               className="flex items-center text-gray-700 font-medium hover:text-indigo-600 transition cursor-pointer select-none whitespace-nowrap"
//             >
//               {getCategoryName(category)}
//               <FiChevronDown
//                 className={`ml-1 w-4 h-4 transition-transform ${
//                   hoveredCategory === category._id ||
//                   clickedCategory === category._id
//                     ? "rotate-180"
//                     : ""
//                 }`}
//               />
//             </div>

//             {(hoveredCategory === category._id ||
//               clickedCategory === category._id) && (
//               <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl border border-gray-200 rounded-lg z-50">
//                 <div className="p-4">
//                   <div className="flex justify-between items-center mb-3">
//                     <h3 className="font-semibold text-gray-800">
//                       {getCategoryName(category)}
//                     </h3>
//                     <button
//                       onClick={() => {
//                         navigate(`/category/${category._id}`);
//                         setClickedCategory(null);
//                         setHoveredCategory(null);
//                       }}
//                       className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
//                     >
//                       View All
//                     </button>
//                   </div>

//                   {subcategories[category._id] ? (
//                     subcategories[category._id].length > 0 ? (
//                       <div className="space-y-2">
//                         {subcategories[category._id].map((subcategory) => (
//                           <Link
//                             key={subcategory._id}
//                             to={`/category/${category._id}/subcategory/${subcategory._id}`}
//                             className="block py-2 px-3 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
//                             onClick={handleSubcategoryClick}
//                           >
//                             {getCategoryName(subcategory)}
//                           </Link>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-gray-500 text-sm py-2 text-center">
//                         No subcategories
//                       </p>
//                     )
//                   ) : (
//                     <div className="space-y-2">
//                       {[...Array(4)].map((_, index) => (
//                         <div key={index} className="py-2 px-3">
//                           <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}

//         {/* More Categories Dropdown */}
//         {moreCategories.length > 0 && (
//           <div
//             className="relative category-item"
//             onMouseEnter={() => setHoveredCategory("more")}
//             onMouseLeave={handleCategoryLeave}
//           >
//             <div className="flex items-center text-gray-700 font-medium hover:text-indigo-600 transition cursor-pointer select-none">
//               More
//               <FiChevronDown
//                 className={`ml-1 w-4 h-4 transition-transform ${
//                   hoveredCategory === "more" ? "rotate-180" : ""
//                 }`}
//               />
//             </div>

//             {hoveredCategory === "more" && (
//               <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl border border-gray-200 rounded-lg z-50">
//                 <div className="p-4 max-h-80 overflow-y-auto">
//                   <h3 className="font-semibold text-gray-800 mb-3">
//                     More Categories
//                   </h3>
//                   <div className="space-y-2">
//                     {moreCategories.map((category) => (
//                       <Link
//                         key={category._id}
//                         to={`/category/${category._id}`}
//                         className="block py-2 px-3 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
//                         onClick={() => setHoveredCategory(null)}
//                       >
//                         {getCategoryName(category)}
//                       </Link>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </>
//     );
//   };

//   return (
//     <div className="sticky top-0 z-50 flex flex-col w-full bg-white">
//       <TopSlide
//         announcementMessages={announcementMessages}
//         currentSlide={currentSlide}
//       />

//       <div
//         className={`bg-white transition-all duration-300 ${
//           isScrolled ? "shadow-md py-1" : "shadow-sm py-2"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-14 md:h-16">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setIsMenuOpen(true)}
//                 className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 sm:hidden"
//                 aria-label="menu"
//               >
//                 <FiMenu className="w-6 h-6 text-gray-800" />
//               </button>

//               <Link
//                 to="/"
//                 className="flex items-center transform hover:scale-105 transition-transform duration-200"
//               >
//                 <img
//                   alt="Aramya"
//                   height="40"
//                   width="120"
//                   src="https://assets.aramya.in/images/images/logo-360x120.png"
//                   className="object-contain"
//                 />
//               </Link>
//             </div>

//             {/* Desktop Navigation */}
//             <nav className="hidden sm:flex items-center space-x-6 lg:space-x-8">
//               {renderDesktopCategories()}
//             </nav>

//             <div className="flex items-center gap-3">
//               <button
//                 onClick={handleSearchClick}
//                 className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 sm:hidden"
//               >
//                 <FiSearch className="w-5 h-5 text-gray-800" />
//               </button>
//               <button
//                 onClick={handleSearchClick}
//                 className="hidden lg:flex p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
//               >
//                 <FiSearch className="w-5 h-5 text-gray-800" />
//               </button>

//               {/* Wishlist Button with Count */}
//               <Link
//                 to="/wishlist"
//                 className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
//                 aria-label="Wishlist"
//               >
//                 <FiHeart className="w-5 h-5 text-gray-800 hover:text-red-500" />
//                 {wishlistCount > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
//                     {wishlistCount > 9 ? "9+" : wishlistCount}
//                   </span>
//                 )}
//               </Link>

//               {/* Cart Button with Count */}
//               <Link
//                 to="/cart"
//                 className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
//                 aria-label="Cart"
//               >
//                 <FiShoppingBag className="w-5 h-5 text-gray-800 hover:text-indigo-500" />
//                 {cartCount > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
//                     {cartCount > 9 ? "9+" : cartCount}
//                   </span>
//                 )}
//               </Link>

//               {/* User Icon with Dropdown */}
//               <div className="relative" ref={userDropdownRef}>
//                 <button
//                   onClick={handleUserClick}
//                   className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
//                 >
//                   <FiUser className="w-5 h-5 text-gray-800 hover:text-green-600" />
//                 </button>

//                 {isAuthenticated && showUserDropdown && (
//                   <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-2xl border border-gray-200 rounded-lg z-50">
//                     <div className="p-2">
//                       <div className="px-3 py-2 border-b border-gray-100">
//                         <p className="text-sm font-medium text-gray-800">
//                           Hello, {user?.name || user?.email || "User"}
//                         </p>
//                       </div>

//                       <button
//                         onClick={handleOrdersClick}
//                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
//                       >
//                         <FiShoppingCart className="w-4 h-4" />
//                         My Orders
//                       </button>

//                       <button
//                         onClick={handleLogout}
//                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
//                       >
//                         <FiLogOut className="w-4 h-4" />
//                         Logout
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <>
//             <div
//               className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
//               onClick={() => setIsMenuOpen(false)}
//             />

//             <div className="mobile-menu-container fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out sm:hidden">
//               <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
//                 <div className="flex items-center space-x-3">
//                   <img
//                     alt="Aramya"
//                     height="32"
//                     width="96"
//                     src="https://assets.aramya.in/images/images/logo-360x120.png"
//                     className="object-contain"
//                   />
//                 </div>
//                 <button
//                   onClick={() => setIsMenuOpen(false)}
//                   className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//                 >
//                   <FiX className="w-6 h-6 text-gray-600" />
//                 </button>
//               </div>

//               <div className="h-full overflow-y-auto pb-20">
//                 {/* User Section */}
//                 <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
//                   {isAuthenticated ? (
//                     <div className="flex items-center space-x-3">
//                       <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
//                         <FiUser className="w-6 h-6 text-indigo-600" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-gray-800">
//                           {user?.name || "Welcome!"}
//                         </p>
//                         <p className="text-sm text-gray-600">{user?.email}</p>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="flex items-center space-x-3">
//                       <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
//                         <FiUser className="w-6 h-6 text-indigo-600" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-gray-800">Welcome!</p>
//                         <p className="text-sm text-gray-600">
//                           Sign in to your account
//                         </p>
//                       </div>
//                     </div>
//                   )}

//                   {!isAuthenticated && (
//                     <div className="mt-3 flex space-x-2">
//                       <button
//                         onClick={() => {
//                           setIsLoginModalOpen(true);
//                           setIsMenuOpen(false);
//                         }}
//                         className="flex-1 bg-[#68002a] text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
//                       >
//                         Login
//                       </button>
//                       <button
//                         onClick={() => {
//                           setIsRegisterModalOpen(true);
//                           setIsMenuOpen(false);
//                         }}
//                         className="flex-1 border border-[#68002a] text-[#68002a] text-center py-2 px-4 rounded-lg font-medium hover:bg-[#68002a] hover:text-white transition-colors"
//                       >
//                         Register
//                       </button>
//                     </div>
//                   )}

//                   {isAuthenticated && (
//                     <div className="mt-3 flex space-x-2">
//                       <button
//                         onClick={() => {
//                           navigate("/orders");
//                           setIsMenuOpen(false);
//                         }}
//                         className="flex-1 bg-[#68002a] text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
//                       >
//                         My Orders
//                       </button>
//                       <button
//                         onClick={() => {
//                           handleLogout();
//                           setIsMenuOpen(false);
//                         }}
//                         className="flex-1 border border-[#68002a] text-[#68002a] text-center py-2 px-4 rounded-lg font-medium hover:bg-[#68002a] hover:text-white transition-colors"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 <div className="py-2">
//                   <div className="px-6 py-4 border-b border-gray-200">
//                     <h3 className="font-semibold text-gray-800 mb-3 text-lg">
//                       Categories
//                     </h3>

//                     {loading ? (
//                       <div className="space-y-2">
//                         {[...Array(5)].map((_, index) => (
//                           <div key={index} className="py-2 px-3">
//                             <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : error ? (
//                       <p className="text-red-500 text-sm py-2">{error}</p>
//                     ) : categories.length === 0 ? (
//                       <p className="text-gray-500 text-sm py-2">
//                         No categories found
//                       </p>
//                     ) : (
//                       <div className="space-y-2">
//                         {categories.map((category, index) => (
//                           <div
//                             key={category._id || index}
//                             className="border-b border-gray-100 last:border-b-0"
//                           >
//                             <Link
//                               to={`/category/${category._id}`}
//                               onClick={() => setIsMenuOpen(false)}
//                               className="block py-3 px-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
//                             >
//                               {getCategoryName(category)}
//                             </Link>
//                             {subcategories[category._id] &&
//                               subcategories[category._id].length > 0 && (
//                                 <div className="ml-4 mt-1 space-y-1">
//                                   {subcategories[category._id].map(
//                                     (subcategory) => (
//                                       <Link
//                                         key={subcategory._id}
//                                         to={`/category/${category._id}/subcategory/${subcategory._id}`}
//                                         onClick={() => setIsMenuOpen(false)}
//                                         className="block py-2 px-3 text-sm text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
//                                       >
//                                         {getCategoryName(subcategory)}
//                                       </Link>
//                                     )
//                                   )}
//                                 </div>
//                               )}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                   <div className="px-6 py-4 border-b border-gray-200">
//                     <button
//                       onClick={() => {
//                         handleSearchClick();
//                         setIsMenuOpen(false);
//                       }}
//                       className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium"
//                     >
//                       <FiSearch className="w-5 h-5" />
//                       Search Products
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Modals */}
//       {!isAuthenticated && (
//         <>
//           <LoginModal
//             isOpen={isLoginModalOpen}
//             onClose={() => setIsLoginModalOpen(false)}
//             onSwitchToRegister={() => {
//               setIsLoginModalOpen(false);
//               setIsRegisterModalOpen(true);
//             }}
//           />

//           <RegisterModal
//             isOpen={isRegisterModalOpen}
//             onClose={() => setIsRegisterModalOpen(false)}
//             onSwitchToLogin={() => {
//               setIsRegisterModalOpen(false);
//               setIsLoginModalOpen(true);
//             }}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default Header;
