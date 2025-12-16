import React from "react";
import {
  FiTruck,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";
export default function Services() {
  const services = [
    {
      icon: <FiTruck className="text-3xl text-indigo-600" />,
      title: "Free Shipping",
      description: "On orders over $50",
    },
    {
      icon: <FiShield className="text-3xl text-indigo-600" />,
      title: "Secure Payment",
      description: "100% secure payment",
    },
    {
      icon: <FiRefreshCw className="text-3xl text-indigo-600" />,
      title: "Easy Returns",
      description: "30 days return policy",
    },
  ];
  return (
    <>
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-lg shadow-sm"
              >
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
                  {service.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
