import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiMail, FiArrowLeft } from "react-icons/fi";
import api from "../../../utils/api";

const VerifyAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    verifyAccount();
  }, [token]);

  const verifyAccount = async () => {
    try {
      setStatus("verifying");
      setMessage("Verifying your account...");

      const response = await api.get(`/verify-account/${token}`
      );

      if (response.data.success) {
        setStatus("success");
        setMessage(response.data.message || "Account verified successfully!");

        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      setStatus("error");
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Verification failed. Please try again.");
      }
      console.error("Verification error:", error);
    }
  };

  const handleResendVerification = async () => {
    navigate("/resend-verification");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === "verifying" && (
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <FiMail className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
            )}

            {status === "success" && (
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <FiCheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}

            {status === "error" && (
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <FiXCircle className="h-8 w-8 text-red-600" />
              </div>
            )}

            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {status === "verifying" && "Verifying Account"}
              {status === "success" && "Account Verified!"}
              {status === "error" && "Verification Failed"}
            </h2>
          </div>
          <div className="mt-8 text-center">
            {status === "verifying" && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Please wait while we verify your account...
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </div>
            )}

            {status === "success" && (
              <div>
                <p className="text-sm text-green-600 mb-6">{message}</p>
                <p className="text-sm text-gray-600 mb-6">
                  You will be redirected to the login page shortly.
                </p>
                <div className="space-y-4">
                  <Link
                    to="/login"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            )}

            {status === "error" && (
              <div>
                <p className="text-sm text-red-600 mb-6">{message}</p>
                <div className="space-y-4">
                  <button
                    onClick={handleResendVerification}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Resend Verification Email
                  </button>
                  <Link
                    to="/register"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Register Again
                  </Link>
                  <Link
                    to="/"
                    className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <FiArrowLeft className="mr-2" />
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
