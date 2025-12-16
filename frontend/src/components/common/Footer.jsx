import React from "react";
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiLinkedin,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiShield,
  FiHelpCircle,
  FiMessageSquare,
  FiDownload,
  FiSmartphone,
  FiArrowUp,
  FiHeart,
} from "react-icons/fi";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const socialLinks = [
    {
      icon: FiFacebook,
      name: "Facebook",
      url: "#",
      color: "hover:bg-blue-600",
    },
    {
      icon: FiInstagram,
      name: "Instagram",
      url: "#",
      color: "hover:bg-pink-600",
    },
    { icon: FiTwitter, name: "Twitter", url: "#", color: "hover:bg-blue-400" },
    { icon: FiYoutube, name: "YouTube", url: "#", color: "hover:bg-red-600" },
    {
      icon: FiLinkedin,
      name: "LinkedIn",
      url: "#",
      color: "hover:bg-blue-700",
    },
  ];

  const quickLinks = [
    {
      title: "Shop",
      links: [
        { name: "All Products", url: "/products" },
        { name: "New Arrivals", url: "/products?filter=new" },
        { name: "Best Sellers", url: "/products?filter=bestsellers" },
        { name: "Flash Deals", url: "/deals" },
      ],
    },
    {
      title: "Categories",
      links: [
        { name: "Electronics", url: "/category/electronics" },
        { name: "Fashion", url: "/category/fashion" },
        { name: "Home & Living", url: "/category/home-living" },
        { name: "Beauty & Care", url: "/category/beauty" },
      ],
    },
    {
      title: "Customer Service",
      links: [
        { name: "Contact Us", url: "/contact" },
        { name: "FAQ", url: "/faq" },
        { name: "Shipping Policy", url: "/shipping" },
        { name: "Return Policy", url: "/returns" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", url: "/about" },
        { name: "Careers", url: "/careers" },
        { name: "Blog", url: "/blog" },
        { name: "Store Locator", url: "/stores" },
      ],
    },
  ];

  const features = [
    { icon: FiTruck, text: "Free Shipping", subtext: "On orders over ₹999" },
    { icon: FiShield, text: "Secure Payment", subtext: "100% secure" },
    { icon: FiCreditCard, text: "Easy Returns", subtext: "30-day policy" },
    {
      icon: FiHelpCircle,
      text: "24/7 Support",
      subtext: "Always here to help",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <button
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 z-50 md:hidden w-12 h-12 bg-gradient-to-r from-[#BE386E] to-[#8F2B53] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Scroll to top"
      >
        <FiArrowUp className="w-5 h-5" />
      </button>
      <div className="lg:hidden bg-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 gap-4">
            {features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <feature.icon className="w-5 h-5 text-[#BE386E]" />
                <div>
                  <p className="text-sm font-medium">{feature.text}</p>
                  <p className="text-xs text-gray-400">{feature.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 pb-8 border-b border-gray-800">
          <div className="flex-1 max-w-md">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#BE386E] to-[#8F2B53] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#BE386E] to-[#8F2B53] bg-clip-text text-transparent">
                Shopzy
              </span>
            </Link>

            <p className="text-gray-400 text-sm sm:text-base mb-6">
              Your trusted online shopping destination. We bring you the best
              products with quality assurance and excellent customer service.
            </p>

            <div>
              <h4 className="font-bold text-white mb-3 sm:mb-4">Follow Us</h4>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      className={`w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-white ${social.color} transition-colors`}
                      aria-label={social.name}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex-1 lg:flex-grow lg:pl-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {quickLinks.map((section, index) => (
                <div key={index}>
                  <h3 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">
                    {section.title}
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          to={link.url}
                          className="text-gray-400 hover:text-[#BE386E] transition-colors text-xs sm:text-sm"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="py-8 border-b border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#8F2B53] to-[#BE386E] rounded-lg flex items-center justify-center flex-shrink-0">
                <FiPhone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1 sm:mb-2 text-sm sm:text-base">
                  Call Us
                </h4>
                <a
                  href="tel:+911800123456"
                  className="text-gray-400 hover:text-[#BE386E] text-sm sm:text-lg block"
                >
                  +91 1800 123 456
                </a>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Mon-Sat: 9AM - 10PM IST
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#8F2B53] to-[#BE386E] rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1 sm:mb-2 text-sm sm:text-base">
                  Email Us
                </h4>
                <a
                  href="mailto:support@shopease.com"
                  className="text-gray-400 hover:text-[#BE386E] text-sm sm:text-base block break-words"
                >
                  support@shopease.com
                </a>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  24/7 Customer Support
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#8F2B53] to-[#BE386E] rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1 sm:mb-2 text-sm sm:text-base">
                  Visit Us
                </h4>
                <p className="text-gray-400 text-sm sm:text-base">
                  123 Business Street,
                  <br className="hidden sm:block" />
                  Maharashtra 400001
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-800">
            <div className="text-gray-500 text-sm">
              <p>
                &copy; {new Date().getFullYear()} Shopzy. All rights reserved.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white">
                Cookie Policy
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-white">
                Sitemap
              </Link>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <FiHeart className="w-4 h-4 text-[#BE386E] mr-1" />
              Made with love in UAE
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={scrollToTop}
        className="hidden lg:fixed lg:flex bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-[#BE386E] to-[#8F2B53] rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Scroll to top"
      >
        <FiArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
};

export default Footer;

// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import api from "../../../utils/api";

// const Footer = () => {
//   const [footerData, setFooterData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [openSections, setOpenSections] = useState({
//     about: false,
//     moreInfo: false,
//     contact: false,
//   });

//   useEffect(() => {
//     fetchFooterData();
//   }, []);

//   const fetchFooterData = async () => {
//     try {
//       const response = await api.get("/footer/get");
//       if (response.data.success) {
//         setFooterData(response.data.footer);
//       }
//     } catch (error) {
//       console.error("Error fetching footer:", error);
//       setFooterData(getDefaultFooterData());
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleSection = (section) => {
//     setOpenSections((prev) => ({
//       ...prev,
//       [section]: !prev[section],
//     }));
//   };

//   const getSocialIcon = (iconName) => {
//     const icons = {
//       facebook: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           fill="currentColor"
//           viewBox="0 0 24 24"
//           className="w-5 h-5"
//         >
//           <path d="M12.001 2c-5.523 0-10 4.477-10 10 0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.344 21.129 22 16.992 22 12c0-5.523-4.477-10-10-10" />
//         </svg>
//       ),
//       instagram: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           fill="currentColor"
//           viewBox="0 0 24 24"
//           className="w-5 h-5"
//         >
//           <path d="M13.028 2c1.125.003 1.696.009 2.189.023l.194.007c.224.008.445.018.712.03 1.064.05 1.79.218 2.427.465.66.254 1.216.598 1.772 1.153a4.9 4.9 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.012.266.022.487.03.712l.006.194c.015.492.021 1.063.023 2.188l.001.746v1.31a79 79 0 0 1-.023 2.188l-.006.194c-.008.225-.018.446-.03.712-.05 1.065-.22 1.79-.466 2.428a4.9 4.9 0 0 1-1.153 1.772 4.9 4.9 0 0 1-1.772 1.153c-.637.247-1.363.415-2.427.465l-.712.03-.194.006c-.493.014-1.064.021-2.189.023l-.746.001h-1.309a78 78 0 0 1-2.189-.023l-.194-.006a63 63 0 0 1-.712-.031c-1.064-.05-1.79-.218-2.428-.465a4.9 4.9 0 0 1-1.771-1.153 4.9 4.9 0 0 1-1.154-1.772c-.247-.637-.415-1.363-.465-2.428l-.03-.712-.005-.194A79 79 0 0 1 2 13.028v-2.056a79 79 0 0 1 .022-2.188l.007-.194c.008-.225.018-.446.03-.712.05-1.065.218-1.79.465-2.428A4.9 4.9 0 0 1 3.68 3.678a4.9 4.9 0 0 1 1.77-1.153c.638-.247 1.363-.415 2.428-.465.266-.012.488-.022.712-.03l.194-.006a79 79 0 0 1 2.188-.023zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0 2a3 3 0 1 1 .001 6 3 3 0 0 1 0-6m5.25-3.5a1.25 1.25 0 0 0 0 2.5 1.25 1.25 0 0 0 0-2.5" />
//         </svg>
//       ),
//       youtube: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           fill="currentColor"
//           viewBox="0 0 24 24"
//           className="w-5 h-5"
//         >
//           <path d="M12.244 4c.534.003 1.87.016 3.29.073l.504.022c1.429.067 2.857.183 3.566.38.945.266 1.687 1.04 1.938 2.022.4 1.56.45 4.602.456 5.339l.001.152v.174c-.007.737-.057 3.78-.457 5.339-.254.985-.997 1.76-1.938 2.022-.709.197-2.137.313-3.566.38l-.504.023c-1.42.056-2.756.07-3.29.072l-.235.001h-.255c-1.13-.007-5.856-.058-7.36-.476-.944-.266-1.687-1.04-1.938-2.022-.4-1.56-.45-4.602-.456-5.339v-.326c.006-.737.056-3.78.456-5.339.254-.985.997-1.76 1.939-2.021 1.503-.419 6.23-.47 7.36-.476zM9.999 8.5v7l6-3.5z" />
//         </svg>
//       ),
//       pinterest: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           width="24"
//           height="24"
//           fill="none"
//           className="w-5 h-5"
//         >
//           <path
//             fill="currentColor"
//             d="M12.095 1C7.55 1 3.067 3.88 3.067 8.528c0 2.954 1.752 4.648 2.81 4.648.441 0 .694-1.154.694-1.484 0-.39-1.042-1.23-1.042-2.85 0-3.388 2.715-5.773 6.22-5.773 3.014 0 5.24 1.635 5.24 4.619 0 2.234-.947 6.418-3.994 6.418-1.105 0-2.052-.75-2.052-1.844 0-1.59 1.168-3.134 1.168-4.769 0-2.79-4.151-2.28-4.151 1.08 0 .704.095 1.484.426 2.13-.616 2.503-1.863 6.222-1.863 8.801 0 .795.127 1.575.206 2.37.158.165.079.15.3.06 2.225-2.91 2.146-3.464 3.156-7.273.553.99 1.958 1.514 3.063 1.514 4.704 0 6.819-4.348 6.819-8.277C20.067 3.714 16.263 1 12.095 1"
//           />
//         </svg>
//       ),
//     };

//     return icons[iconName] || null;
//   };

//   const ChevronIcon = ({ isOpen }) => (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="currentColor"
//       viewBox="0 0 24 24"
//       className={`w-5 h-5 transition-transform duration-300 ${
//         isOpen ? "rotate-180" : ""
//       }`}
//     >
//       <path d="m12 10.828-4.95 4.95-1.414-1.414L12 8l6.364 6.364-1.415 1.414z" />
//     </svg>
//   );

//   if (loading) {
//     return (
//       <footer className="bg-[#EDDFDA] text-[#8F2B53] mt-12">
//         <div className="max-w-7xl mx-auto px-6 py-8 text-center">
//           Loading footer...
//         </div>
//       </footer>
//     );
//   }

//   if (!footerData) {
//     return (
//       <footer className="bg-[#EDDFDA] text-[#8F2B53] mt-12">
//         <div className="max-w-7xl mx-auto px-6 py-8 text-center">
//           Footer not available
//         </div>
//       </footer>
//     );
//   }

//   return (
//     <footer className="bg-[#EDDFDA] text-[#8F2B53] mt-12">
//       <div className="hidden lg:block max-w-7xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold mb-4">
//               {footerData.about.title}
//             </h3>
//             <p className="text-sm leading-relaxed whitespace-pre-line">
//               {footerData.about.content}
//             </p>
//           </div>
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold mb-4">
//               {footerData.moreInfo.title}
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col gap-2">
//                 {footerData.moreInfo.links[0]?.column1?.map((link, index) => (
//                   <Link
//                     key={index}
//                     to={link.href || "#"}
//                     className="text-sm hover:underline transition-colors hover:text-[#68002A]"
//                   >
//                     {link.text}
//                   </Link>
//                 ))}
//               </div>
//               <div className="flex flex-col gap-2">
//                 {footerData.moreInfo.links[0]?.column2?.map((link, index) => (
//                   <Link
//                     key={index}
//                     to={link.href || "#"}
//                     className="text-sm hover:underline transition-colors hover:text-[#68002A]"
//                   >
//                     {link.text}
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           </div>
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold mb-4">
//               {footerData.contact.title}
//             </h3>
//             <Link
//               to={footerData.contact.content.help.href || "#"}
//               className="text-sm hover:underline transition-colors hover:text-[#68002A] block mb-3"
//             >
//               {footerData.contact.content.help.text}
//             </Link>
//             <p className="text-sm text-gray-600 mb-2">
//               {footerData.contact.content.company}
//             </p>
//             <p className="text-sm whitespace-pre-line leading-relaxed">
//               {footerData.contact.content.address}
//             </p>
//           </div>
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold mb-4">
//               {footerData.social.title}
//             </h3>
//             <div className="component-MyDivider with-cube w-[70%] my-4">
//               <div className="outer-cube border-t border-[#68002A] relative">
//                 <div className="inner-cube absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#68002A] rotate-45"></div>
//               </div>
//             </div>
//             <div className="flex items-center gap-5">
//               {footerData.social.platforms?.map((platform, index) => (
//                 <a
//                   key={index}
//                   href={platform.href || "#"}
//                   className="text-[#D9BAAD] hover:text-[#8F2B53] transition-colors cursor-pointer"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <span className="w-5 h-5 block">
//                     {getSocialIcon(platform.icon)}
//                   </span>
//                 </a>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="lg:hidden">
//         <div className="p-4 flex flex-col gap-4">
//           <div>
//             <button
//               onClick={() => toggleSection("about")}
//               className="w-full flex justify-between items-center p-3 hover:bg-[#e8d5ce] rounded-lg transition-colors"
//             >
//               <span className="text-base font-medium">
//                 {footerData.about.title}
//               </span>
//               <ChevronIcon isOpen={openSections.about} />
//             </button>
//             {openSections.about && (
//               <div className="mt-2 px-3">
//                 <p className="text-sm leading-relaxed whitespace-pre-line">
//                   {footerData.about.content}
//                 </p>
//               </div>
//             )}
//           </div>
//           <div>
//             <button
//               onClick={() => toggleSection("moreInfo")}
//               className="w-full flex justify-between items-center p-3 hover:bg-[#e8d5ce] rounded-lg transition-colors"
//             >
//               <span className="text-base font-medium">
//                 {footerData.moreInfo.title}
//               </span>
//               <ChevronIcon isOpen={openSections.moreInfo} />
//             </button>
//             {openSections.moreInfo && (
//               <div className="mt-2 px-3">
//                 <div className="flex gap-8">
//                   <div className="flex flex-col gap-2">
//                     {footerData.moreInfo.links[0]?.column1?.map(
//                       (link, index) => (
//                         <Link
//                           key={index}
//                           to={link.href || "#"}
//                           className="text-sm hover:underline transition-colors"
//                           onClick={() => setOpenSections({})}
//                         >
//                           {link.text}
//                         </Link>
//                       )
//                     )}
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     {footerData.moreInfo.links[0]?.column2?.map(
//                       (link, index) => (
//                         <Link
//                           key={index}
//                           to={link.href || "#"}
//                           className="text-sm hover:underline transition-colors"
//                           onClick={() => setOpenSections({})}
//                         >
//                           {link.text}
//                         </Link>
//                       )
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//           <div>
//             <button
//               onClick={() => toggleSection("contact")}
//               className="w-full flex justify-between items-center p-3 hover:bg-[#e8d5ce] rounded-lg transition-colors"
//             >
//               <span className="text-base font-medium">
//                 {footerData.contact.title}
//               </span>
//               <ChevronIcon isOpen={openSections.contact} />
//             </button>
//             {openSections.contact && (
//               <div className="mt-2 px-3">
//                 <Link
//                   to={footerData.contact.content.help.href || "#"}
//                   className="text-sm flex items-center gap-1 hover:underline transition-colors mb-2"
//                   onClick={() => setOpenSections({})}
//                 >
//                   {footerData.contact.content.help.text}
//                 </Link>
//                 <p className="text-sm text-gray-600 mb-2">
//                   {footerData.contact.content.company}
//                 </p>
//                 <p className="text-sm whitespace-pre-line">
//                   {footerData.contact.content.address}
//                 </p>
//               </div>
//             )}
//           </div>
//           <div className="p-3">
//             <p className="text-base font-medium text-center mb-4">
//               {footerData.social.title}
//             </p>
//             <div className="component-MyDivider with-cube w-[70%] mx-auto my-4">
//               <div className="outer-cube border-t border-[#68002A] relative">
//                 <div className="inner-cube absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#68002A] rotate-45"></div>
//               </div>
//             </div>
//             <div className="flex items-center justify-center gap-5">
//               {footerData.social.platforms?.map((platform, index) => (
//                 <a
//                   key={index}
//                   href={platform.href || "#"}
//                   className="text-[#D9BAAD] hover:text-[#8F2B53] transition-colors cursor-pointer"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <span className="w-5 h-5 block">
//                     {getSocialIcon(platform.icon)}
//                   </span>
//                 </a>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="mt-6">
//         {footerData.decorative?.image && (
//           <div className="w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
//             <Link to="/">
//               <img
//                 alt={footerData.decorative.alt}
//                 src={footerData.decorative.image}
//                 className="w-full h-auto max-h-32 md:max-h-40 lg:max-h-48"
//               />
//             </Link>
//           </div>
//         )}
//         <div className="text-center py-4 text-sm text-gray-600 bg-white">
//           {import.meta.env.VITE_COPY_WRITE}
//         </div>
//       </div>
//     </footer>
//   );
// };

// // Default footer data in case API fails
// const getDefaultFooterData = () => ({
//   about: {
//     title: "About Us",
//     content:
//       "At Aramya, comfort meets fashion with stylish and breathable kurtas, kurta sets, and dresses crafted for all-day comfort. Plus, you can choose different sizes for tops and bottoms, so can always find the right fit.",
//   },
//   moreInfo: {
//     title: "More info",
//     links: [
//       {
//         column1: [
//           { text: "Terms of Service", href: "/terms" },
//           { text: "Privacy Policy", href: "/privacy" },
//           { text: "Return Policy", href: "/return" },
//           { text: "Shipping Policy", href: "/shipping" },
//           { text: "Store Locator", href: "/stores" },
//         ],
//         column2: [
//           { text: "Sitemap", href: "/pages/sitemap" },
//           { text: "Products Sitemap", href: "/pages/products-sitemap" },
//           { text: "Size Chart", href: "/pages/kurti-size-chart" },
//           { text: "Blogs", href: "/pages/blogs" },
//         ],
//       },
//     ],
//   },
//   contact: {
//     title: "Contact us",
//     content: {
//       help: { text: "Need Help?", href: "/contact-us" },
//       company: "Manufactured and Marketed by",
//       address:
//         "DSLR Technologies Pvt. Ltd.\nPhase 3, 994-995, near to Vitromed, Sitapura Industrial Area, Sitapura, Jaipur, Rajasthan 302022",
//     },
//   },
//   social: {
//     title: "Follow us on",
//     platforms: [
//       {
//         name: "Facebook",
//         icon: "facebook",
//         href: "#",
//       },
//       {
//         name: "Instagram",
//         icon: "instagram",
//         href: "#",
//       },
//       {
//         name: "YouTube",
//         icon: "youtube",
//         href: "#",
//       },
//       {
//         name: "Pinterest",
//         icon: "pinterest",
//         href: "#",
//       },
//     ],
//   },
//   decorative: {
//     image: "https://assets.aramya.in/images/images/home-footer-decorative.png",
//     alt: "Aramya",
//   },
// });

// export default Footer;
