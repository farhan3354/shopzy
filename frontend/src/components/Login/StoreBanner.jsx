import React from "react";
import Header1 from "./Header1";

export default function StoreBanner() {
  return (
    <>
      <div className="bg-gradient-to-br from-purple-600 to-blue-500 text-white p-8 md:p-12 md:w-1/2 relative overflow-hidden min-h-screen">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/3 right-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"></div>

        <div className="absolute top-20 right-20 animate-float">
          <svg
            className="w-12 h-12 text-white/20"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>

        <div className="absolute bottom-32 left-16 animate-float-delayed">
          <svg
            className="w-8 h-8 text-white/30"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-13 4H6v-4h2v4z" />
          </svg>
        </div>

        <div className="z-10 relative">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            ShopEase
          </h2>

          <div className="mt-20 md:mt-32">
            <Header1
              label="Join Our Community"
              className="text-white font-bold text-4xl mb-6"
            />

            <p className="max-w-md text-lg leading-relaxed opacity-95 mb-8">
              Discover a world of products at your fingertips with our seamless
              shopping experience. From everyday essentials to unique finds, our
              platform brings you quality, convenience, and deals you'll love —
              all in one place.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-medium">
                  Free shipping on orders over $50
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-medium">Exclusive member discounts</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-medium">
                  Early access to sales & new arrivals
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-6 pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm opacity-80">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">5★</div>
                <div className="text-sm opacity-80">Rated Service</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm opacity-80">Support</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-2/3 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-700"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
