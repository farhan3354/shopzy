import React from "react";
import {
  FiShoppingBag,
  FiPackage,
  FiUser,
  FiDollarSign,
  FiHeart,
} from "react-icons/fi";

export const LoadingSpinner = ({
  size = "large",
  message = "Loading...",
  subMessage = "Please wait",
  icon = "shopping",
  background = "gradient",
}) => {
  const sizeClasses = {
    small: "w-12 h-12 border-2",
    medium: "w-16 h-16 border-3",
    large: "w-20 h-20 border-4",
  };

  const iconSizes = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  const backgroundClasses = {
    gradient: "bg-gradient-to-br from-gray-50 to-gray-100",
    white: "bg-white",
    transparent: "bg-transparent",
  };

  const icons = {
    shopping: FiShoppingBag,
    package: FiPackage,
    user: FiUser,
    dollar: FiDollarSign,
    heart: FiHeart,
  };

  const IconComponent = icons[icon];

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 ${backgroundClasses[background]}`}
    >
      <div className="text-center">
        <div className="relative">
          <div
            className={`${sizeClasses[size]} border-red-300 border-t-red-800 rounded-full animate-spin mx-auto mb-6`}
          ></div>
          <IconComponent
            className={`${iconSizes[size]} text-red-800 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
          />
        </div>
        <p className="text-gray-600 text-lg font-medium mb-2">{message}</p>
        {subMessage && <p className="text-gray-400 text-sm">{subMessage}</p>}
      </div>
    </div>
  );
};

export const OrdersLoading = () => (
  <LoadingSpinner
    message="Loading your orders"
    subMessage="Please wait while we fetch your order history"
    icon="package"
  />
);

export const CartLoading = () => (
  <LoadingSpinner
    message="Loading your cart"
    subMessage="Getting your items ready"
    icon="shopping"
  />
);

export const WishlistLoading = () => (
  <LoadingSpinner
    message="Loading your wishlist"
    subMessage="Fetching your saved items"
    icon="heart"
  />
);

export const ProfileLoading = () => (
  <LoadingSpinner
    message="Loading your profile"
    subMessage="Getting your information"
    icon="user"
  />
);

export const PaymentsLoading = () => (
  <LoadingSpinner
    message="Loading payment information"
    subMessage="Processing your request"
    icon="dollar"
  />
);

export const ProductLoading = () => (
  <LoadingSpinner
    message="Loading product details"
    subMessage="Getting everything ready for you"
    icon="shopping"
  />
);

export const UsersLoading = ({ userType = "users" }) => (
  <LoadingSpinner
    message={`Loading ${userType.toLowerCase()}`}
    subMessage="Please wait while we fetch user data"
    icon="user"
  />
);

export const CategoryLoading = () => (
  <LoadingSpinner
    message="Loading categories"
    subMessage="Please wait while we fetch category data"
    icon="folder"
  />
);
