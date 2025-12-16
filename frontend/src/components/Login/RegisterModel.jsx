import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiX, FiMail, FiHome, FiCheckCircle } from "react-icons/fi";
import api from "../../../utils/api";

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setRole("");
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    onClose();
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post(
        "/authregister",
        data
      );

      Swal.fire({
        title: "Registration Successful!",
        html: `
          <div class="text-center">
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
            <p class="text-gray-600 mb-4">
              We've sent a verification link to <strong>${data.email}</strong>
            </p>
            <p class="text-sm text-gray-500">
              Click the link in the email to activate your account.
            </p>
          </div>
        `,
        icon: "success",
        confirmButtonText: (
          `<div class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Go to Home
          </div>`
        ),
        confirmButtonColor: "#10B981",
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-4 py-2 rounded-lg'
        }
      }).then((result) => {
        handleClose();
        navigate("/");
      });

    } catch (error) {
      console.log("Registration error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";

      Swal.fire({
        title: "Registration Failed!",
        html: `
          <div class="text-center">
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
            <p class="text-gray-600">${errorMessage}</p>
          </div>
        `,
        icon: "error",
        confirmButtonText: "Try Again",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in-90 zoom-in-90"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 transition-colors duration-200"
        >
          <FiX size={24} />
        </button>

        <div className="bg-[#f4ebf5] p-6 rounded-t-lg">
          <div className="flex items-center justify-center space-x-8">
            <img
              src="https://d1nl4izteao6lk.cloudfront.net/uploads/1728464450402_splash-logo-web 2 (2).png"
              alt="Aramya Logo"
              className="h-12"
            />
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Create Account
            </h3>
            <p className="text-sm text-gray-600">
              Join Aramya and start your journey
            </p>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <FiMail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                After registration, check your email for a verification link to activate your account.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a *
              </label>
              <select
                {...register("userRole", { required: "Please select a role" })}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#68002a] focus:border-transparent transition-all duration-200"
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
              {errors.userRole && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.userRole.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                type="text"
                placeholder="Enter your full name"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#68002a] focus:border-transparent transition-all duration-200"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#68002a] focus:border-transparent transition-all duration-200"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10,11}$/,
                    message: "Please enter a valid phone number (10-11 digits)",
                  },
                })}
                type="tel"
                placeholder="Enter your phone number"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#68002a] focus:border-transparent transition-all duration-200"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                type="password"
                placeholder="Create a strong password"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#68002a] focus:border-transparent transition-all duration-200"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#68002a] text-white py-3 rounded-lg font-medium hover:bg-[#5a0024] disabled:bg-[#8c8c8c] transition-colors duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-sm text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <footer className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center mb-4">
              By creating an account, you agree to Aramya's{" "}
              <button className="text-[#68002a] hover:underline transition-colors duration-200">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-[#68002a] hover:underline transition-colors duration-200">
                Privacy Policy
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (typeof onSwitchToLogin === "function") {
                      onSwitchToLogin();
                    }
                  }}
                  className="text-[#68002a] hover:text-[#5a0024] font-semibold transition-colors duration-200"
                >
                  Sign In
                </button>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
