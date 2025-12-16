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
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const loveReasons = [
    {
      icon: FiThumbsUp,
      title: "Exceptional Quality",
      description:
        "Every product undergoes rigorous quality checks to ensure you receive only the best.",
      color: "text-green-600",
      bgColor: "bg-green-100",
      stats: "99.8% Quality Satisfaction",
    },
    {
      icon: FiAward,
      title: "Award Winning Service",
      description:
        "Recognized as India's most trusted e-commerce platform for 3 consecutive years.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      stats: "3 Awards Won",
    },
    {
      icon: FiTruck,
      title: "Lightning Fast Delivery",
      description:
        "90% of orders delivered within 2-3 days across 1500+ cities in India.",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      stats: "2-3 Day Delivery",
    },
    {
      icon: FiShield,
      title: "100% Secure Shopping",
      description:
        "Bank-level encryption ensures your payments and data are completely safe.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      stats: "SSL Secured",
    },
    {
      icon: HiOutlineCurrencyRupee,
      title: "Best Price Guarantee",
      description:
        "We offer the best prices with regular discounts and price match promise.",
      color: "text-red-600",
      bgColor: "bg-red-100",
      stats: "Price Match Promise",
    },
    {
      icon: FiHeadphones,
      title: "24/7 Customer Support",
      description:
        "Our support team is available round the clock to assist you with any queries.",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      stats: "2 Min Response Time",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      location: "Mumbai",
      role: "Fashion Blogger",
      rating: 5,
      content:
        "I've shopped from many online stores, but ShopEase stands out for their exceptional customer service and quality products. The delivery is always on time!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      purchases: 24,
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      location: "Delhi",
      role: "Tech Enthusiast",
      rating: 5,
      content:
        "As a gadget lover, I appreciate their authentic products and competitive prices. Their 7-day replacement policy saved me twice!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
      purchases: 18,
    },
    {
      id: 3,
      name: "Meera Patel",
      location: "Ahmedabad",
      role: "Home Maker",
      rating: 5,
      content:
        "The home decor collection is amazing! Quality is premium and prices are reasonable. My entire home is decorated with ShopEase products.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
      purchases: 32,
    },
    {
      id: 4,
      name: "Aarav Singh",
      location: "Bangalore",
      role: "Software Engineer",
      rating: 5,
      content:
        "What I love most is the transparent pricing and no hidden charges. The app experience is smooth and intuitive.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
      purchases: 15,
    },
  ];

  const trustMetrics = [
    { value: "4.8/5", label: "Customer Rating", icon: FiStar },
    { value: "98%", label: "Recommend Us", icon: FiThumbsUp },
    { value: "1500+", label: "Cities Covered", icon: FiGlobe },
    { value: "24/7", label: "Support Available", icon: FiHeadphones },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <FiHeart className="w-6 h-6 text-[#BE386E] animate-pulse" />
            <span className="text-sm font-semibold text-[#8F2B53] uppercase tracking-wider">
              Why People Love Us
            </span>
            <FiHeart className="w-6 h-6 text-[#BE386E] animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Thousands of Happy Customers
            <span className="block text-3xl md:text-4xl text-[#8F2B53] mt-2">
              Trust Our Services Daily
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover why customers choose us over others and become part of our
            growing family of satisfied shoppers.
          </p>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {trustMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-3xl md:text-4xl font-bold text-[#8F2B53] mb-2">
                  {metric.value}
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{metric.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Reasons Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loveReasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-start gap-5">
                    <div
                      className={`${reason.bgColor} p-4 rounded-2xl group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`w-8 h-8 ${reason.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {reason.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{reason.description}</p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                        <span className="text-sm font-semibold text-gray-900">
                          {reason.stats}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
//       <div className="relative w-[70%] mx-auto mb-6">
//         <div className="border-t border-[#9B3232]"></div>
//         <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#9B3232] rotate-45"></div>
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
