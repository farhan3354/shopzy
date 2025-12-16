import React from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaShoppingBag,
  FaHeart,
  FaShoppingCart,
  FaUser,
  FaHeadset,
} from "react-icons/fa";

export default function CustomerSidebar() {
  return (
    <div className="flex">
      <div
        className={`${
          open ? "w-64" : "w-20"
        } bg-white shadow-md min-h-screen p-5 pt-8 relative duration-300`}
      >
        <ul className="pt-6 space-y-4">
          <li>
            <Link
              to="/customer"
              className="flex items-center gap-3 p-2 hover:bg-blue-100 rounded-md text-gray-700"
            >
              <FaHome className="text-lg" />
              {open && "Dashboard"}
            </Link>
          </li>
          <li>
            <Link
              to="/customer/orders"
              className="flex items-center gap-3 p-2 hover:bg-blue-100 rounded-md text-gray-700"
            >
              <FaShoppingBag className="text-lg" />
              {open && "My Orders"}
            </Link>
          </li>

          {/* <li>
            <Link
              to="/customer/wishlist"
              className="flex items-center gap-3 p-2 hover:bg-blue-100 rounded-md text-gray-700"
            >
              <FaHeart className="text-lg" />
              {open && "Wishlist"}
            </Link>
          </li>
          <li>
            <Link
              to="/customer/cart"
              className="flex items-center gap-3 p-2 hover:bg-blue-100 rounded-md text-gray-700"
            >
              <FaShoppingCart className="text-lg" />
              {open && "Cart"}
            </Link>
          </li> */}
          <li>
            <Link
              to="/customer/profile"
              className="flex items-center gap-3 p-2 hover:bg-blue-100 rounded-md text-gray-700"
            >
              <FaUser className="text-lg" />
              {open && "Profile"}
            </Link>
          </li>

          <li>
            <Link
              to="/customer/support"
              className="flex items-center gap-3 p-2 hover:bg-blue-100 rounded-md text-gray-700"
            >
              <FaHeadset className="text-lg" />
              {open && "Support"}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
