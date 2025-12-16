import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import SearchBar from "../common/SearchBar";
import { useSelector } from "react-redux";
import api from "../../../utils/api";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/vendor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filtered = products.filter(
      (prod) =>
        prod.name.toLowerCase().includes(lower) ||
        prod.brand.toLowerCase().includes(lower) ||
        prod.price.toString().toLowerCase().includes(lower)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleChangeStatus = async (id, status) => {
    try {
      const res = await api.put(
        `/products/changestatus/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status } : p))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteProduct = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const respo = await api.delete(
        `/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (respo.data.success) {
        Swal.fire("Deleted!", "✅ Product deleted successfully.", "success");
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        Swal.fire("Failed!", "❌ Failed to delete the product.", "error");
      }
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      Swal.fire(
        "Error!",
        "An error occurred while deleting the product.",
        "error"
      );
    }
  };

  if (loading) return <p className="text-center">Loading products...</p>;

  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">All Products</h2>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by name, brand, or price..."
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Image
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Brand
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Price
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Stock
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Category
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((prod) => (
              <tr
                key={prod._id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  {prod.images?.[0] ? (
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="h-14 w-14 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="h-14 w-14 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md">
                      No Image
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {prod.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {prod.brand || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                  ${prod.price}
                </td>

                <td
                  className={`px-4 py-3 text-sm font-medium ${
                    prod.stock > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {prod.stock > 0 ? `In Stock (${prod.stock})` : "Out of Stock"}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {prod.subcategory?.parentCategory?.name} →{" "}
                  {prod.subcategory?.name}
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      prod.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {prod.status || "inactive"}
                  </span>
                </td>

                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => handleChangeStatus(prod._id, "active")}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition"
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleChangeStatus(prod._id, "inactive")}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
                  >
                    Inactive
                  </button>
                  <Link
                    to={`/admin-dashboard/edit-product/${prod._id}`}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteProduct(prod._id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import { FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter } from "react-icons/fi";

// const VendorProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [isLoading, setIsLoading] = useState(true);

//   const categories = [
//     "all",
//     "electronics",
//     "clothing",
//     "footwear",
//     "accessories",
//   ];

//   useEffect(() => {
//     setTimeout(() => {
//       const mockProducts = [
//         {
//           id: 1,
//           name: "Wireless Headphones",
//           price: 99.99,
//           category: "electronics",
//           stock: 45,
//           description:
//             "High-quality wireless headphones with noise cancellation",
//           image: "https://via.placeholder.com/150",
//         },
//         {
//           id: 2,
//           name: "Running Shoes",
//           price: 79.99,
//           category: "footwear",
//           stock: 32,
//           description: "Comfortable running shoes for everyday use",
//           image: "https://via.placeholder.com/150",
//         },
//         {
//           id: 3,
//           name: "Smart Watch",
//           price: 199.99,
//           category: "electronics",
//           stock: 18,
//           description: "Feature-rich smartwatch with health monitoring",
//           image: "https://via.placeholder.com/150",
//         },
//         {
//           id: 4,
//           name: "Cotton T-Shirt",
//           price: 24.99,
//           category: "clothing",
//           stock: 76,
//           description: "100% cotton t-shirt in various colors",
//           image: "https://via.placeholder.com/150",
//         },
//         {
//           id: 5,
//           name: "Leather Wallet",
//           price: 49.99,
//           category: "accessories",
//           stock: 28,
//           description: "Genuine leather wallet with multiple card slots",
//           image: "https://via.placeholder.com/150",
//         },
//         {
//           id: 6,
//           name: "Bluetooth Speaker",
//           price: 69.99,
//           category: "electronics",
//           stock: 15,
//           description:
//             "Portable Bluetooth speaker with excellent sound quality",
//           image: "https://via.placeholder.com/150",
//         },
//       ];
//       setProducts(mockProducts);
//       setFilteredProducts(mockProducts);
//       setIsLoading(false);
//     }, 1000);
//   }, []);

//   useEffect(() => {
//     let results = products;

//     if (searchTerm) {
//       results = results.filter(
//         (product) =>
//           product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           product.description.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (selectedCategory !== "all") {
//       results = results.filter(
//         (product) => product.category === selectedCategory
//       );
//     }

//     setFilteredProducts(results);
//   }, [searchTerm, selectedCategory, products]);

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleCategoryChange = (e) => {
//     setSelectedCategory(e.target.value);
//   };

//   const handleEdit = (productId) => {
//     alert(`Edit functionality would open for product ID: ${productId}`);
//   };

//   const getCategoryColor = (category) => {
//     switch (category) {
//       case "electronics":
//         return "bg-blue-100 text-blue-800";
//       case "clothing":
//         return "bg-purple-100 text-purple-800";
//       case "footwear":
//         return "bg-green-100 text-green-800";
//       case "accessories":
//         return "bg-yellow-100 text-yellow-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading products...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Products Management
//           </h1>
//           <p className="text-gray-600 mt-2">Manage your product inventory</p>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div className="flex-1">
//               <div className="relative">
//                 <FiSearch className="absolute left-3 top-3 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search products by name or description..."
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
//                   value={searchTerm}
//                   onChange={handleSearch}
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-3">
//               <div className="flex items-center">
//                 <FiFilter className="text-gray-400 mr-2" />
//                 <select
//                   className="border border-gray-300 rounded-md px-4 py-2"
//                   value={selectedCategory}
//                   onChange={handleCategoryChange}
//                 >
//                   {categories.map((category) => (
//                     <option key={category} value={category}>
//                       {category.charAt(0).toUpperCase() + category.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
//                 <FiPlus className="mr-2" /> Add Product
//               </button>
//             </div>
//           </div>
//         </div>

//         {filteredProducts.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-8 text-center">
//             <h3 className="text-xl font-medium text-gray-900">
//               No products found
//             </h3>
//             <p className="text-gray-600 mt-2">
//               {searchTerm || selectedCategory !== "all"
//                 ? "Try adjusting your search or filter criteria"
//                 : "You haven't added any products yet"}
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredProducts.map((product) => (
//               <div
//                 key={product.id}
//                 className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
//               >
//                 <div className="h-48 bg-gray-200 overflow-hidden">
//                   <img
//                     src={product.image}
//                     alt={product.name}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>

//                 <div className="p-6">
//                   <div className="flex justify-between items-start mb-2">
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       {product.name}
//                     </h3>
//                     <span
//                       className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
//                         product.category
//                       )}`}
//                     >
//                       {product.category}
//                     </span>
//                   </div>

//                   <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//                     {product.description}
//                   </p>

//                   <div className="flex justify-between items-center mb-4">
//                     <div>
//                       <span className="text-2xl font-bold text-gray-900">
//                         ${product.price}
//                       </span>
//                     </div>
//                     <div
//                       className={`text-sm font-medium ${
//                         product.stock > 10
//                           ? "text-green-600"
//                           : product.stock > 0
//                           ? "text-yellow-600"
//                           : "text-red-600"
//                       }`}
//                     >
//                       {product.stock > 0
//                         ? `${product.stock} in stock`
//                         : "Out of stock"}
//                     </div>
//                   </div>

//                   <div className="flex justify-between space-x-2">
//                     <button
//                       onClick={() => handleEdit(product.id)}
//                       className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md flex items-center justify-center"
//                     >
//                       <FiEdit className="mr-2" /> Edit
//                     </button>
//                     <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md flex items-center justify-center">
//                       <FiTrash2 className="mr-2" /> Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VendorProducts;
