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
import Logo from "../../assets/Marotix-Logo.png";

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
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const clickTimeoutRef = useRef(null);
  const userDropdownRef = useRef(null);
  const categoriesDropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      
      if (
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(event.target) &&
        !event.target.closest(".shop-categories-trigger")
      ) {
        setDropdownVisible(false);
        setHoveredCategory(null);
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
        setDropdownVisible(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
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
          setError(null);
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

    if (hoveredCategory && hoveredCategory !== "all-categories") {
      fetchSubcategories(hoveredCategory);
    }
  }, [hoveredCategory, subcategories]);

  const getCategoryName = (category) => {
    return category.name || category.title || category;
  };

  const handleShopCategoriesHover = () => {
    setDropdownVisible(true);
  };

  const handleShopCategoriesLeave = (e) => {
    if (
      categoriesDropdownRef.current &&
      categoriesDropdownRef.current.contains(e.relatedTarget)
    ) {
      return; 
    }
    setTimeout(() => {
      if (!hoveredCategory) {
        setDropdownVisible(false);
      }
    }, 100);
  };

  const handleDropdownLeave = (e) => {
    if (
      e.relatedTarget &&
      e.relatedTarget.closest(".shop-categories-trigger")
    ) {
      return; 
    }
    
    setDropdownVisible(false);
    setHoveredCategory(null);
  };

  const handleCategoryHover = (categoryId) => {
    setHoveredCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
  };

  const handleCategoryClick = (categoryId, category) => {
    if (clickedCategory === categoryId) {
      setClickedCategory(null);
      return;
    }
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      navigate(`/category/${category._id}`);
      setClickedCategory(null);
      setIsMenuOpen(false);
      setDropdownVisible(false);
      return;
    }
    clickTimeoutRef.current = setTimeout(() => {
      setClickedCategory(categoryId);
      clickTimeoutRef.current = null;
    }, 300); 
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
    navigate("/user-dashboard/orders");
    setShowUserDropdown(false);
  };

  const renderDesktopCategories = () => {
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
                  `flex items-center space-x-1 text-gray-700 font-medium hover:text-[#4A90E2] transition-colors ${
                    isActive ? "text-[#4A90E2] border-b-2 border-[#4A90E2]" : ""
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
          {loading ? (
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div
              className="relative shop-categories-trigger"
              onMouseEnter={handleShopCategoriesHover}
              onMouseLeave={handleShopCategoriesLeave}
            >
              <button className="flex items-center text-gray-700 font-medium hover:text-[#4A90E2] transition cursor-pointer select-none">
                <FiGrid className="w-4 h-4 mr-1" />
                Shop Categories
                <FiChevronDown
                  className={`ml-1 w-4 h-4 transition-transform ${
                    dropdownVisible ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownVisible && (
                <div
                  ref={categoriesDropdownRef}
                  className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl border border-gray-200 rounded-lg z-50"
                  onMouseLeave={handleDropdownLeave}
                >
                  <div className="p-4 max-h-80 overflow-y-auto">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      All Categories
                    </h3>
                    {error || categories.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">
                          {error ? "Failed to load categories" : "No categories available"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div
                            key={category._id}
                            className="relative group"
                            onMouseEnter={() => handleCategoryHover(category._id)}
                            onMouseLeave={handleCategoryLeave}
                          >
                            <div
                              onClick={() => handleCategoryClick(category._id, category)}
                              className="flex items-center justify-between py-2 px-3 text-sm text-gray-600 hover:text-[#4A90E2] hover:bg-[#E3F2FD] rounded-lg transition-colors cursor-pointer"
                            >
                              <span>{getCategoryName(category)}</span>
                              {subcategories[category._id]?.length > 0 && (
                                <FiChevronDown 
                                  className={`w-3 h-3 transition-transform ${
                                    hoveredCategory === category._id ? "rotate-180" : ""
                                  }`}
                                />
                              )}
                            </div>
                            
                            {hoveredCategory === category._id &&
                             subcategories[category._id]?.length > 0 && (
                              <div 
                                className="absolute left-full top-0 ml-1 w-56 bg-white shadow-2xl border border-gray-200 rounded-lg z-50"
                                onMouseEnter={() => handleCategoryHover(category._id)}
                                onMouseLeave={handleCategoryLeave}
                              >
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
                                          className="block py-1.5 px-3 text-xs text-gray-600 hover:text-[#4A90E2] hover:bg-[#E3F2FD] rounded transition-colors"
                                          onClick={() => {
                                            setHoveredCategory(null);
                                            setDropdownVisible(false);
                                          }}
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
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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
          isScrolled ? "shadow-md py-2" : "shadow-sm py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 lg:hidden"
                aria-label="menu"
              >
                <FiMenu className="w-6 h-6 text-gray-800" />
              </button>

              <Link
                to="/"
                className="flex items-center transform hover:scale-105 transition-transform duration-200"
              >
                <img
                  alt="Marotix"
                  src={Logo}
                  className="h-14 w-auto md:h-16 lg:h-20 object-contain"
                />
              </Link>
            </div>
            <nav className="hidden lg:flex items-center space-x-6">
              {renderDesktopCategories()}
            </nav>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSearchClick}
                className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 lg:hidden"
              >
                <FiSearch className="w-5 h-5 text-gray-800" />
              </button>
              
              <div className="hidden lg:flex items-center gap-4">
                <button
                  onClick={handleSearchClick}
                  className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <FiSearch className="w-5 h-5 text-gray-800 hover:text-[#4A90E2]" />
                </button>
                
                <Link
                  to="/wishlist"
                  className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
                  aria-label="Wishlist"
                >
                  <FiHeart className="w-5 h-5 text-gray-800 hover:text-[#4A90E2]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FFD166] text-[#2C3E50] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>
                
                <Link
                  to="/cart"
                  className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
                  aria-label="Cart"
                >
                  <FiShoppingBag className="w-5 h-5 text-gray-800 hover:text-[#4A90E2]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#4A90E2] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <Link
                  to="/wishlist"
                  className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
                  aria-label="Wishlist"
                >
                  <FiHeart className="w-5 h-5 text-gray-800 hover:text-[#4A90E2]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FFD166] text-[#2C3E50] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>
                
                <Link
                  to="/cart"
                  className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
                  aria-label="Cart"
                >
                  <FiShoppingBag className="w-5 h-5 text-gray-800 hover:text-[#4A90E2]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#4A90E2] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              </div>
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={handleUserClick}
                  className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <FiUser className="w-5 h-5 text-gray-800 hover:text-[#4A90E2]" />
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
                        to="/user-dashboard/profile"
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
            <div className="flex items-center justify-between space-x-2 overflow-x-auto pb-2">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={index}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-1 text-sm px-3 py-1.5 rounded-lg whitespace-nowrap ${
                        isActive
                          ? "text-[#4A90E2] bg-[#E3F2FD] font-medium"
                          : "text-gray-600 hover:text-[#4A90E2] hover:bg-gray-50"
                      }`
                    }
                  >
                    <Icon className="w-3 h-3" />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="mobile-menu-container fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <img
                    alt="Marotix"
                    src={Logo}
                    className="h-8 w-auto object-contain"
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
                <div className="p-4 bg-gradient-to-r from-[#E3F2FD] to-[#F8FAFC] border-b border-gray-200">
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center">
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
                      <div className="w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center">
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
                        className="flex-1 bg-[#4A90E2] text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-[#357ABD] transition-colors"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setIsRegisterModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex-1 border border-[#4A90E2] text-[#4A90E2] text-center py-2 px-4 rounded-lg font-medium hover:bg-[#4A90E2] hover:text-white transition-colors"
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
                        className="flex-1 bg-[#4A90E2] text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-[#357ABD] transition-colors"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex-1 border border-[#4A90E2] text-[#4A90E2] text-center py-2 px-4 rounded-lg font-medium hover:bg-[#4A90E2] hover:text-white transition-colors"
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
                            className="flex items-center space-x-3 py-3 px-4 text-gray-600 hover:text-[#4A90E2] hover:bg-[#E3F2FD] rounded-lg transition-colors"
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{link.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <div className="px-4 py-4 border-t border-gray-200">
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
                    ) : error || categories.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">
                          {error ? "Failed to load categories" : "No categories available"}
                        </p>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-2 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {categories.map((category, index) => (
                          <div
                            key={category._id || index}
                            className="border-b border-gray-100 last:border-b-0"
                          >
                            <div
                              onClick={() => handleCategoryClick(category._id, category)}
                              className="flex items-center justify-between py-3 px-3 text-gray-600 hover:text-[#4A90E2] hover:bg-[#E3F2FD] rounded-lg transition-colors font-medium cursor-pointer"
                            >
                              <span>{getCategoryName(category)}</span>
                              {subcategories[category._id]?.length > 0 && (
                                <FiChevronDown 
                                  className={`w-4 h-4 transition-transform ${
                                    clickedCategory === category._id ? "rotate-180" : ""
                                  }`}
                                />
                              )}
                            </div>
                            
                            {clickedCategory === category._id && 
                             subcategories[category._id] &&
                             subcategories[category._id].length > 0 && (
                              <div className="ml-4 mt-1 space-y-1">
                                {subcategories[category._id].map(
                                  (subcategory) => (
                                    <Link
                                      key={subcategory._id}
                                      to={`/category/${category._id}/subcategory/${subcategory._id}`}
                                      onClick={() => {
                                        setClickedCategory(null);
                                        setIsMenuOpen(false);
                                      }}
                                      className="block py-2 px-3 text-sm text-gray-500 hover:text-[#4A90E2] hover:bg-[#E3F2FD] rounded-lg transition-colors"
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
                  <div className="px-4 py-4 border-t border-gray-200">
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
//   FiHome,
//   FiInfo,
//   FiMail,
//   FiGrid,
//   FiPackage,
// } from "react-icons/fi";
// import { HiFire } from "react-icons/hi";
// import { Link, useNavigate, NavLink } from "react-router-dom";
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
// import Logo from "../../assets/Marotix-Logo.png";

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

//   const { user, token } = useSelector((state) => state.auth);
//   const { count: wishlistCount } = useSelector((state) => state.wishlist);
//   const { count: cartCount } = useSelector((state) => state.cart);
//   const isAuthenticated = !!user && !!token;

//   const navLinks = [
//     { name: "Home", path: "/", icon: FiHome },
//     { name: "Products", path: "/products", icon: FiPackage }, 
//     { name: "About Us", path: "/about", icon: FiInfo },
//     { name: "Contact Us", path: "/contact-us", icon: FiMail },
//   ];

//   const announcementMessages = [
//     {
//       text: "🔥Sale is Live Now! 🔥🔥",
//       icon: HiFire,
//       bgGradient: "from-red-600 via-orange-500 to-red-600",
//     },
//     {
//       text: "Everything at FLAT ₹499!!",
//       icon: HiFire,
//       bgGradient: "from-purple-600 via-pink-500 to-purple-600",
//     },
//   ];

//   useEffect(() => {
//     if (isAuthenticated) {
//       dispatch(fetchWishlistCount());
//       dispatch(fetchCartCount());
//     } else {
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
//           setError(null); // Clear any previous errors
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

//   const renderDesktopCategories = () => {
//     return (
//       <>
//         <div className="flex items-center space-x-6">
//           {navLinks.map((link, index) => {
//             const Icon = link.icon;
//             return (
//               <NavLink
//                 key={index}
//                 to={link.path}
//                 className={({ isActive }) =>
//                   `flex items-center space-x-1 text-gray-700 font-medium hover:text-[#0EA5E9] transition-colors ${
//                     isActive ? "text-[#0EA5E9] border-b-2 border-[#0EA5E9]" : ""
//                   }`
//                 }
//               >
//                 <Icon className="w-4 h-4" />
//                 <span>{link.name}</span>
//               </NavLink>
//             );
//           })}
//         </div>
//         <div className="flex items-center space-x-6 border-l border-gray-200 pl-6">
//           {loading ? (
//             <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
//           ) : error || categories.length === 0 ? (
//             <div
//               className="relative category-item"
//               onMouseEnter={() => setHoveredCategory("all-categories")}
//               onMouseLeave={handleCategoryLeave}
//             >
//               <div className="flex items-center text-gray-700 font-medium hover:text-[#0EA5E9] transition cursor-pointer select-none">
//                 <FiGrid className="w-4 h-4 mr-1" />
//                 Shop Categories
//                 <FiChevronDown
//                   className={`ml-1 w-4 h-4 transition-transform ${
//                     hoveredCategory === "all-categories" ? "rotate-180" : ""
//                   }`}
//                 />
//               </div>

//               {hoveredCategory === "all-categories" && (
//                 <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl border border-gray-200 rounded-lg z-50">
//                   <div className="p-4 max-h-80 overflow-y-auto">
//                   <h3 className="font-semibold text-gray-800 mb-3">
//                       All Categories
//                     </h3>
//                     {error || categories.length === 0 ? (
//                       <div className="text-center py-4">
//                         <p className="text-gray-500 text-sm">
//                           {error ? "Failed to load categories" : "No categories available"}
//                         </p>
//                       </div>
//                     ) : (
//                       <div className="space-y-2">
//                         {categories.map((category) => (
//                           <div
//                             key={category._id}
//                             className="relative category-subitem"
//                             onMouseEnter={() => handleCategoryHover(category._id)}
//                           >
//                             <Link
//                               to={`/category/${category._id}`}
//                               className="flex items-center justify-between py-2 px-3 text-sm text-gray-600 hover:text-[#0EA5E9] hover:bg-[#f6e9ee] rounded-lg transition-colors"
//                               onClick={() => setHoveredCategory(null)}
//                             >
//                               <span>{getCategoryName(category)}</span>
//                               {subcategories[category._id]?.length > 0 && (
//                                 <FiChevronDown className="w-3 h-3" />
//                               )}
//                             </Link>
//                             {hoveredCategory === category._id &&
//                               subcategories[category._id]?.length > 0 && (
//                                 <div className="absolute left-full top-0 ml-1 w-56 bg-white shadow-2xl border border-gray-200 rounded-lg z-50">
//                                   <div className="p-3">
//                                     <h4 className="font-semibold text-sm text-gray-700 mb-2">
//                                       {getCategoryName(category)}
//                                     </h4>
//                                     <div className="space-y-1">
//                                       {subcategories[category._id].map(
//                                         (subcategory) => (
//                                           <Link
//                                             key={subcategory._id}
//                                             to={`/category/${category._id}/subcategory/${subcategory._id}`}
//                                             className="block py-1.5 px-3 text-xs text-gray-600 hover:text-[#0EA5E9] hover:bg-[#f6e9ee] rounded transition-colors"
//                                             onClick={() => setHoveredCategory(null)}
//                                           >
//                                             {getCategoryName(subcategory)}
//                                           </Link>
//                                         )
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>
//                               )}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div
//               className="relative category-item"
//               onMouseEnter={() => setHoveredCategory("all-categories")}
//               onMouseLeave={handleCategoryLeave}
//             >
//               <div className="flex items-center text-gray-700 font-medium hover:text-[#0EA5E9] transition-pointer select-none">
//                 <FiGrid className="w-4 h-4 mr-1" />
//                 Shop Categories
//                 <FiChevronDown
//                   className={`ml-1 w-4 h-4 transition-transform ${
//                     hoveredCategory === "all-categories" ? "rotate-180" : ""
//                   }`}
//                 />
//               </div>

//               {hoveredCategory === "all-categories" && (
//                 <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl border border-gray-200 rounded-lg z-50">
//                   <div className="p-4 max-h-80 overflow-y-auto">
//                     <h3 className="font-semibold text-gray-800 mb-3">
//                       All Categories
//                     </h3>
//                     <div className="space-y-2">
//                       {categories.map((category) => (
//                         <div
//                           key={category._id}
//                           className="relative category-subitem"
//                           onMouseEnter={() => handleCategoryHover(category._id)}
//                         >
//                           <Link
//                             to={`/category/${category._id}`}
//                             className="flex items-center justify-between py-2 px-3 text-sm text-gray-600 hover:text-[#0EA5E9] hover:bg-[#f6e9ee] rounded-lg transition-colors"
//                             onClick={() => setHoveredCategory(null)}
//                           >
//                             <span>{getCategoryName(category)}</span>
//                             {subcategories[category._id]?.length > 0 && (
//                               <FiChevronDown className="w-3 h-3" />
//                             )}
//                           </Link>
//                           {hoveredCategory === category._id &&
//                             subcategories[category._id]?.length > 0 && (
//                               <div className="absolute left-full top-0 ml-1 w-56 bg-white shadow-2xl border border-gray-200 rounded-lg z-50">
//                                 <div className="p-3">
//                                   <h4 className="font-semibold text-sm text-gray-700 mb-2">
//                                     {getCategoryName(category)}
//                                   </h4>
//                                   <div className="space-y-1">
//                                     {subcategories[category._id].map(
//                                       (subcategory) => (
//                                         <Link
//                                           key={subcategory._id}
//                                           to={`/category/${category._id}/subcategory/${subcategory._id}`}
//                                           className="block py-1.5 px-3 text-xs text-gray-600 hover:text-[#0EA5E9] hover:bg-[#f6e9ee] rounded transition-colors"
//                                           onClick={() => setHoveredCategory(null)}
//                                         >
//                                           {getCategoryName(subcategory)}
//                                         </Link>
//                                       )
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
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
//                   alt="Marotix"
//                   src={Logo}
//                   className="w-20 h-20 sm:w-16 sm:h-16"
//                 />
//               </Link>
//             </div>
//             <nav className="hidden lg:flex items-center space-x-6">
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
//               <Link
//                 to="/wishlist"
//                 className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
//                 aria-label="Wishlist"
//               >
//                 <FiHeart className="w-5 h-5 text-gray-800 hover:text-[#0EA5E9]" />
//                 {wishlistCount > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-[#FACC15] text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
//                     {wishlistCount > 9 ? "9+" : wishlistCount}
//                   </span>
//                 )}
//               </Link>
//               <Link
//                 to="/cart"
//                 className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
//                 aria-label="Cart"
//               >
//                 <FiShoppingBag className="w-5 h-5 text-gray-800 hover:text-[#0EA5E9]" />
//                 {cartCount > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-[#0EA5E9] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
//                     {cartCount > 9 ? "9+" : cartCount}
//                   </span>
//                 )}
//               </Link>
//               <div className="relative" ref={userDropdownRef}>
//                 <button
//                   onClick={handleUserClick}
//                   className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
//                 >
//                   <FiUser className="w-5 h-5 text-gray-800 hover:text-[#0EA5E9]" />
//                 </button>
//                 {isAuthenticated && showUserDropdown && (
//                   <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-2xl border border-gray-200 rounded-lg z-50">
//                     <div className="p-2">
//                       <div className="px-3 py-2 border-b border-gray-100">
//                         <p className="text-sm font-medium text-gray-800">
//                           Hello, {user?.name || user?.email || "User"}
//                         </p>
//                         <p className="text-xs text-gray-500">{user?.email}</p>
//                       </div>

//                       <Link
//                         to="/profile"
//                         onClick={() => setShowUserDropdown(false)}
//                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-1"
//                       >
//                         <FiUser className="w-4 h-4" />
//                         My Profile
//                       </Link>

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
//           <div className="lg:hidden mt-2">
//             <div className="flex items-center space-x-4 overflow-x-auto pb-2">
//               {navLinks.slice(0, 3).map((link, index) => {
//                 const Icon = link.icon;
//                 return (
//                   <Link
//                     key={index}
//                     to={link.path}
//                     className="flex items-center space-x-1 text-sm text-gray-600 hover:text-[#8F2B53] whitespace-nowrap"
//                   >
//                     <Icon className="w-3 h-3" />
//                     <span>{link.name}</span>
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
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
//                 <div className="p-4 bg-gradient-to-r from-[#f6e9ee] to-[#f8f0f3] border-b border-gray-200">
//                   {isAuthenticated ? (
//                     <div className="flex items-center space-x-3">
//                       <div className="w-12 h-12 bg-[#8F2B53] rounded-full flex items-center justify-center">
//                         <FiUser className="w-6 h-6 text-white" />
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
//                       <div className="w-12 h-12 bg-[#8F2B53] rounded-full flex items-center justify-center">
//                         <FiUser className="w-6 h-6 text-white" />
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
//                         className="flex-1 bg-[#8F2B53] text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-[#7a2450] transition-colors"
//                       >
//                         Login
//                       </button>
//                       <button
//                         onClick={() => {
//                           setIsRegisterModalOpen(true);
//                           setIsMenuOpen(false);
//                         }}
//                         className="flex-1 border border-[#8F2B53] text-[#8F2B53] text-center py-2 px-4 rounded-lg font-medium hover:bg-[#8F2B53] hover:text-white transition-colors"
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
//                         className="flex-1 bg-[#8F2B53] text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-[#7a2450] transition-colors"
//                       >
//                         My Orders
//                       </button>
//                       <button
//                         onClick={() => {
//                           handleLogout();
//                           setIsMenuOpen(false);
//                         }}
//                         className="flex-1 border border-[#8F2B53] text-[#8F2B53] text-center py-2 px-4 rounded-lg font-medium hover:bg-[#8F2B53] hover:text-white transition-colors"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//                 <div className="py-2">
//                   <div className="px-4 py-2">
//                     <h3 className="font-semibold text-gray-800 mb-2 px-2">
//                       Navigation
//                     </h3>
//                     <div className="space-y-1">
//                       {navLinks.map((link, index) => {
//                         const Icon = link.icon;
//                         return (
//                           <Link
//                             key={index}
//                             to={link.path}
//                             onClick={() => setIsMenuOpen(false)}
//                             className="flex items-center space-x-3 py-3 px-4 text-gray-600 hover:text-[#8F2B53] hover:bg-[#f6e9ee] rounded-lg transition-colors"
//                           >
//                             <Icon className="w-5 h-5" />
//                             <span className="font-medium">{link.name}</span>
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   </div>
//                   <div className="px-6 py-4 border-t border-gray-200">
//                     <h3 className="font-semibold text-gray-800 mb-3 text-lg">
//                       Product Categories
//                     </h3>

//                     {loading ? (
//                       <div className="space-y-2">
//                         {[...Array(5)].map((_, index) => (
//                           <div key={index} className="py-2 px-3">
//                             <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : error || categories.length === 0 ? (
//                       <div className="text-center py-4">
//                         <p className="text-gray-500 text-sm">
//                           {error ? "Failed to load categories" : "No categories available"}
//                         </p>
//                         <button
//                           onClick={fetchCategories}
//                           className="mt-2 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
//                         >
//                           Retry
//                         </button>
//                       </div>
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
//                               className="block py-3 px-3 text-gray-600 hover:text-[#8F2B53] hover:bg-[#f6e9ee] rounded-lg transition-colors font-medium"
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
//                                         className="block py-2 px-3 text-sm text-gray-500 hover:text-[#8F2B53] hover:bg-[#f6e9ee] rounded-lg transition-colors"
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

//                   <div className="px-6 py-4 border-t border-gray-200">
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