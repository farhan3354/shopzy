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
