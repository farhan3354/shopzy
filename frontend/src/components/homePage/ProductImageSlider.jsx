import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ProductImageSlider = ({ product }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = product?.images || ["/placeholder-image.jpg"];

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  const showArrows = images.length > 1;

  return (
    <div
      className="relative w-full bg-white overflow-hidden sm:h-80"
      style={{ aspectRatio: "3/4" }}
    >
      <img
        src={images[currentIndex]}
        alt={product?.name || "Product image"}
        className="w-full h-full object-contain"
        onError={(e) => (e.target.src = "/placeholder-image.jpg")}
      />

      {showArrows && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/10 hover:bg-black/20 p-2.5 rounded-none transition-all duration-200 backdrop-blur-sm border border-white/20"
          >
            <FiChevronLeft className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/10 hover:bg-black/20 p-2.5 rounded-none transition-all duration-200 backdrop-blur-sm border border-white/20"
          >
            <FiChevronRight className="w-4 h-4 text-white" />
          </button>
        </>
      )}

      {showArrows && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                currentIndex === idx ? "bg-white" : "bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageSlider;
