import React, { useState } from "react";
import { FiMenu, FiX, FiShoppingBag } from "react-icons/fi";
import { logout } from "./../../../redux/authSlice/authSlice";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "./../../../assets/logo.png";
export default function AdminHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="ShopNow Logo"
                className="h-8 sm:h-10 w-auto"
              />
            </div>

            {/* <div className="flex items-center gap-2">
              <FiShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">
                ShopNow
              </h1>
            </div> */}
          </div>
          <div className="hidden sm:flex items-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium cursor-pointer transition-colors duration-200"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center">
            <button
              className="p-2 text-gray-700 hover:text-indigo-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <FiX className="h-5 w-5" />
              ) : (
                <FiMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-3 py-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base font-medium cursor-pointer transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// import React, { useState } from "react";
// import {
//   FiSearch,
//   FiShoppingCart,
//   FiHeart,
//   FiUser,
//   FiMenu,
//   FiX,
// } from "react-icons/fi";
// import { logout } from "./../../../redux/authSlice/authSlice";
// import Swal from "sweetalert2";
// import { useDispatch } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";

// export default function AdminHeader() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You will be logged out of your account.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, Logout",
//       cancelButtonText: "Cancel",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         dispatch(logout());
//         navigate("/");
//       }
//     });
//   };

//   const navItems = [
//     { name: "Home", to: "/" },
//     { name: "Shop", to: "/shop" },
//     { name: "Contact", to: "#" },
//   ];

//   return (
//     <>
//       <header className="bg-white shadow-sm sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex-shrink-0 flex items-center">
//               <h1 className="text-2xl font-bold text-indigo-600">ShopNow</h1>
//             </div>

//             <nav className="hidden md:flex space-x-8">
//               {navItems.map((item) => (
//                 <Link
//                   key={item.name}
//                   to={item.to}
//                   className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
//                 >
//                   {item.name}
//                 </Link>
//               ))}
//             </nav>

//             <div className="flex items-center space-x-4">
//               <div className="hidden md:block relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FiSearch className="text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search products..."
//                   className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>

//               <button className="relative p-2 text-gray-700 hover:text-indigo-600">
//                 <FiShoppingCart className="h-6 w-6" />
//                 <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-indigo-600 text-xs text-white font-bold">
//                   3
//                 </span>
//               </button>

//               <button className="p-2 text-gray-700 hover:text-indigo-600">
//                 <FiHeart className="h-6 w-6" />
//               </button>

//               <button className="p-2 text-gray-700 hover:text-indigo-600">
//                 <FiUser className="h-6 w-6" />
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium cursor-pointer"
//               >
//                 Logout
//               </button>
//               <button
//                 className="md:hidden p-2 text-gray-700"
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               >
//                 {mobileMenuOpen ? (
//                   <FiX className="h-6 w-6" />
//                 ) : (
//                   <FiMenu className="h-6 w-6" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {mobileMenuOpen && (
//           <div className="md:hidden bg-white border-t border-gray-200">
//             <div className="px-2 pt-2 pb-3 space-y-1">
//               {navItems.map((item) => (
//                 <a
//                   key={item.name}
//                   href={item.href}
//                   className="text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium"
//                 >
//                   {item.name}
//                 </a>
//               ))}
//               <div className="px-3 py-2">
//                 <div className="relative mt-1">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FiSearch className="text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search products..."
//                     className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </header>
//     </>
//   );
// }
