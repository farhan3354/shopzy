import React from "react";
import { useLocation } from "react-router-dom";
import Header1 from "./Header1";
import StoreBanner from "./StoreBanner";

export default function Bannerlogin() {
  const location = useLocation();

  return (
    <>
      {location.pathname === "/register/customer" && <StoreBanner />}

      {location.pathname === "/register/vendor" && <StoreBanner />}
      {location.pathname === "/login" && (
        <>
          <div className="bg-gradient-to-br from-purple-600 to-purple-400 text-white p-8 md:p-12 md:w-1/2 relative overflow-hidden rounded-lg shadow-lg">
            {/* Decorative Elements */}
            <div className="absolute top-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-16 right-10 w-24 h-24 bg-white opacity-20 rounded-full animate-pulse animation-delay-1000"></div>

            <div className="z-10 relative">
              <div className="mt-20 md:mt-32">
                {/* Header */}
                <h1 className="text-4xl font-extrabold mb-4 tracking-tight drop-shadow-md">
                  Sign in
                </h1>

                {/* Subtext */}
                <p className="max-w-md text-white opacity-90 text-lg leading-relaxed drop-shadow-sm">
                  Discover a world of products at your fingertips with our
                  seamless shopping experience. From everyday essentials to
                  unique finds, our platform brings you quality, convenience,
                  and deals you'll love — all in one place.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
