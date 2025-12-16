// import React, { useState, useEffect } from "react";
// import { FiChevronDown } from "react-icons/fi";
// import api from "../../../utils/api";

// export default function FaqSection() {
//   const [faqs, setFaqs] = useState([]);
//   const [openIndex, setOpenIndex] = useState(null);

//   useEffect(() => {
//     const fetchFaqs = async () => {
//       try {
//         const res = await api.get(`/faqs`);
//         if (res.data.success) setFaqs(res.data.faqs);
//       } catch (error) {
//         console.error("Error fetching FAQs:", error);
//       }
//     };
//     fetchFaqs();
//   }, []);

//   return (
//     <div className="mt-10 px-4 text-center mb-11">
//       <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
//         Frequently Asked Questions
//       </h2>
//       <div className="relative w-[70%] mx-auto my-6">
//         <div className="border-t border-[#9B3232]"></div>
//         <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#9B3232] rotate-45"></div>
//       </div>
//       <div className="max-w-2xl mx-auto text-left">
//         {faqs.map((faq, i) => (
//           <div key={faq._id} className="border-b border-gray-200">
//             <button
//               onClick={() => setOpenIndex(openIndex === i ? null : i)}
//               className="w-full flex justify-between items-center py-4 text-gray-900 font-medium text-sm sm:text-base hover:bg-gray-50 px-2 rounded-lg transition-colors"
//             >
//               <span className="text-left pr-4">{faq.question}</span>
//               <FiChevronDown
//                 className={`text-gray-600 transform transition-transform duration-300 flex-shrink-0 ${
//                   openIndex === i ? "rotate-180" : ""
//                 }`}
//               />
//             </button>

//             <div
//               className={`overflow-hidden transition-all duration-300 ${
//                 openIndex === i ? "max-h-[500px]" : "max-h-0"
//               }`}
//             >
//               <div
//                 className="text-gray-600 text-sm pb-4 px-2 faq-content"
//                 dangerouslySetInnerHTML={{ __html: faq.answer }}
//               />
//             </div>
//           </div>
//         ))}

//         {faqs.length === 0 && (
//           <div className="text-center py-8">
//             <div className="text-gray-400 text-4xl mb-3">❓</div>
//             <p className="text-gray-500 text-sm">
//               No FAQs available at the moment.
//             </p>
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         .faq-content {
//           font-size: 14px;
//           line-height: 1.6;
//         }

//         .faq-content h1,
//         .faq-content h2,
//         .faq-content h3,
//         .faq-content h4,
//         .faq-content h5,
//         .faq-content h6 {
//           font-weight: 600;
//           color: #111827;
//           margin: 1em 0 0.5em 0;
//         }

//         .faq-content h1 { font-size: 1.4em; }
//         .faq-content h2 { font-size: 1.3em; }
//         .faq-content h3 { font-size: 1.2em; }
//         .faq-content h4 { font-size: 1.1em; }
//         .faq-content h5,
//         .faq-content h6 { font-size: 1em; }

//         .faq-content p {
//           margin-bottom: 1em;
//         }

//         .faq-content ul,
//         .faq-content ol {
//           margin: 0.5em 0;
//           padding-left: 1.5em;
//         }

//         .faq-content li {
//           margin-bottom: 0.3em;
//         }

//         .faq-content blockquote {
//           border-left: 3px solid #9B3232;
//           background-color: #fdf2f2;
//           padding: 0.8em 1em;
//           margin: 1em 0;
//           border-radius: 0 4px 4px 0;
//         }

//         .faq-content code {
//           background-color: #f3f4f6;
//           padding: 0.1em 0.3em;
//           border-radius: 0.25em;
//           font-family: 'Courier New', monospace;
//           font-size: 0.9em;
//           color: #dc2626;
//         }

//         .faq-content pre {
//           background-color: #1f2937;
//           color: #f9fafb;
//           padding: 0.8em;
//           border-radius: 0.375em;
//           overflow-x: auto;
//           margin: 1em 0;
//           font-size: 0.85em;
//         }

//         .faq-content pre code {
//           background: none;
//           color: inherit;
//           padding: 0;
//         }

//         .faq-content a {
//           color: #9B3232;
//           text-decoration: underline;
//           font-weight: 500;
//         }

//         .faq-content a:hover {
//           color: #7a2828;
//         }

//         .faq-content strong,
//         .faq-content b {
//           font-weight: 600;
//           color: #111827;
//         }

//         .faq-content em,
//         .faq-content i {
//           font-style: italic;
//         }

//         .faq-content u {
//           text-decoration: underline;
//         }

//         .faq-content table {
//           width: 100%;
//           border-collapse: collapse;
//           margin: 1em 0;
//           font-size: 0.9em;
//         }

//         .faq-content th {
//           background-color: #f8fafc;
//           font-weight: 600;
//           text-align: left;
//         }

//         .faq-content th,
//         .faq-content td {
//           border: 1px solid #e5e7eb;
//           padding: 0.5em;
//         }

//         .faq-content tr:nth-child(even) {
//           background-color: #f9fafb;
//         }

//         .faq-content img {
//           max-width: 100%;
//           height: auto;
//           border-radius: 0.375em;
//           margin: 0.5em 0;
//         }

//         /* Custom bullet points for better visibility */
//         .faq-content ul li::before {
//           content: "•";
//           color: #9B3232;
//           font-weight: bold;
//           display: inline-block;
//           width: 1em;
//           margin-left: -1em;
//         }

//         .faq-content ol {
//           list-style-type: decimal;
//         }

//         .faq-content ol li::before {
//           color: #9B3232;
//           font-weight: bold;
//         }
//       `}</style>
//     </div>
//   );
// }

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
        <div className="border-t border-[#9B3232]"></div>
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#9B3232] rotate-45"></div>
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
