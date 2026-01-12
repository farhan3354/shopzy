import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiArrowRight,
  FiChevronRight,
  FiStar,
  FiTag,
  FiClock,
} from "react-icons/fi";
import { HiFire } from "react-icons/hi";

const CategoryBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timer, setTimer] = useState(86400);

  const heroSlides = [
    {
      id: 1,
      title: "Diwali Dhamaka Sale",
      subtitle: "Up to 70% OFF",
      description:
        "Light up your home with amazing deals on electronics, fashion, and home decor",
      image:
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      buttonText: "Shop Diwali Collection",
      color: "from-[#4A90E2] via-[#357ABD] to-[#2C3E50]",
      badge: "🔥 Limited Time",
    },
    {
      id: 2,
      title: "Smartphone Mania",
      subtitle: "Latest Flagship Phones",
      description:
        "Get the newest smartphones with amazing discounts & exchange offers",
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      buttonText: "Explore Mobiles",
      color: "from-[#2B5383] via-[#1E3A5F] to-[#0F1F38]",
      badge: "📱 New Launch",
    },
    {
      id: 3,
      title: "Home Makeover",
      subtitle: "Premium Home Decor",
      description:
        "Transform your living space with our exclusive home furniture & decor collection",
      image:
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      buttonText: "Shop Home Decor",
      color: "from-[#38A169] via-[#2F855A] to-[#276749]",
      badge: "🏡 Trending",
    },
  ];

  const features = [
    {
      icon: FiTruck,
      title: "Free Shipping",
      description: "On orders above ₹499",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      icon: FiShield,
      title: "Secure Payment",
      description: "100% safe & secure",
      color: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      icon: FiRefreshCw,
      title: "Easy Returns",
      description: "30-day return policy",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
    {
      icon: FiShoppingBag,
      title: "Quality Products",
      description: "Premium quality assurance",
      color: "bg-gradient-to-r from-pink-500 to-pink-600",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative">
      <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-b-3xl">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                    <HiFire className="w-4 h-4" />
                    {slide.badge}
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                    <span className="bg-gradient-to-r from-[#4A90E2] to-[#FFD166] bg-clip-text text-transparent">
                      {slide.subtitle}
                    </span>
                  </h2>
                  <p className="text-lg text-gray-200 mb-8 max-w-lg">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/product" className="group inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
                      {slide.buttonText}
                      <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/product"
                      className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
                    >
                      Shop All Products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <div className="absolute top-6 right-6 z-30 hidden lg:block">
          <div className="bg-gradient-to-r from-[#000000] to-[#2C3E50] rounded-xl shadow-2xl p-4 text-center">
            <div className="flex items-center gap-2 text-white mb-2">
              <FiClock className="w-4 h-4" />
              <span className="text-sm font-medium">Flash Sale Ends In</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {formatTime(timer)}
            </div>
            <div className="text-xs text-white/80 mt-1">HRS : MIN : SEC</div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 -mt-8 md:-mt-12 relative z-40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex items-center space-x-3 md:space-x-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
     
    </div>
  );
};

export default CategoryBanner;
