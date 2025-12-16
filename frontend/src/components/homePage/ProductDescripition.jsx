import React, { useState } from "react";

const ProductDescription = ({ description }) => {
  const [openSections, setOpenSections] = useState({
    returns: false,
    washCare: false,
    productDescription: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Function to check if description has actual content
  const hasDescriptionContent = () => {
    if (!description) return false;
    
    // Remove HTML tags and check if there's actual text content
    const textContent = description.replace(/<[^>]*>/g, "").trim();
    return textContent.length > 0;
  };

  return (
    <div
      className="component-PdpAccordions bg-white"
      id="component-PdpAccordions"
    >
      {/* === RETURNS SECTION === */}
      <div>
        <button
          onClick={() => toggleSection("returns")}
          className="w-full text-left py-4 px-0 focus:outline-none transition duration-200 hover:bg-gray-50 border-none bg-transparent"
          type="button"
        >
          <div className="flex justify-between items-center gap-2 px-4">
            <div className="flex items-center gap-2">
              <img
                src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_Stroke.svg?v=1751279639"
                width={16}
                alt="Returns Icon"
              />
              <p className="text-base font-normal text-gray-900">
                Return & Refunds
              </p>
            </div>
            <img
              src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_f744aa51-d82d-4894-acef-fd345562b279.svg?v=1751278825"
              width={12}
              alt="Arrow Icon"
              className={`transform transition-transform duration-300 ${
                openSections.returns ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {openSections.returns && (
          <div className="transition-all duration-300 ease-in-out px-4 pb-4">
            <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
              <li>Free returns offered on all items.</li>
              <li>Items can be returned within 14 days of delivery.</li>
              <li>
                Return requests can be raised from the "My Orders" section on
                the website.
              </li>
              <li>
                Returns are picked up within 5–7 days from the requested date.
              </li>
              <li>
                Refund is processed within 1–2 days after the return pickup.
              </li>
            </ul>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* === WASH CARE SECTION === */}
      <div>
        <button
          onClick={() => toggleSection("washCare")}
          className="w-full text-left py-4 px-0 focus:outline-none transition duration-200 hover:bg-gray-50 border-none bg-transparent"
          type="button"
        >
          <div className="flex justify-between items-center gap-2 px-4">
            <div className="flex items-center gap-2">
              <img
                src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_856_Stroke.svg?v=1751279644"
                width={16}
                alt="Wash Care Icon"
              />
              <p className="text-base font-normal text-gray-900">Wash Care</p>
            </div>
            <img
              src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_f744aa51-d82d-4894-acef-fd345562b279.svg?v=1751278825"
              width={12}
              alt="Arrow Icon"
              className={`transform transition-transform duration-300 ${
                openSections.washCare ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {openSections.washCare && (
          <div className="transition-all duration-300 ease-in-out px-4 pb-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Aramya uses hand-printed fabric which may release color in the
              first 3 washes. Please wash separately to prevent color transfer.
            </p>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* === PRODUCT DESCRIPTION SECTION === */}
      <div>
        <button
          onClick={() => toggleSection("productDescription")}
          className="w-full text-left py-4 px-0 focus:outline-none transition duration-200 hover:bg-gray-50 border-none bg-transparent"
          type="button"
        >
          <div className="flex justify-between items-center gap-2 px-4">
            <div className="flex items-center gap-2">
              <img
                src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_090c392a-f842-4abe-9911-97031b815f61.svg?v=1751279219"
                width={16}
                alt="Description Icon"
              />
              <p className="text-base font-normal text-gray-900">
                Product Description
              </p>
            </div>
            <img
              src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_f744aa51-d82d-4894-acef-fd345562b279.svg?v=1751278825"
              width={12}
              alt="Arrow Icon"
              className={`transform transition-transform duration-300 ${
                openSections.productDescription ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {openSections.productDescription && (
          <div className="transition-all duration-300 ease-in-out px-4 pb-4">
            {hasDescriptionContent() ? (
              <div
                className="product-description-content text-sm text-gray-700 leading-relaxed break-words"
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-sm text-gray-500 italic">
                No description available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;

// import React, { useState } from "react";

// const ProductDescripition = ({ description }) => {
//   const [openSections, setOpenSections] = useState({
//     returns: false,
//     washCare: false,
//     productDescription: false,
//   });

//   const toggleSection = (section) => {
//     setOpenSections((prev) => ({
//       ...prev,
//       [section]: !prev[section],
//     }));
//   };

//   return (
//     <div
//       className="component-PdpAccordions bg-white"
//       id="component-PdpAccordions"
//     >
//       {/* === RETURNS SECTION === */}
//       <div>
//         <button
//           onClick={() => toggleSection("returns")}
//           className="w-full text-left py-4 px-0 focus:outline-none transition duration-200 hover:bg-gray-50 border-none bg-transparent"
//           type="button"
//         >
//           <div className="flex justify-between items-center gap-2 px-4">
//             <div className="flex items-center gap-2">
//               <img
//                 src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_Stroke.svg?v=1751279639"
//                 width={16}
//                 alt="Returns Icon"
//               />
//               <p className="text-base font-normal text-gray-900">
//                 Return & Refunds
//               </p>
//             </div>
//             <img
//               src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_f744aa51-d82d-4894-acef-fd345562b279.svg?v=1751278825"
//               width={12}
//               alt="Arrow Icon"
//               className={`transform transition-transform duration-300 ${
//                 openSections.returns ? "rotate-180" : ""
//               }`}
//             />
//           </div>
//         </button>

//         {openSections.returns && (
//           <div className="transition-all duration-300 ease-in-out px-4 pb-4">
//             <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
//               <li>Free returns offered on all items.</li>
//               <li>Items can be returned within 14 days of delivery.</li>
//               <li>
//                 Return requests can be raised from the “My Orders” section on
//                 the website.
//               </li>
//               <li>
//                 Returns are picked up within 5–7 days from the requested date.
//               </li>
//               <li>
//                 Refund is processed within 1–2 days after the return pickup.
//               </li>
//             </ul>
//           </div>
//         )}
//       </div>

//       <hr className="border-gray-200" />

//       {/* === WASH CARE SECTION === */}
//       <div>
//         <button
//           onClick={() => toggleSection("washCare")}
//           className="w-full text-left py-4 px-0 focus:outline-none transition duration-200 hover:bg-gray-50 border-none bg-transparent"
//           type="button"
//         >
//           <div className="flex justify-between items-center gap-2 px-4">
//             <div className="flex items-center gap-2">
//               <img
//                 src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_856_Stroke.svg?v=1751279644"
//                 width={16}
//                 alt="Wash Care Icon"
//               />
//               <p className="text-base font-normal text-gray-900">Wash Care</p>
//             </div>
//             <img
//               src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_f744aa51-d82d-4894-acef-fd345562b279.svg?v=1751278825"
//               width={12}
//               alt="Arrow Icon"
//               className={`transform transition-transform duration-300 ${
//                 openSections.washCare ? "rotate-180" : ""
//               }`}
//             />
//           </div>
//         </button>

//         {openSections.washCare && (
//           <div className="transition-all duration-300 ease-in-out px-4 pb-4">
//             <p className="text-sm text-gray-700 leading-relaxed">
//               Aramya uses hand-printed fabric which may release color in the
//               first 3 washes. Please wash separately to prevent color transfer.
//             </p>
//           </div>
//         )}
//       </div>

//       <hr className="border-gray-200" />

//       {/* === PRODUCT DESCRIPTION SECTION === */}
//       <div>
//         <button
//           onClick={() => toggleSection("productDescription")}
//           className="w-full text-left py-4 px-0 focus:outline-none transition duration-200 hover:bg-gray-50 border-none bg-transparent"
//           type="button"
//         >
//           <div className="flex justify-between items-center gap-2 px-4">
//             <div className="flex items-center gap-2">
//               <img
//                 src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_090c392a-f842-4abe-9911-97031b815f61.svg?v=1751279219"
//                 width={16}
//                 alt="Description Icon"
//               />
//               <p className="text-base font-normal text-gray-900">
//                 Product Description
//               </p>
//             </div>
//             <img
//               src="https://cdn.shopify.com/s/files/1/0803/1807/1063/files/Vector_f744aa51-d82d-4894-acef-fd345562b279.svg?v=1751278825"
//               width={12}
//               alt="Arrow Icon"
//               className={`transform transition-transform duration-300 ${
//                 openSections.productDescription ? "rotate-180" : ""
//               }`}
//             />
//           </div>
//         </button>

//         {openSections.productDescription && (
//           <div
//             className="transition-all duration-300 ease-in-out px-4 pb-4 text-sm text-[#8f8e8c] leading-relaxed break-words whitespace-pre-line"
//             style={{
//               wordBreak: "break-word",
//               overflowWrap: "break-word",
//             }}
//           >
//             {description && description.trim() !== ""
//               ? description
//               : "No description available."}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductDescripition;
