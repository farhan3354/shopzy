import React from "react";
import Banner from "../components/homePage/Banner";
import FeatureProduct from "../components/homePage/FeatureProduct";
import FaqSection from "./../components/homePage/FaqSection";
import ShareAndEarn from "../components/homePage/ShareAndEarn";

export default function EcommerceHomepage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Banner />
        <FeatureProduct />
        <ShareAndEarn />
        <FaqSection />
      </main>
    </div>
  );
}

// {
//   /* <SpecialOffer /> */
// }
// {
//   /* <Services /> */
// }

// {
//   /* <section className="py-12 bg-indigo-700 text-white">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//             <h2 className="text-3xl font-bold mb-4">
//               Subscribe to Our Newsletter
//             </h2>
//             <p className="text-xl mb-8">
//               Get the latest updates on new products and upcoming sales
//             </p>
//             <div className="max-w-md mx-auto flex">
//               <input
//                 type="email"
//                 placeholder="Your email address"
//                 className="flex-1 px-4 py-3 rounded-l-md focus:outline-none text-gray-900"
//               />
//               <button className="bg-indigo-900 px-6 py-3 rounded-r-md font-medium hover:bg-indigo-800 transition-colors">
//                 Subscribe
//               </button>
//             </div>
//           </div>
//         </section> */
// }
