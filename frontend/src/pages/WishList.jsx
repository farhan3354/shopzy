// import React, { useState, useEffect } from "react";
// import { FiHeart } from "react-icons/fi";
// import { useSelector } from "react-redux";
// import Swal from "sweetalert2";
// import ProductCard from "./../components/homePage/ProductCard";
// import useFetchData from "../hooks/useFetchData";
// import { WishlistLoading } from "../components/common/LoadingSpinner";

// export default function WishList() {
//   const [wishlist, setWishlist] = useState([]);
//   const token = useSelector((state) => state.auth.token);
//   const { fetchData, deleteData, postData, loading } = useFetchData(token);

//   useEffect(() => {
//     const fetchWishlist = async () => {
//       await fetchData("/wishlist", (data) => {
//         setWishlist(data.wishlist || []);
//       });
//     };
//     fetchWishlist();
//   }, [token]);

//   const handleRemoveItem = async (productId) => {
//     const confirm = await Swal.fire({
//       title: "Are you sure?",
//       text: "This item will be removed from your wishlist.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, remove it!",
//     });

//     if (confirm.isConfirmed) {
//       try {
//         await deleteData(
//           `/wishlist/remove/${productId}`,
//           "The item was removed from your wishlist."
//         );

//         setWishlist((prev) =>
//           prev.filter((item) => item.productId._id !== productId)
//         );

//         Swal.fire("Removed!", "The item was removed.", "success");
//       } catch (error) {
//         console.error("Error removing item:", error);
//       }
//     }
//   };

//   const handleMoveToCart = async (wishlistItemId, productId) => {
//     try {
//       await postData(
//         `/cart`,
//         { productId: productId },
//         "Item moved to cart successfully!"
//       );

//       setWishlist((prev) => prev.filter((item) => item._id !== wishlistItemId));

//       Swal.fire("Success!", "Item moved to cart.", "success");
//     } catch (error) {
//       console.error("Error moving item to cart:", error);
//     }
//   };

//   const wishlistIds = wishlist.map((item) => item.productId._id);

//   return (
//     <div className="page-Wishlist bg-white min-h-screen" id="page-Wishlist">
//       <div className="max-w-7xl mx-auto px-4 py-6">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900 flex items-center">
//             <FiHeart className="text-red-500 mr-3" />
//             My Wishlist
//           </h1>
//           <p className="text-gray-600 mt-2">
//             {wishlist.length} items saved for later
//           </p>
//         </div>

//         {loading ? (
//           <WishlistLoading />
//         ) : wishlist.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-12 text-center">
//             <FiHeart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
//             <h3 className="text-2xl font-semibold text-gray-900 mb-2">
//               Your wishlist is empty
//             </h3>
//             <p className="text-gray-500 mb-6 max-w-md mx-auto">
//               Start saving your favorite items to your wishlist. They'll be
//               waiting for you here!
//             </p>
//             <button className="inline-flex items-center px-6 py-3 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
//               Continue Shopping
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
//             {wishlist.map((item, index) => {
//               const product = item.productId;

//               return (
//                 <div
//                   key={item._id}
//                   className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
//                 >
//                   <div className="component-ProductCard pb-2 flex-grow">
//                     <ProductCard
//                       product={product}
//                       wishlist={wishlistIds}
//                       onWishlistToggle={handleRemoveItem}
//                       onAddToCart={() =>
//                         handleMoveToCart(item._id, product._id)
//                       }
//                       showAttributes={true}
//                       showDeliveryInfo={false}
//                       showQuickAdd={false}
//                     />
//                   </div>

//                   <div className="flex gap-2 px-3 pb-3 mt-2">
//                     <button
//                       onClick={() => handleRemoveItem(product._id)}
//                       className="flex items-center justify-center p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 min-w-[40px] transition-colors"
//                     >
//                       <span
//                         className="component-SvgIcons"
//                         style={{ width: "16px", height: "16px" }}
//                       >
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm1 2H6v12h12zm-4.586 6 1.768 1.768-1.414 1.414L12 15.414l-1.768 1.768-1.414-1.414L10.586 14l-1.768-1.768 1.414-1.414L12 12.586l1.768-1.768 1.414 1.414zM9 4v2h6V4z"></path>
//                         </svg>
//                       </span>
//                     </button>
//                     <button
//                       onClick={() => handleMoveToCart(item._id, product._id)}
//                       className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-800 text-gray-800 rounded font-medium hover:bg-gray-800 hover:text-white transition-colors text-sm"
//                     >
//                       Move To Bag
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         .page-Wishlist {
//           background: white;
//         }

//         .component-ProductCard {
//           position: relative;
//         }

//         .product-card-size-options-container {
//           display: flex;
//           overflow-x: auto;
//           gap: 4px;
//           padding-bottom: 4px;
//         }

//         .product-card-size-option-variant {
//           padding: 2px 8px;
//           border: 1px solid #e3e1de;
//           border-radius: 4px;
//           font-size: 11px;
//           white-space: nowrap;
//           flex-shrink: 0;
//         }

//         .product-card-size-option-variant.disabled {
//           color: #9ca3af;
//           background-color: #f9fafb;
//         }

//         .product-card-size-options-container::-webkit-scrollbar {
//           display: none;
//         }

//         .product-card-size-options-container {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </div>
//     // <div className="page-Wishlist bg-white min-h-screen" id="page-Wishlist">
//     //   <div className="max-w-7xl mx-auto px-4 py-6">
//     //     <div className="mb-6">
//     //       <h1 className="text-2xl font-bold text-gray-900 flex items-center">
//     //         <FiHeart className="text-red-500 mr-3" />
//     //         My Wishlist
//     //       </h1>
//     //       <p className="text-gray-600 mt-2">
//     //         {wishlist.length} items saved for later
//     //       </p>
//     //     </div>

//     //     {loading ? (
//     //       <WishlistLoading />
//     //     ) : wishlist.length === 0 ? (
//     //       <div className="bg-white rounded-lg shadow p-12 text-center">
//     //         <FiHeart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
//     //         <h3 className="text-2xl font-semibold text-gray-900 mb-2">
//     //           Your wishlist is empty
//     //         </h3>
//     //         <p className="text-gray-500 mb-6 max-w-md mx-auto">
//     //           Start saving your favorite items to your wishlist. They'll be
//     //           waiting for you here!
//     //         </p>
//     //         <button className="inline-flex items-center px-6 py-3 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
//     //           Continue Shopping
//     //         </button>
//     //       </div>
//     //     ) : (
//     //       <div className="flex flex-wrap" style={{ margin: "0 -16px" }}>
//     //         {wishlist.map((item, index) => {
//     //           const product = item.productId;

//     //           return (
//     //             <div
//     //               key={item._id}
//     //               className="w-1/2 border-b border-gray-200"
//     //               style={{
//     //                 display: "flex",
//     //                 flexDirection: "column",
//     //                 borderRight:
//     //                   index % 2 === 0
//     //                     ? "0.5px solid rgb(227, 225, 222)"
//     //                     : "none",
//     //               }}
//     //             >
//     //               <div className="component-ProductCard pb-2 flex-grow">
//     //                 <ProductCard
//     //                   product={product}
//     //                   wishlist={wishlistIds}
//     //                   onWishlistToggle={handleRemoveItem}
//     //                   onAddToCart={() =>
//     //                     handleMoveToCart(item._id, product._id)
//     //                   }
//     //                   showAttributes={true}
//     //                   showDeliveryInfo={false}
//     //                   showQuickAdd={false}
//     //                 />
//     //               </div>

//     //               <div className="flex gap-2 px-2 pb-3 mt-2">
//     //                 <button
//     //                   onClick={() => handleRemoveItem(product._id)}
//     //                   className="MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary MuiButton-sizeMedium MuiButton-outlinedSizeMedium MuiButton-colorPrimary MuiButton-disableElevation flex items-center justify-center p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 min-w-[40px]"
//     //                 >
//     //                   <span
//     //                     className="component-SvgIcons"
//     //                     style={{ width: "16px", height: "16px" }}
//     //                   >
//     //                     <svg
//     //                       xmlns="http://www.w3.org/2000/svg"
//     //                       fill="currentColor"
//     //                       viewBox="0 0 24 24"
//     //                     >
//     //                       <path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm1 2H6v12h12zm-4.586 6 1.768 1.768-1.414 1.414L12 15.414l-1.768 1.768-1.414-1.414L10.586 14l-1.768-1.768 1.414-1.414L12 12.586l1.768-1.768 1.414 1.414zM9 4v2h6V4z"></path>
//     //                     </svg>
//     //                   </span>
//     //                 </button>
//     //                 <button
//     //                   onClick={() => handleMoveToCart(item._id, product._id)}
//     //                   className="MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary MuiButton-sizeMedium MuiButton-outlinedSizeMedium MuiButton-colorPrimary MuiButton-disableElevation flex-1 flex items-center justify-center px-4 py-2 border border-gray-800 text-gray-800 rounded font-medium hover:bg-gray-800 hover:text-white transition-colors text-sm"
//     //                 >
//     //                   Move To Bag
//     //                 </button>
//     //               </div>
//     //             </div>
//     //           );
//     //         })}
//     //       </div>
//     //     )}
//     //   </div>

//     //   <style jsx>{`
//     //     .page-Wishlist {
//     //       background: white;
//     //     }

//     //     .component-ProductCard {
//     //       position: relative;
//     //     }

//     //     .product-card-size-options-container {
//     //       display: flex;
//     //       overflow-x: auto;
//     //       gap: 4px;
//     //       padding-bottom: 4px;
//     //     }

//     //     .product-card-size-option-variant {
//     //       padding: 2px 8px;
//     //       border: 1px solid #e3e1de;
//     //       border-radius: 4px;
//     //       font-size: 11px;
//     //       white-space: nowrap;
//     //       flex-shrink: 0;
//     //     }

//     //     .product-card-size-option-variant.disabled {
//     //       color: #9ca3af;
//     //       background-color: #f9fafb;
//     //     }

//     //     .product-card-size-options-container::-webkit-scrollbar {
//     //       display: none;
//     //     }

//     //     .product-card-size-options-container {
//     //       -ms-overflow-style: none;
//     //       scrollbar-width: none;
//     //     }
//     //   `}</style>
//     // </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { FiHeart } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import ProductCard from "./../components/homePage/ProductCard";
import useFetchData from "../hooks/useFetchData";
import { WishlistLoading } from "../components/common/LoadingSpinner";
import { updateWishlistCount } from "../redux/authSlice/wishlistSlice"; 

export default function WishList() {
  const [wishlist, setWishlist] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const { fetchData, deleteData, postData, loading } = useFetchData(token);
  const dispatch = useDispatch(); // Add dispatch

  useEffect(() => {
    const fetchWishlist = async () => {
      await fetchData("/wishlist", (data) => {
        setWishlist(data.wishlist || []);
      });
    };
    fetchWishlist();
  }, [token]);

  const handleRemoveItem = async (productId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This item will be removed from your wishlist.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteData(
          `/wishlist/remove/${productId}`,
          "The item was removed from your wishlist."
        );

        setWishlist((prev) =>
          prev.filter((item) => item.productId._id !== productId)
        );

        dispatch(updateWishlistCount());

        Swal.fire("Removed!", "The item was removed.", "success");
      } catch (error) {
        console.error("Error removing item:", error);
      }
    }
  };

  const handleMoveToCart = async (wishlistItemId, productId) => {
    try {
      await postData(
        `/cart`,
        { productId: productId },
        "Item moved to cart successfully!"
      );

      setWishlist((prev) => prev.filter((item) => item._id !== wishlistItemId));

      dispatch(updateWishlistCount());

      Swal.fire("Success!", "Item moved to cart.", "success");
    } catch (error) {
      console.error("Error moving item to cart:", error);
    }
  };

  const wishlistIds = wishlist.map((item) => item.productId._id);

  return (
    <div className="page-Wishlist bg-white min-h-screen" id="page-Wishlist">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiHeart className="text-red-500 mr-3" />
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">
            {wishlist.length} items saved for later
          </p>
        </div>

        {loading ? (
          <WishlistLoading />
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiHeart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start saving your favorite items to your wishlist. They'll be
              waiting for you here!
            </p>
            <button className="inline-flex items-center px-6 py-3 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((item, index) => {
              const product = item.productId;

              return (
                <div
                  key={item._id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="component-ProductCard pb-2 flex-grow">
                    <ProductCard
                      product={product}
                      wishlist={wishlistIds}
                      onWishlistToggle={handleRemoveItem}
                      onAddToCart={() =>
                        handleMoveToCart(item._id, product._id)
                      }
                      showAttributes={true}
                      showDeliveryInfo={false}
                      showQuickAdd={false}
                    />
                  </div>

                  <div className="flex gap-2 px-3 pb-3 mt-2">
                    <button
                      onClick={() => handleRemoveItem(product._id)}
                      className="flex items-center justify-center p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 min-w-[40px] transition-colors"
                    >
                      <span
                        className="component-SvgIcons"
                        style={{ width: "16px", height: "16px" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm1 2H6v12h12zm-4.586 6 1.768 1.768-1.414 1.414L12 15.414l-1.768 1.768-1.414-1.414L10.586 14l-1.768-1.768 1.414-1.414L12 12.586l1.768-1.768 1.414 1.414zM9 4v2h6V4z"></path>
                        </svg>
                      </span>
                    </button>
                    <button
                      onClick={() => handleMoveToCart(item._id, product._id)}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-800 text-gray-800 rounded font-medium hover:bg-gray-800 hover:text-white transition-colors text-sm"
                    >
                      Move To Bag
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-Wishlist {
          background: white;
        }

        .component-ProductCard {
          position: relative;
        }

        .product-card-size-options-container {
          display: flex;
          overflow-x: auto;
          gap: 4px;
          padding-bottom: 4px;
        }

        .product-card-size-option-variant {
          padding: 2px 8px;
          border: 1px solid #e3e1de;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .product-card-size-option-variant.disabled {
          color: #9ca3af;
          background-color: #f9fafb;
        }

        .product-card-size-options-container::-webkit-scrollbar {
          display: none;
        }

        .product-card-size-options-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import { FiHeart } from "react-icons/fi";
// import { useSelector } from "react-redux";
// import Swal from "sweetalert2";
// import ProductCard from "./../components/homePage/ProductCard";
// import api from "../../utils/api";

// export default function WishList() {
//   const [wishlist, setWishlist] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const token = useSelector((state) => state.auth.token);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await api.get("/wishlist", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setWishlist(res.data.wishlist || []);
//       } catch (error) {
//         console.error("Error fetching wishlist:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [token]);

//   const handleRemoveItem = async (productId) => {
//     const confirm = await Swal.fire({
//       title: "Are you sure?",
//       text: "This item will be removed from your wishlist.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, remove it!",
//     });

//     if (confirm.isConfirmed) {
//       try {
//         await api.delete(`/wishlist/remove/${productId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setWishlist((prev) =>
//           prev.filter((item) => item.productId._id !== productId)
//         );

//         Swal.fire("Removed!", "The item was removed.", "success");
//       } catch (error) {
//         console.error("Error removing item:", error);
//         Swal.fire("Error", "Something went wrong.", "error");
//       }
//     }
//   };

//   const handleMoveToCart = async (id) => {
//     try {
//       await api.post(
//         `/cart`,
//         { productId: id },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setWishlist((prev) => prev.filter((item) => item._id !== id));
//       Swal.fire("Success!", "Item moved to cart.", "success");
//     } catch (error) {
//       console.error("Error moving item to cart:", error);
//       Swal.fire("Error", "Failed to move item to cart.", "error");
//     }
//   };

//   // Get wishlist product IDs for the common component
//   const wishlistIds = wishlist.map((item) => item.productId._id);

//   return (
//     <div className="page-Wishlist bg-white min-h-screen" id="page-Wishlist">
//       <div className="max-w-7xl mx-auto px-4 py-6">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900 flex items-center">
//             <FiHeart className="text-red-500 mr-3" />
//             My Wishlist
//           </h1>
//           <p className="text-gray-600 mt-2">
//             {wishlist.length} items saved for later
//           </p>
//         </div>

//         {loading ? (
//           <div className="text-center py-12">Loading your wishlist...</div>
//         ) : wishlist.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-12 text-center">
//             <FiHeart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
//             <h3 className="text-2xl font-semibold text-gray-900 mb-2">
//               Your wishlist is empty
//             </h3>
//             <p className="text-gray-500 mb-6 max-w-md mx-auto">
//               Start saving your favorite items to your wishlist. They'll be
//               waiting for you here!
//             </p>
//             <button className="inline-flex items-center px-6 py-3 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
//               Continue Shopping
//             </button>
//           </div>
//         ) : (
//           <div className="flex flex-wrap" style={{ margin: "0 -16px" }}>
//             {wishlist.map((item, index) => {
//               const product = item.productId;

//               return (
//                 <div
//                   key={item._id}
//                   className="w-1/2 border-b border-gray-200"
//                   style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     borderRight:
//                       index % 2 === 0
//                         ? "0.5px solid rgb(227, 225, 222)"
//                         : "none",
//                   }}
//                 >
//                   {/* Use the common ProductCard component */}
//                   <div className="component-ProductCard pb-2 flex-grow">
//                     <ProductCard
//                       product={product}
//                       wishlist={wishlistIds}
//                       onWishlistToggle={handleRemoveItem} // Use remove for wishlist toggle
//                       onAddToCart={() => handleMoveToCart(item._id)}
//                       showAttributes={true}
//                       showDeliveryInfo={false} // Hide delivery info in wishlist
//                       showQuickAdd={false} // Hide quick add in wishlist
//                     />
//                   </div>

//                   {/* Custom Wishlist Action Buttons */}
//                   <div className="flex gap-2 px-2 pb-3 mt-2">
//                     <button
//                       onClick={() => handleRemoveItem(product._id)}
//                       className="MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary MuiButton-sizeMedium MuiButton-outlinedSizeMedium MuiButton-colorPrimary MuiButton-disableElevation flex items-center justify-center p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 min-w-[40px]"
//                     >
//                       <span
//                         className="component-SvgIcons"
//                         style={{ width: "16px", height: "16px" }}
//                       >
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm1 2H6v12h12zm-4.586 6 1.768 1.768-1.414 1.414L12 15.414l-1.768 1.768-1.414-1.414L10.586 14l-1.768-1.768 1.414-1.414L12 12.586l1.768-1.768 1.414 1.414zM9 4v2h6V4z"></path>
//                         </svg>
//                       </span>
//                     </button>
//                     <button
//                       onClick={() => handleMoveToCart(item._id)}
//                       className="MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary MuiButton-sizeMedium MuiButton-outlinedSizeMedium MuiButton-colorPrimary MuiButton-disableElevation flex-1 flex items-center justify-center px-4 py-2 border border-gray-800 text-gray-800 rounded font-medium hover:bg-gray-800 hover:text-white transition-colors text-sm"
//                     >
//                       Move To Bag
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         .page-Wishlist {
//           background: white;
//         }

//         .component-ProductCard {
//           position: relative;
//         }

//         .product-card-size-options-container {
//           display: flex;
//           overflow-x: auto;
//           gap: 4px;
//           padding-bottom: 4px;
//         }

//         .product-card-size-option-variant {
//           padding: 2px 8px;
//           border: 1px solid #e3e1de;
//           border-radius: 4px;
//           font-size: 11px;
//           white-space: nowrap;
//           flex-shrink: 0;
//         }

//         .product-card-size-option-variant.disabled {
//           color: #9ca3af;
//           background-color: #f9fafb;
//         }

//         .product-card-size-options-container::-webkit-scrollbar {
//           display: none;
//         }

//         .product-card-size-options-container {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </div>
//   );
// }
