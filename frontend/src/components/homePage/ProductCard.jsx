import React from "react";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";

const ProductCard = ({
  product,
  wishlist = false, // Change default to boolean instead of array
  onWishlistToggle,
  showAttributes = true,
}) => {
  const getProductData = (product) => {
    const brand = product.brand || "Aramya";
    const category = product.category?.name || "3Pc Set";
    const description = product.description || "";
    const attributes = product.attributes || [];

    const fabricAttribute = attributes.find(
      (attr) =>
        attr.name?.toLowerCase().includes("fabric") ||
        attr.attribute?.name?.toLowerCase().includes("fabric")
    );
    const fabric = fabricAttribute?.value?.[0] || "100% Pure Cotton";

    const careAttribute = attributes.find(
      (attr) =>
        attr.name?.toLowerCase().includes("care") ||
        attr.attribute?.name?.toLowerCase().includes("care")
    );
    const careInstructions = careAttribute?.value?.[0] || "Machine Wash Cold";

    const originalPrice = `₹${Math.round(product.price * 2.5).toLocaleString(
      "en-IN"
    )}`;
    const discount = Math.round(
      ((parseInt(originalPrice.replace("₹", "").replace(",", "")) -
        product.price) /
        parseInt(originalPrice.replace("₹", "").replace(",", ""))) *
        100
    );

    const allAttributes = attributes
      .map((attr) => ({
        name: attr.name || attr.attribute?.name,
        values: attr.value || [],
      }))
      .filter((attr) => attr.name && attr.values.length > 0);

    return {
      brand,
      category,
      description,
      fabric,
      careInstructions,
      originalPrice,
      discount,
      allAttributes,
      rating: 4.7,
      reviews: "5.4K",
    };
  };

  const formatPrice = (price) => {
    return `₹${price?.toLocaleString("en-IN")}`;
  };

  const formatAttributeName = (name) => {
    if (!name) return "";
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const productData = getProductData(product);

  // Check if product is in wishlist - now using boolean directly
  const isInWishlist = Boolean(wishlist);

  return (
    <>
      <div className="bg-white rounded-none overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 group">
        <div className="relative overflow-hidden">
          <Link to={`/product/${product._id}`}>
            <div className="h-64 sm:h-72 lg:h-80 bg-gray-50 flex items-center justify-center overflow-hidden relative">
              <img
                src={product?.images?.[0] || "/api/placeholder/300/400"}
                alt={product?.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold">
                {productData.discount}% OFF
              </div>
            </div>
          </Link>

          <button
            type="button"
            className={`absolute top-2 right-2 rounded-full p-2 transition-all duration-300 ${
              isInWishlist
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white text-gray-600 shadow-md hover:bg-red-500 hover:text-white"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onWishlistToggle?.(product._id);
            }}
          >
            <FiHeart className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 sm:p-4">
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
            {productData.brand}
          </p>

          <Link to={`/product/${product._id}`}>
            <h3 className="text-sm font-normal text-gray-900 leading-tight mb-2 line-clamp-2 hover:text-red-600 transition-colors duration-200 min-h-[40px]">
              {product?.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.floor(productData.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({productData.reviews})
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(product?.price)}
              </p>
              <p className="text-sm text-gray-500 line-through">
                {productData.originalPrice}
              </p>
              <p className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                {productData.discount}% OFF
              </p>
            </div>
          </div>

          {showAttributes && productData.allAttributes.length > 0 && (
            <div className="product-attributes-container mt-3 space-y-2">
              {productData.allAttributes
                .slice(0, 2)
                .map((attribute, attrIndex) => (
                  <div key={attrIndex} className="attribute-section">
                    <p className="attribute-name text-[10px] text-gray-500 mb-1 capitalize">
                      {formatAttributeName(attribute.name)}:
                    </p>
                    <div className="attribute-values flex flex-wrap gap-1">
                      {attribute.values.slice(0, 4).map((value, valueIndex) => (
                        <div
                          key={valueIndex}
                          className="attribute-value text-[10px] px-2 py-1 border border-gray-300 rounded text-gray-700 bg-white cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          {value}
                        </div>
                      ))}
                      {attribute.values.length > 4 && (
                        <div className="attribute-value-more text-[10px] px-2 py-1 text-gray-500 border border-gray-300 rounded">
                          +{attribute.values.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCard;

// import React from "react";
// import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
// import { Link } from "react-router-dom";

// const ProductCard = ({
//   product,
//   wishlist = [],
//   onWishlistToggle,
//   showAttributes = true,
// }) => {
//   const getProductData = (product) => {
//     const brand = product.brand || "Aramya";
//     const category = product.category?.name || "3Pc Set";
//     const description = product.description || "";
//     const attributes = product.attributes || [];

//     const fabricAttribute = attributes.find(
//       (attr) =>
//         attr.name?.toLowerCase().includes("fabric") ||
//         attr.attribute?.name?.toLowerCase().includes("fabric")
//     );
//     const fabric = fabricAttribute?.value?.[0] || "100% Pure Cotton";

//     const careAttribute = attributes.find(
//       (attr) =>
//         attr.name?.toLowerCase().includes("care") ||
//         attr.attribute?.name?.toLowerCase().includes("care")
//     );
//     const careInstructions = careAttribute?.value?.[0] || "Machine Wash Cold";

//     const originalPrice = `₹${Math.round(product.price * 2.5).toLocaleString(
//       "en-IN"
//     )}`;
//     const discount = Math.round(
//       ((parseInt(originalPrice.replace("₹", "").replace(",", "")) -
//         product.price) /
//         parseInt(originalPrice.replace("₹", "").replace(",", ""))) *
//         100
//     );

//     const allAttributes = attributes
//       .map((attr) => ({
//         name: attr.name || attr.attribute?.name,
//         values: attr.value || [],
//       }))
//       .filter((attr) => attr.name && attr.values.length > 0);

//     return {
//       brand,
//       category,
//       description,
//       fabric,
//       careInstructions,
//       originalPrice,
//       discount,
//       allAttributes,
//       rating: 4.7,
//       reviews: "5.4K",
//     };
//   };

//   const formatPrice = (price) => {
//     return `₹${price?.toLocaleString("en-IN")}`;
//   };

//   const formatAttributeName = (name) => {
//     if (!name) return "";
//     return name
//       .replace(/([A-Z])/g, " $1")
//       .replace(/^./, (str) => str.toUpperCase())
//       .trim();
//   };

//   const productData = getProductData(product);

//   // const staticFallbackData = {
//   //   deliveryDate: "Tomorrow, 4 PM",
//   //   returnPolicy: "14 Days Easy Return & Exchange Available",
//   // };

//   return (
//     <>
//       <div className="bg-white rounded-none overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 group">
//         <div className="relative overflow-hidden">
//           <Link to={`/product/${product._id}`}>
//             <div className="h-64 sm:h-72 lg:h-80 bg-gray-50 flex items-center justify-center overflow-hidden relative">
//               <img
//                 src={product?.images?.[0] || "/api/placeholder/300/400"}
//                 alt={product?.name}
//                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//               />
//               <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold">
//                 {productData.discount}% OFF
//               </div>
//             </div>
//           </Link>

//           <button
//             type="button"
//             className={`absolute top-2 right-2 rounded-full p-2 transition-all duration-300 ${
//               wishlist.includes(product._id)
//                 ? "bg-red-500 text-white shadow-lg"
//                 : "bg-white text-gray-600 shadow-md hover:bg-red-500 hover:text-white"
//             }`}
//             onClick={(e) => {
//               e.preventDefault();
//               onWishlistToggle?.(product._id);
//             }}
//           >
//             <FiHeart className="h-4 w-4" />
//           </button>

//           {/* {showQuickAdd && (
//           <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//             <button
//               onClick={(e) => {
//                 e.preventDefault();
//                 onAddToCart?.(product._id);
//               }}
//               className="w-full bg-black text-white py-2 text-sm font-semibold rounded hover:bg-gray-800 transition-colors duration-200"
//             >
//               QUICK ADD
//             </button>
//           </div>
//         )} */}
//         </div>

//         <div className="p-3 sm:p-4">
//           <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
//             {productData.brand}
//           </p>

//           <Link to={`/product/${product._id}`}>
//             <h3 className="text-sm font-normal text-gray-900 leading-tight mb-2 line-clamp-2 hover:text-red-600 transition-colors duration-200 min-h-[40px]">
//               {product?.name}
//             </h3>
//           </Link>

//           <div className="flex items-center gap-1 mb-2">
//             <div className="flex items-center">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <FiStar
//                   key={star}
//                   className={`h-3 w-3 ${
//                     star <= Math.floor(productData.rating)
//                       ? "text-yellow-400 fill-yellow-400"
//                       : "text-gray-300"
//                   }`}
//                 />
//               ))}
//             </div>
//             <span className="text-xs text-gray-500">
//               ({productData.reviews})
//             </span>
//           </div>

//           <div>
//             <div className="flex items-center gap-2 mb-3">
//               <p className="text-lg font-bold text-gray-900">
//                 {formatPrice(product?.price)}
//               </p>
//               <p className="text-sm text-gray-500 line-through">
//                 {productData.originalPrice}
//               </p>
//               <p className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
//                 {productData.discount}% OFF
//               </p>
//             </div>
//           </div>

//           {showAttributes && productData.allAttributes.length > 0 && (
//             <div className="product-attributes-container mt-3 space-y-2">
//               {productData.allAttributes
//                 .slice(0, 2)
//                 .map((attribute, attrIndex) => (
//                   <div key={attrIndex} className="attribute-section">
//                     <p className="attribute-name text-[10px] text-gray-500 mb-1 capitalize">
//                       {formatAttributeName(attribute.name)}:
//                     </p>
//                     <div className="attribute-values flex flex-wrap gap-1">
//                       {attribute.values.slice(0, 4).map((value, valueIndex) => (
//                         <div
//                           key={valueIndex}
//                           className="attribute-value text-[10px] px-2 py-1 border border-gray-300 rounded text-gray-700 bg-white cursor-pointer hover:border-gray-400 transition-colors"
//                         >
//                           {value}
//                         </div>
//                       ))}
//                       {attribute.values.length > 4 && (
//                         <div className="attribute-value-more text-[10px] px-2 py-1 text-gray-500 border border-gray-300 rounded">
//                           +{attribute.values.length - 4} more
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               {/* {productData.allAttributes.length > 2 && (
//                 <div className="text-[10px] text-gray-500 text-center">
//                   +{productData.allAttributes.length - 2} more attributes
//                 </div>
//               )} */}
//             </div>
//           )}

//           {/* {showDeliveryInfo && (
//             <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
//               <div className="flex items-center gap-2 text-xs">
//                 <svg
//                   className="w-3 h-3 text-green-600 flex-shrink-0"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 <span className="text-green-700 font-medium">
//                   Free Delivery • {staticFallbackData.deliveryDate}
//                 </span>
//               </div>
//             </div>
//           )} */}

//           {/* <Link
//           to={`/product/${product._id}`}
//           className="w-full bg-red-600 text-white py-3 rounded font-semibold hover:bg-red-700 transition-colors duration-200 text-sm flex items-center justify-center gap-2"
//         >
//           <FiShoppingCart className="h-4 w-4" />
//           See details
//         </Link> */}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProductCard;
