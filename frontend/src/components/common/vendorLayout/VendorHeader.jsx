import React, { useState } from "react";
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiExternalLink,
  FiLogOut,
} from "react-icons/fi";
import { logout } from "./../../../redux/authSlice/authSlice";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        navigate("/");
      }
    });
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="hidden md:block flex-1"></div>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#4A90E2] transition-colors"
              >
                <FiExternalLink className="w-4 h-4" />
                <span>View Website</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-200"></div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-1">
                  <span className="text-sm font-bold text-gray-900 leading-tight">
                    {user?.name || "Vendor"}
                  </span>
                  <span className="text-xs text-gray-500 font-medium capitalize">
                    {user?.userRole || "Vendor"}
                  </span>
                </div>
                <div className="w-10 h-10 bg-[#4A90E2]/10 rounded-full flex items-center justify-center text-[#4A90E2] border border-[#4A90E2]/20 shadow-sm">
                  <FiUser className="w-5 h-5" />
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                title="Logout"
              >
                <FiLogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-3">
               <Link
                to="/"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="View Website"
              >
                <FiExternalLink className="w-5 h-5" />
              </Link>
              <button
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <FiX className="h-6 w-6 text-[#4A90E2]" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-2xl absolute w-full animate-in slide-in-from-top-4 duration-200">
            <div className="px-4 py-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center text-white shadow-md">
                  <FiUser className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user?.name || "Vendor"}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{user?.userRole || "Vendor"}</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-bold shadow-lg shadow-gray-200"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}