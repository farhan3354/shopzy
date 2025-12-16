import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import SearchBar from "../common/SearchBar";
import { useSelector } from "react-redux";
import { FiEdit, FiTrash2, FiEye, FiPackage } from "react-icons/fi";
import { PRODUCT_ROUTES } from "../../../utils/apiRoute";
import useFetchData from "../../hooks/useFetchData";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const token = useSelector((state) => state.auth.token);

  const { fetchData, updateData, deleteData, loading, error } =
    useFetchData(token);

  const fetchProducts = async () => {
    await fetchData(PRODUCT_ROUTES.all, (data) => {
      if (data.success) {
        setProducts(data.products || []);
      }
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filtered = products.filter(
      (prod) =>
        prod.name?.toLowerCase().includes(lower) ||
        prod.brand?.toLowerCase().includes(lower) ||
        prod.price?.toString().toLowerCase().includes(lower)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleChangeStatus = async (id, status) => {
    try {
      await updateData(
        `/products/changestatus/${id}`,
        { status },
        `Product ${
          status === "active" ? "activated" : "deactivated"
        } successfully!`
      );

      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status } : p))
      );
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
      await deleteData(
        PRODUCT_ROUTES.single(id),
        "Product deleted successfully"
      );

      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("❌ Error deleting product:", error);
    }
  };

  // const fetchProducts = async () => {
  //   try {
  //     const res = await api.get("/products", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (res.data.success) {
  //       setProducts(res.data.products);
  //     }
  //   } catch (err) {
  //     console.error("❌ Error fetching products:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchProducts();
  // }, []);

  // useEffect(() => {
  //   const lower = searchTerm.toLowerCase();
  //   const filtered = products.filter(
  //     (prod) =>
  //       prod.name.toLowerCase().includes(lower) ||
  //       prod.brand.toLowerCase().includes(lower) ||
  //       prod.price.toString().toLowerCase().includes(lower)
  //   );
  //   setFilteredProducts(filtered);
  // }, [searchTerm, products]);

  // const handleChangeStatus = async (id, status) => {
  //   try {
  //     const res = await api.put(
  //       `/products/changestatus/${id}`,
  //       { status },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     if (res.data.success) {
  //       setProducts((prev) =>
  //         prev.map((p) => (p._id === id ? { ...p, status } : p))
  //       );
  //     }
  //   } catch (err) {
  //     console.error("Failed to update status:", err);
  //   }
  // };

  // const deleteProduct = async (id) => {
  //   const result = await Swal.fire({
  //     title: "Are you sure?",
  //     text: "Do you really want to delete this product?",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#3085d6",
  //     confirmButtonText: "Yes, delete it!",
  //   });

  //   if (!result.isConfirmed) return;

  //   try {
  //     const respo = await api.delete(`/products/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (respo.data.success) {
  //       Swal.fire("Deleted!", "✅ Product deleted successfully.", "success");
  //       setProducts((prev) => prev.filter((p) => p._id !== id));
  //     } else {
  //       Swal.fire("Failed!", "❌ Failed to delete the product.", "error");
  //     }
  //   } catch (error) {
  //     console.error("❌ Error deleting product:", error);
  //     Swal.fire(
  //       "Error!",
  //       "An error occurred while deleting the product.",
  //       "error"
  //     );
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              All Products
            </h2>
            <div className="w-full sm:w-64 lg:w-80">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name, brand, or price..."
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <FiPackage className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No products available"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Brand
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Category
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((prod) => (
                      <tr
                        key={prod._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 border-b border-gray-200">
                          <div className="flex items-center">
                            {prod.images?.[0] ? (
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="h-12 w-12 object-cover rounded-md border border-gray-200"
                              />
                            ) : (
                              <div className="h-12 w-12 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md border border-gray-200">
                                <FiPackage className="text-lg" />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {prod.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 border-b border-gray-200">
                          {prod.brand || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-blue-600 border-b border-gray-200">
                          ₹{prod.price}
                        </td>
                        <td className="px-4 py-4 text-sm border-b border-gray-200">
                          <span
                            className={`font-medium ${
                              prod.stock > 0 ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {prod.stock > 0
                              ? `In Stock (${prod.stock})`
                              : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 border-b border-gray-200">
                          {prod.subcategory?.parentCategory?.name} →{" "}
                          {prod.subcategory?.name}
                        </td>
                        <td className="px-4 py-4 text-center border-b border-gray-200">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                              prod.status === "active"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-600 border-red-200"
                            }`}
                          >
                            {prod.status || "inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-4 border-b border-gray-200">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() =>
                                handleChangeStatus(prod._id, "active")
                              }
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition border border-green-600"
                              title="Activate"
                            >
                              Active
                            </button>
                            <button
                              onClick={() =>
                                handleChangeStatus(prod._id, "inactive")
                              }
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition border border-red-600"
                              title="Deactivate"
                            >
                              Inactive
                            </button>
                            <Link
                              to={`/admin-dashboard/edit-product/${prod._id}`}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition flex items-center gap-1 border border-blue-600"
                              title="Edit"
                            >
                              <FiEdit className="text-xs" />
                              Edit
                            </Link>
                            <button
                              onClick={() => deleteProduct(prod._id)}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition flex items-center gap-1 border border-red-600"
                              title="Delete"
                            >
                              <FiTrash2 className="text-xs" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod._id}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {prod.images?.[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="h-16 w-16 object-cover rounded-md border border-gray-200"
                            />
                          ) : (
                            <div className="h-16 w-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md border border-gray-200">
                              <FiPackage className="text-xl" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">
                              {prod.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {prod.brand || "N/A"}
                            </p>
                            <p className="text-lg font-semibold text-blue-600">
                              ₹{prod.price}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                            prod.status === "active"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-600 border-red-200"
                          }`}
                        >
                          {prod.status || "inactive"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">
                            Stock:
                          </span>
                          <p
                            className={`font-medium ${
                              prod.stock > 0 ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {prod.stock > 0
                              ? `In Stock (${prod.stock})`
                              : "Out of Stock"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">
                            Category:
                          </span>
                          <p className="text-gray-700 truncate">
                            {prod.subcategory?.parentCategory?.name} →{" "}
                            {prod.subcategory?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleChangeStatus(prod._id, "active")}
                          className="flex-1 min-w-[80px] px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition border border-green-600"
                        >
                          Active
                        </button>
                        <button
                          onClick={() =>
                            handleChangeStatus(prod._id, "inactive")
                          }
                          className="flex-1 min-w-[80px] px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition border border-red-600"
                        >
                          Inactive
                        </button>
                        <Link
                          to={`/admin-dashboard/edit-product/${prod._id}`}
                          className="flex-1 min-w-[80px] px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition flex items-center justify-center gap-1 border border-blue-600"
                        >
                          <FiEdit className="text-xs" />
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteProduct(prod._id)}
                          className="flex-1 min-w-[80px] px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition flex items-center justify-center gap-1 border border-red-600"
                        >
                          <FiTrash2 className="text-xs" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Medium Screen Table */}
              <div className="hidden md:block lg:hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((prod) => (
                      <tr
                        key={prod._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 border-b border-gray-200">
                          <div className="flex items-center">
                            {prod.images?.[0] ? (
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="h-12 w-12 object-cover rounded-md border border-gray-200"
                              />
                            ) : (
                              <div className="h-12 w-12 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md border border-gray-200">
                                <FiPackage className="text-lg" />
                              </div>
                            )}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {prod.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {prod.brand || "N/A"} • {prod.subcategory?.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-blue-600 border-b border-gray-200">
                          ₹{prod.price}
                        </td>
                        <td className="px-4 py-4 border-b border-gray-200">
                          <div className="text-sm">
                            <span
                              className={`font-medium ${
                                prod.stock > 0
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {prod.stock > 0 ? prod.stock : "0"}
                            </span>
                            <div className="text-xs text-gray-500">
                              {prod.status === "active" ? "Active" : "Inactive"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 border-b border-gray-200">
                          <div className="flex flex-col space-y-1">
                            <div className="flex space-x-1">
                              <button
                                onClick={() =>
                                  handleChangeStatus(prod._id, "active")
                                }
                                className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition border border-green-600"
                              >
                                Active
                              </button>
                              <button
                                onClick={() =>
                                  handleChangeStatus(prod._id, "inactive")
                                }
                                className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition border border-red-600"
                              >
                                Inactive
                              </button>
                            </div>
                            <div className="flex space-x-1">
                              <Link
                                to={`/admin-dashboard/edit-product/${prod._id}`}
                                className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition flex items-center justify-center gap-1 border border-blue-600"
                              >
                                <FiEdit className="text-xs" />
                                Edit
                              </Link>
                              <button
                                onClick={() => deleteProduct(prod._id)}
                                className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition flex items-center justify-center gap-1 border border-red-600"
                              >
                                <FiTrash2 className="text-xs" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

{
  /* <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            All Products
          </h2>
          <div className="w-full sm:w-64 lg:w-80">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search by name, brand, or price..."
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <FiPackage className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No products available"}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((prod) => (
                    <tr
                      key={prod._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {prod.images?.[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="h-12 w-12 object-cover rounded-md border"
                            />
                          ) : (
                            <div className="h-12 w-12 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md">
                              <FiPackage className="text-lg" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {prod.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {prod.brand || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-blue-600">
                        ${prod.price}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span
                          className={`font-medium ${
                            prod.stock > 0 ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {prod.stock > 0
                            ? `In Stock (${prod.stock})`
                            : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {prod.subcategory?.parentCategory?.name} →{" "}
                        {prod.subcategory?.name}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            prod.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {prod.status || "inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() =>
                              handleChangeStatus(prod._id, "active")
                            }
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                            title="Activate"
                          >
                            Active
                          </button>
                          <button
                            onClick={() =>
                              handleChangeStatus(prod._id, "inactive")
                            }
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                            title="Deactivate"
                          >
                            Inactive
                          </button>
                          <Link
                            to={`/admin-dashboard/edit-product/${prod._id}`}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition flex items-center gap-1"
                            title="Edit"
                          >
                            <FiEdit className="text-xs" />
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteProduct(prod._id)}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition flex items-center gap-1"
                            title="Delete"
                          >
                            <FiTrash2 className="text-xs" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod._id}
                  className="bg-white rounded-lg shadow-sm border p-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {prod.images?.[0] ? (
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="h-16 w-16 object-cover rounded-md border"
                          />
                        ) : (
                          <div className="h-16 w-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md">
                            <FiPackage className="text-xl" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">
                            {prod.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {prod.brand || "N/A"}
                          </p>
                          <p className="text-lg font-semibold text-blue-600">
                            ${prod.price}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          prod.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {prod.status || "inactive"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">
                          Stock:
                        </span>
                        <p
                          className={`font-medium ${
                            prod.stock > 0 ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {prod.stock > 0
                            ? `In Stock (${prod.stock})`
                            : "Out of Stock"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Category:
                        </span>
                        <p className="text-gray-700 truncate">
                          {prod.subcategory?.parentCategory?.name} →{" "}
                          {prod.subcategory?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleChangeStatus(prod._id, "active")}
                        className="flex-1 min-w-[80px] px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                      >
                        Active
                      </button>
                      <button
                        onClick={() => handleChangeStatus(prod._id, "inactive")}
                        className="flex-1 min-w-[80px] px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                      >
                        Inactive
                      </button>
                      <Link
                        to={`/admin-dashboard/edit-product/${prod._id}`}
                        className="flex-1 min-w-[80px] px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition flex items-center justify-center gap-1"
                      >
                        <FiEdit className="text-xs" />
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteProduct(prod._id)}
                        className="flex-1 min-w-[80px] px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition flex items-center justify-center gap-1"
                      >
                        <FiTrash2 className="text-xs" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block lg:hidden bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((prod) => (
                    <tr
                      key={prod._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {prod.images?.[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="h-12 w-12 object-cover rounded-md border"
                            />
                          ) : (
                            <div className="h-12 w-12 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md">
                              <FiPackage className="text-lg" />
                            </div>
                          )}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {prod.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {prod.brand || "N/A"} • {prod.subcategory?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-blue-600">
                        ${prod.price}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <span
                            className={`font-medium ${
                              prod.stock > 0 ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {prod.stock > 0 ? prod.stock : "0"}
                          </span>
                          <div className="text-xs text-gray-500">
                            {prod.status === "active" ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex space-x-1">
                            <button
                              onClick={() =>
                                handleChangeStatus(prod._id, "active")
                              }
                              className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                            >
                              Active
                            </button>
                            <button
                              onClick={() =>
                                handleChangeStatus(prod._id, "inactive")
                              }
                              className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                            >
                              Inactive
                            </button>
                          </div>
                          <div className="flex space-x-1">
                            <Link
                              to={`/admin-dashboard/edit-product/${prod._id}`}
                              className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition flex items-center justify-center gap-1"
                            >
                              <FiEdit className="text-xs" />
                              Edit
                            </Link>
                            <button
                              onClick={() => deleteProduct(prod._id)}
                              className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition flex items-center justify-center gap-1"
                            >
                              <FiTrash2 className="text-xs" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div> */
}
