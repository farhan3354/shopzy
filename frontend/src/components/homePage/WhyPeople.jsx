import React, { useState } from "react";
import {
  FiStar,
  FiThumbsUp,
  FiAward,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiGlobe,
  FiHeart,
} from "react-icons/fi";
import { FaRegLaughBeam, FaRegGem } from "react-icons/fa";
import { HiOutlineCurrencyRupee } from "react-icons/hi";

const WhyLoveUs = () => {
  const loveReasons = [
    {
      icon: FiThumbsUp,
      title: "Exceptional Quality",
      description:
        "Every product undergoes rigorous quality checks to ensure you receive only the best.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      stats: "99.8% Satisfaction",
    },
    {
      icon: FiAward,
      title: "Trusted Service",
      description:
        "Recognized as one of India's most reliable e-commerce platforms.",
      color: "text-green-600",
      bgColor: "bg-green-50",
      stats: "Verified Seller",
    },
    {
      icon: FiTruck,
      title: "Express Delivery",
      description:
        "90% of our orders are delivered within 48-72 hours nationwide.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "Ultra Fast",
    },
    {
      icon: FiShield,
      title: "Secure Shopping",
      description:
        "State-of-the-art encryption ensures your data and payments are 100% safe.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      stats: "SSL Protected",
    },
  ];

  const trustMetrics = [
    { value: "4.8/5", label: "Market Rating", icon: FiStar },
    { value: "50k+", label: "Happy Shoppers", icon: FiThumbsUp },
    { value: "1500+", label: "Cities Covered", icon: FiGlobe },
    { value: "24/7", label: "Expert Support", icon: FiHeadphones },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6 bg-blue-50 px-4 py-2 rounded-2xl">
            <FiHeart className="w-5 h-5 text-blue-600 animate-pulse" />
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">
              The Marotix Experience
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Why Thousands <span className="text-blue-600">Trust Us</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            We don't just sell products; we deliver experiences backed by quality, speed, and unwavering security.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mb-20">
          {trustMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="bg-[#fafafa] rounded-[2rem] p-8 text-center border border-gray-50 hover:bg-white hover:shadow-2xl hover:shadow-gray-100 transition-all duration-500 group"
              >
                <div className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 group-hover:scale-110 transition-transform">
                  {metric.value}
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{metric.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loveReasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-blue-100 transition-all duration-500 overflow-hidden"
              >
                <div className="relative z-10">
                    <div className={`${reason.bgColor} ${reason.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">
                      {reason.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                      {reason.description}
                    </p>
                    <div className="inline-block px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {reason.stats}
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WhyLoveUs;

// import React, { useEffect, useState } from "react";
// import api from "../../../utils/api";

// export default function WhyPeople() {
//   const [banners, setBanners] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentSlide, setCurrentSlide] = useState(0);

//   useEffect(() => {
//     const fetchBanners = async () => {
//       try {
//         const res = await api.get("/banners");
//         const otherBanners = res.data.data.filter((b) => b.type === "other");
//         setBanners(otherBanners);
//       } catch (err) {
//         console.error("Error fetching banners:", err);
//         setError("Failed to load banners");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBanners();
//   }, []);

//   useEffect(() => {
//     if (banners.length <= 1) return;

//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % banners.length);
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [banners.length]);

//   if (loading)
//     return (
//       <div className="text-center py-10 text-gray-500">Loading banners...</div>
//     );

//   if (error)
//     return (
//       <div className="text-center py-10 text-red-600 font-medium">{error}</div>
//     );

//   if (banners.length === 0) return null;

//   return (
//     <div className="mt-8">
//       <p className="text-center text-gray-900 text-lg font-semibold mb-2">
//         Why People Love Us
//       </p>
// //       <div className="relative w-[70%] mx-auto mb-6">
//         <div className="border-t border-[#4A90E2]"></div>
//         <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#4A90E2] rotate-45"></div>
//       </div>
//       <div className="relative w-[90%] sm:w-[80%] lg:w-[70%] mx-auto overflow-hidden rounded-lg">
//         <div
//           className="flex transition-transform duration-700 ease-in-out"
//           style={{
//             transform: `translateX(calc(-${currentSlide * 70}%))`,
//           }}
//         >
//           {banners.map((item, index) => (
//             <div
//               key={index}
//               className="flex-shrink-0 w-[70%] sm:w-[65%] mx-2 relative"
//             >
//               <div className="w-full h-48 sm:h-64 md:h-72 lg:h-80 xl:h-96 rounded-lg overflow-hidden shadow-xl">
//                 <img
//                   src={item.image}
//                   alt={item.name}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div className="text-center mt-3">
//                 <p className="text-gray-900 font-semibold text-base">
//                   {item.name}
//                 </p>
//                 <p className="text-gray-600 text-sm">{item.description}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="flex justify-center items-center mt-6">
//         <img
//           alt="decorative"
//           src="https://assets.aramya.in/images/images/swirl-decorative-20-05-24.png"
//           width="100"
//           className="mx-auto"
//         />
//       </div>
//     </div>
//   );
// }
