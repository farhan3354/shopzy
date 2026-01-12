import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiTruck,
  FiShield,
  FiGift,
  FiStar,
  FiClock,
  FiShoppingBag,
} from "react-icons/fi";
import { HiFire, HiTag } from "react-icons/hi";

const ShareAndEarn = () => {
  const [timer, setTimer] = useState(86400); 
  const [stats, setStats] = useState({
    happyCustomers: 0,
    ordersDelivered: 0,
    productsSold: 0,
  });

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);

    const statsInterval = setTimeout(() => {
      setStats({
        happyCustomers: 12500,
        ordersDelivered: 32480,
        productsSold: 187500,
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(statsInterval);
    };
  }, []);

  const trustFeatures = [
    {
      icon: FiShield,
      title: "100% Secure",
      description: "SSL Encrypted Payments",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      icon: FiTruck,
      title: "Free Shipping",
      description: "On orders above ₹499",
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      icon: FiGift,
      title: "Easy Returns",
      description: "30-Day Return Policy",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      icon: FiClock,
      title: "24/7 Support",
      description: "Always Here to Help",
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
  ];

  const offers = [
    { id: 1, text: "Get 20% OFF on your first order", code: "WELCOME20" },
    { id: 2, text: "Extra 10% OFF on payments via UPI", code: "UPI10" },
    { id: 3, text: "Free shipping on orders above ₹999", code: "FREE999" },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="relative py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A90E2] via-[#357ABD] to-[#2C3E50] opacity-95"></div>

        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white mb-8">
              <HiFire className="w-5 h-5 animate-bounce" />
              <span className="font-semibold">LIMITED TIME OFFER</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Don't Miss Out On
              <span className="block text-yellow-300 drop-shadow-lg">
                Incredible Deals!
              </span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
              Shop now and enjoy exclusive discounts, free shipping, and premium
              quality products. Your perfect shopping experience starts here.
            </p>
            <div className="mb-12">
              <div className="inline-flex items-center gap-4 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                <FiClock className="w-6 h-6 text-white" />
                <span className="text-white font-medium">Offer ends in:</span>
              </div>
              <div className="flex justify-center gap-4 md:gap-6 mb-6">
                {formatTime(timer)
                  .split(":")
                  .map((time, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <span className="text-3xl md:text-4xl font-bold text-white font-mono">
                          {time}
                        </span>
                      </div>
                      <span className="text-white/80 text-sm mt-2 uppercase">
                        {["HOURS", "MINUTES", "SECONDS"][index]}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link
                to="/product"
                className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#4A90E2] rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <FiShoppingBag className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>Shop Now & Save Big</span>
              </Link>

              <Link
                to="/deals"
                className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white transition-all"
              >
                <HiTag className="w-6 h-6" />
                <span>View All Deals</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {trustFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div
                      className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h4 className="font-bold text-white mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-white/70 text-sm text-center">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl md:text-5xl font-bold text-[#4A90E2] mb-2">
                {stats.happyCustomers.toLocaleString()}+
              </div>
              <p className="text-gray-600 font-medium">Happy Customers</p>
              <div className="mt-3 h-1 w-20 bg-gradient-to-r from-[#4A90E2] to-[#357ABD] rounded-full mx-auto"></div>
            </div>

            <div className="text-center p-6">
              <div className="text-4xl md:text-5xl font-bold text-[#4A90E2] mb-2">
                {stats.ordersDelivered.toLocaleString()}+
              </div>
              <p className="text-gray-600 font-medium">Orders Delivered</p>
              <div className="mt-3 h-1 w-20 bg-gradient-to-r from-[#357ABD] to-[#4A90E2] rounded-full mx-auto"></div>
            </div>

            <div className="text-center p-6">
              <div className="text-4xl md:text-5xl font-bold text-[#4A90E2] mb-2">
                {stats.productsSold.toLocaleString()}+
              </div>
              <p className="text-gray-600 font-medium">Products Sold</p>
              <div className="mt-3 h-1 w-20 bg-gradient-to-r from-[#4A90E2] to-[#357ABD] rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E3F2FD] rounded-full mb-4">
              <HiFire className="w-5 h-5 text-[#4A90E2]" />
              <span className="font-semibold text-[#4A90E2]">
                SPECIAL OFFERS
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Exclusive Discounts Just For You
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Use these promo codes at checkout to unlock amazing savings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="group bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-[#4A90E2] hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#4A90E2] to-[#357ABD] rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiGift className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium mb-2">
                      {offer.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <span className="text-sm text-gray-600">Use code:</span>
                        <span className="font-bold text-[#4A90E2] ml-2">
                          {offer.code}
                        </span>
                      </div>
                      <button className="text-[#4A90E2] font-semibold hover:text-[#357ABD] transition-colors">
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-gradient-to-r from-[#4A90E2] to-[#357ABD] rounded-3xl p-8 md:p-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Shop Better with Our Mobile App
                </h3>
                <p className="text-white/90 mb-6">
                  Get exclusive app-only deals, faster checkout, and
                  personalized recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
                    <span className="text-2xl">📱</span>
                    <div className="text-left">
                      <div className="text-xs">GET IT ON</div>
                      <div className="font-bold">Google Play</div>
                    </div>
                  </button>
                  <button className="flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
                    <span className="text-2xl">📱</span>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="font-bold">App Store</div>
                    </div>
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="w-48 h-48 md:w-56 md:h-56 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🛍️</div>
                      <div className="font-bold text-[#4A90E2]">Marotix</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center animate-bounce">
                  <FiStar className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Shopping Experience?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Join thousands of satisfied customers who trust us for quality
              products, amazing deals, and exceptional service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/product"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all"
              >
                Start Shopping Now
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#4A90E2] text-[#4A90E2] rounded-full font-bold hover:bg-[#4A90E2] hover:text-white transition-all"
              >
                Create Free Account
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              No credit card required • 30-day money-back guarantee • 24/7
              customer support
            </p>
          </div>
        </div>
      </div>
    
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ShareAndEarn;
