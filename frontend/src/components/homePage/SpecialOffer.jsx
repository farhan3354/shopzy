import React from "react";

export default function SpecialOffer() {

    const specialOffers = [
    {
      title: "Summer Sale",
      subtitle: "Up to 50% off",
      description: "On selected items",
      image:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "Shop Now",
      bgColor: "bg-gradient-to-r from-orange-400 to-pink-500",
    },
    {
      title: "New Collection",
      subtitle: "Spring Arrivals",
      description: "Discover the latest trends",
      image:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      buttonText: "Explore",
      bgColor: "bg-gradient-to-r from-purple-400 to-indigo-500",
    },
  ];
  
  return (
    <>
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Special Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specialOffers.map((offer, index) => (
              <div
                key={index}
                className={`${offer.bgColor} rounded-xl overflow-hidden text-white relative h-64`}
              >
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-start p-8">
                  <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                  <p className="text-xl font-semibold mb-1">{offer.subtitle}</p>
                  <p className="mb-4">{offer.description}</p>
                  <button className="bg-white text-gray-900 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                    {offer.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
