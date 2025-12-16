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

  // Hero slides
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
      color: "from-[#BE386E] via-[#8F2B53] to-[#68012A]",
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

  // Features
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

  // Popular categories
  // const popularCategories = [
  //   {
  //     name: "Electronics",
  //     icon: "📱",
  //     count: "1,234 items",
  //     color: "bg-blue-100 text-blue-600",
  //   },
  //   {
  //     name: "Fashion",
  //     icon: "👗",
  //     count: "2,567 items",
  //     color: "bg-pink-100 text-pink-600",
  //   },
  //   {
  //     name: "Home & Living",
  //     icon: "🏠",
  //     count: "1,890 items",
  //     color: "bg-green-100 text-green-600",
  //   },
  //   {
  //     name: "Beauty",
  //     icon: "💄",
  //     count: "987 items",
  //     color: "bg-purple-100 text-purple-600",
  //   },
  //   {
  //     name: "Sports",
  //     icon: "⚽",
  //     count: "654 items",
  //     color: "bg-orange-100 text-orange-600",
  //   },
  //   {
  //     name: "Books",
  //     icon: "📚",
  //     count: "2,345 items",
  //     color: "bg-yellow-100 text-yellow-600",
  //   },
  // ];

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto slide hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Format timer
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
                    <span className="bg-gradient-to-r from-[#BE386E] to-[#8F2B53] bg-clip-text text-transparent">
                      {slide.subtitle}
                    </span>
                  </h2>
                  <p className="text-lg text-gray-200 mb-8 max-w-lg">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/product" className="group inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#8F2B53] to-[#BE386E] text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
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
          <div className="bg-gradient-to-r from-[#8F2B53] to-[#BE386E] rounded-xl shadow-2xl p-4 text-center">
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
      {/* <div className="max-w-7xl mx-auto px-4 mt-12 md:mt-16">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            🛍️ Popular Categories
          </h2>
          <p className="text-gray-600">
            Browse our most loved product categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularCategories.map((category, index) => (
            <Link
              key={index}
              to={`/category/${category.name
                .toLowerCase()
                .replace(/ & /g, "-")
                .replace(/ /g, "-")}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 p-6 text-center hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform`}
              >
                {category.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.count}</p>
              <div className="mt-3 h-1 w-8 bg-gray-200 rounded-full mx-auto group-hover:w-12 group-hover:bg-[#8F2B53] transition-all duration-300" />
            </Link>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default CategoryBanner;

// import React, { useState, useEffect } from "react";
// import api from "../../../utils/api";

// export default function CategoryBanner() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchLatestCategories = async () => {
//       try {
//         setLoading(true);
//         const response = await api.get("/categories/latest");
//         setCategories(response.data.categories || []);
//       } catch (err) {
//         console.error("Failed to fetch categories:", err);
//         setError("Failed to load categories");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLatestCategories();
//   }, []);

//   if (loading) {
//     return (
//       <div className="mb-2 px-3 mt-6">
//         <p className="text-center text-gray-900 text-lg font-normal">
//           <span className="text-2xl">Shop by category</span>
//         </p>
//         <div className="w-[70%] mx-auto my-4">
//           <div className="relative">
//             <div className="border-t border-[#9B3232]"></div>
//             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#9B3232] rotate-45"></div>
//           </div>
//         </div>
//         <div className="flex gap-1">
//           <div className="flex-1 min-w-0">
//             <div className="bg-gray-200 animate-pulse rounded-xl h-[500px] lg:h-[500px]"></div>
//           </div>
//           <div className="flex-1 min-w-0 flex flex-col gap-1">
//             <div className="bg-gray-200 animate-pulse rounded-xl h-[245px]"></div>
//             <div className="bg-gray-200 animate-pulse rounded-xl h-[245px]"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="mb-2 px-3 mt-6">
//         <p className="text-center text-gray-900 text-lg font-normal">
//           <span className="text-2xl">Shop by category</span>
//         </p>
//         <div className="text-center text-red-500 py-8">{error}</div>
//       </div>
//     );
//   }

//   if (categories.length === 0) {
//     return null;
//   }

//   const displayCategories = categories.slice(0, 3);

//   return (
//     <div className="mb-2 px-3 mt-6">
//       <p className="text-center text-gray-900 text-lg font-normal">
//         <span className="text-2xl">Shop by category</span>
//       </p>

//       <div className="w-[70%] mx-auto my-4">
//         <div className="relative">
//           <div className="border-t border-[#9B3232]"></div>
//           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#9B3232] rotate-45"></div>
//         </div>
//       </div>

//       <div className="flex gap-1">
//         <div className="flex-1 min-w-0">
//           <div className="m-0">
//             <a href={`/collections/${displayCategories[0]?.slug || "#"}`}>
//               <div className="flex justify-center h-full">
//                 <img
//                   alt={displayCategories[0]?.name || "Category"}
//                   src={displayCategories[0]?.image}
//                   className="mx-auto w-full h-auto lg:rounded-xl lg:h-[500px] object-cover hover:opacity-95 transition-opacity duration-300"
//                   loading="lazy"
//                 />
//               </div>
//             </a>
//           </div>
//         </div>
//         <div className="flex-1 min-w-0 flex flex-col gap-1">
//           {displayCategories[1] && (
//             <div className="m-0">
//               <a href={`/collections/${displayCategories[1]?.slug || "#"}`}>
//                 <div className="flex justify-center h-full">
//                   <img
//                     alt={displayCategories[1]?.name || "Category"}
//                     src={displayCategories[1]?.image}
//                     className="mx-auto w-full h-auto lg:rounded-xl lg:h-[245px] object-cover hover:opacity-95 transition-opacity duration-300"
//                     loading="lazy"
//                   />
//                 </div>
//               </a>
//             </div>
//           )}

//           {displayCategories[2] && (
//             <div className="m-0">
//               <a href={`/collections/${displayCategories[2]?.slug || "#"}`}>
//                 <div className="flex justify-center h-full">
//                   <img
//                     alt={displayCategories[2]?.name || "Category"}
//                     src={displayCategories[2]?.image}
//                     className="mx-auto w-full h-auto lg:rounded-xl lg:h-[245px] object-cover hover:opacity-95 transition-opacity duration-300"
//                     loading="lazy"
//                   />
//                 </div>
//               </a>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

{
  /* CTA Banner */
}
// <div className="max-w-7xl mx-auto px-4 mt-12 md:mt-16">
//   <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8F2B53] via-[#BE386E] to-[#8F2B53]">
//     {/* Animated background elements */}
//     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
//     <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48" />

//     <div className="relative z-10 p-8 md:p-12 text-center">
//       <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//         Subscribe & Get 20% OFF
//       </h2>
//       <p className="text-gray-200 mb-8 max-w-2xl mx-auto text-lg">
//         Subscribe to our newsletter and be the first to know about
//         exclusive deals, new arrivals, and special offers.
//       </p>
//       <div className="max-w-md mx-auto">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <input
//             type="email"
//             placeholder="Enter your email address"
//             className="flex-1 px-6 py-4 rounded-full focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-900"
//           />
//           <button className="px-8 py-4 bg-white text-[#8F2B53] rounded-full font-bold hover:bg-gray-100 transition-colors">
//             Subscribe Now
//           </button>
//         </div>
//         <p className="text-sm text-gray-300 mt-4">
//           By subscribing, you agree to our Privacy Policy and consent to
//           receive updates.
//         </p>
//       </div>
//     </div>
//   </div>
// </div>
