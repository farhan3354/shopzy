import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function HeaderBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchHeaderBanners = async () => {
      try {
        setLoading(true);
        const res = await api.get("/banners");
        const headerBanners = res.data.data.filter((b) => b.type === "header");
        setBanners(headerBanners);
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError("Failed to load banners");
      } finally {
        setLoading(false);
      }
    };
    fetchHeaderBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="w-full h-80 md:h-96 lg:h-[500px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Loading banners...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-80 md:h-96 lg:h-[500px] bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <span className="text-red-600">{error}</span>
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div
      className="component-VerticalBannerSplide animate-fade-in splide vertical-banner-splide splide--slide splide--ltr splide--draggable splide--nav is-active is-overflow is-initialized relative group"
      id="component-VerticalBannerSplide"
    >
      <div
        className="splide__track splide__track--slide splide__track--ltr splide__track--draggable splide__track--nav relative overflow-hidden rounded-lg shadow-md"
        id="splide06-track"
        style={{ paddingLeft: "0px", paddingRight: "0px" }}
      >
        <ul
          className="splide__list flex transition-transform duration-500 ease-in-out"
          id="splide06-list"
          role="presentation"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <li
              key={banner._id}
              className="splide__slide vertical-banner-splide-slide d-flex align-items-center flex-shrink-0"
              style={{ width: "100%" }}
            >
              <div className="component-BannerImage animateFadeInForCLS w-full">
                <a
                  href={banner.link || "#"}
                  target={banner.link ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex justify-center">
                    <img
                      alt={banner.name}
                      src={banner.image}
                      className="mx-auto w-full h-80 md:h-96 lg:h-[500px] object-cover"
                      style={{ borderRadius: "0px" }}
                    />
                  </div>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 splide__arrow splide__arrow--prev"
            aria-label="Previous banner"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 splide__arrow splide__arrow--next"
            aria-label="Next banner"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <ul
            className="splide__pagination absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
            role="tablist"
            aria-label="Select a slide to show"
          >
            {banners.map((_, index) => (
              <li key={index} role="presentation">
                <button
                  onClick={() => goToSlide(index)}
                  className={`splide__pagination__page w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white" : "bg-white/50"
                  }`}
                  type="button"
                  role="tab"
                  aria-controls={`splide06-slide0${index + 1}`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-selected={index === currentSlide}
                  tabIndex={index === currentSlide ? "0" : "-1"}
                ></button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
