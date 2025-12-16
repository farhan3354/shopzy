import React from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../utils/api";

export default function OTPVerifyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email");

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/verify-otp", {
        email,
        otp: data.otp,
      });
      console.log(res);
      Swal.fire({
        title: "Verified!",
        text: "Your account is now active. Please login.",
        icon: "success",
        confirmButtonText: "OK",
      });

      navigate("/login");
    } catch (error) {
      Swal.fire({
        title: "Invalid OTP!",
        text: error.response?.data?.message || "Please try again.",
        icon: "error",
        confirmButtonText: "Retry",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-blue-500 mb-6">
          Verify OTP
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Enter the OTP sent to <span className="font-medium">{email}</span>
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input
            {...register("otp", { required: "OTP is required" })}
            type="text"
            placeholder="Enter OTP"
            className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.otp && (
            <p className="text-red-500 text-sm">{errors.otp.message}</p>
          )}

          <button
            type="submit"
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition duration-200"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
}
