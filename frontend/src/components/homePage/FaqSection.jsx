import React, { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import api from "../../../utils/api";

export default function FaqSection() {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get(`/faqs`);
        if (res.data.success) setFaqs(res.data.faqs);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      }
    };
    fetchFaqs();
  }, []);

  return (
    <div className="mt-10 px-4 text-center mb-11">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
        Frequently Asked Questions
      </h2>
      <div className="relative w-[70%] mx-auto my-6">
        <div className="border-t border-[#4A90E2]"></div>
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#4A90E2] rotate-45"></div>
      </div>
      <div className="max-w-2xl mx-auto text-left">
        {faqs.map((faq, i) => (
          <div key={faq._id} className="border-b border-gray-200">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex justify-between items-center py-4 text-gray-900 font-medium text-sm sm:text-base hover:bg-gray-50 px-2 rounded-lg transition-colors"
            >
              <span className="text-left pr-4">{faq.question}</span>
              <FiChevronDown
                className={`text-gray-600 transform transition-transform duration-300 flex-shrink-0 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === i ? "max-h-[500px]" : "max-h-0"
              }`}
            >
              <div
                className="text-gray-600 text-sm pb-4 px-2 faq-content"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">❓</div>
            <p className="text-gray-500 text-sm">
              No FAQs available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
