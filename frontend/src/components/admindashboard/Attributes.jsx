import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import useFetchData from "../../hooks/useFetchData";
import { ATTRIBUTE_ROUTES, SUBCATEGORY_ROUTES } from "../../../utils/apiRoute";
import api from "../../../utils/api";

export default function Attributes() {
  const [attributes, setAttributes] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { fetchData, postData, deleteData, loading } = useFetchData(token);

  const fetchAttributes = async () => {
    await fetchData(ATTRIBUTE_ROUTES.all, (data) => {
      if (data.success) {
        setAttributes(data.data || []);
      }
    });
  };

  const fetchSubcategories = async () => {
    try {
      const res = await api.get("/subcategories");
      setSubcategories(res.data.subcateg || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      await postData(
        ATTRIBUTE_ROUTES.create,
        {
          name: data.name,
          values: data.values.split(",").map((v) => v.trim()),
          subcategory: data.subcategory,
          Fieldtype: data.Fieldtype,
        },
        "Attribute created successfully!"
      );
      reset();
      fetchAttributes();
    } catch (error) {
      // Error is handled by the hook
      console.error("Error creating attribute:", error);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This attribute will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteData(
          ATTRIBUTE_ROUTES.delete(id),
          "Attribute deleted successfully!"
        );
        setAttributes((prev) => prev.filter((item) => item._id !== id));
      } catch (error) {
        // Error is handled by the hook
        console.error("Error deleting attribute:", error);
      }
    }
  };

  useEffect(() => {
    fetchAttributes();
    fetchSubcategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Attributes
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage product attributes
            </p>
          </div>

          {/* Create Attribute Form */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Attribute
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subcategory *
                </label>
                <select
                  {...register("subcategory", {
                    required: "Subcategory is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {errors.subcategory && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.subcategory.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Attribute Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter attribute name"
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Attribute Values (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Red, Blue, Green"
                  {...register("values")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Separate multiple values with commas
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Field Type *
                </label>
                <select
                  {...register("Fieldtype", {
                    required: "Field type is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Field Type</option>
                  <option value="text">Text</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="select">Select</option>
                  <option value="radio">Radio</option>
                </select>
                {errors.Fieldtype && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.Fieldtype.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-700"
                >
                  {loading ? "Creating..." : "Add Attribute"}
                </button>
              </div>
            </form>
          </div>

          {/* Attributes List */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              All Attributes ({attributes.length})
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading attributes...
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Values
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Field Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Subcategory
                      </th>
                      {user?.role === "admin" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attributes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={user?.role === "admin" ? 5 : 4}
                          className="px-6 py-8 text-center border-b border-gray-200"
                        >
                          <div className="text-gray-500">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <p className="mt-2">No attributes found</p>
                            <p className="text-sm">
                              Create your first attribute using the form above
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      attributes.map((attr) => (
                        <tr
                          key={attr._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                            <div className="text-sm font-medium text-gray-900">
                              {attr.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 border-b border-gray-200">
                            <div className="text-sm text-gray-600 max-w-xs">
                              {attr.values?.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {attr.values.map((value, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                    >
                                      {value}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">No values</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                attr.Fieldtype === "checkbox"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : attr.Fieldtype === "dropdown"
                                  ? "bg-purple-100 text-purple-800 border-purple-200"
                                  : attr.Fieldtype === "select"
                                  ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }`}
                            >
                              {attr.Fieldtype}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                            <div className="text-sm text-gray-600">
                              {attr.subcategory?.name || "N/A"}
                            </div>
                          </td>
                          {user?.role === "admin" && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-b border-gray-200">
                              <button
                                onClick={() => handleDelete(attr._id)}
                                className="text-red-600 hover:text-red-900 transition-colors font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
//   <div className="max-w-6xl mx-auto">
//     <div className="bg-white rounded-lg shadow-sm border">
//       {/* Header */}
//       <div className="px-6 py-4 border-b border-gray-200">
//         <h1 className="text-2xl font-bold text-gray-900">
//           Manage Attributes
//         </h1>
//         <p className="text-gray-600 mt-1">
//           Create and manage product attributes
//         </p>
//       </div>

//       {/* Create Attribute Form */}
//       <div className="p-6 border-b border-gray-200">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4">
//           Create New Attribute
//         </h2>
//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="grid grid-cols-1 md:grid-cols-2 gap-4"
//         >
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">
//               Subcategory *
//             </label>
//             <select
//               {...register("subcategory", {
//                 required: "Subcategory is required",
//               })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//             >
//               <option value="">Select Subcategory</option>
//               {subcategories.map((sub) => (
//                 <option key={sub._id} value={sub._id}>
//                   {sub.name}
//                 </option>
//               ))}
//             </select>
//             {errors.subcategory && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.subcategory.message}
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">
//               Attribute Name *
//             </label>
//             <input
//               type="text"
//               placeholder="Enter attribute name"
//               {...register("name", { required: "Name is required" })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//             />
//             {errors.name && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.name.message}
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">
//               Attribute Values (comma separated)
//             </label>
//             <input
//               type="text"
//               placeholder="e.g. Red, Blue, Green"
//               {...register("values")}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//             />
//             <p className="text-xs text-gray-500">
//               Separate multiple values with commas
//             </p>
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">
//               Field Type *
//             </label>
//             <select
//               {...register("Fieldtype", {
//                 required: "Field type is required",
//               })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//             >
//               <option value="">Select Field Type</option>
//               <option value="text">Text</option>
//               <option value="checkbox">Checkbox</option>
//               <option value="dropdown">Dropdown</option>
//               <option value="select">Select</option>
//               <option value="radio">Radio</option>
//             </select>
//             {errors.Fieldtype && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.Fieldtype.message}
//               </p>
//             )}
//           </div>

//           <div className="md:col-span-2">
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Creating..." : "Add Attribute"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Attributes List */}
//       <div className="p-6">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4">
//           All Attributes ({attributes.length})
//         </h2>

//         {loading ? (
//           <div className="flex justify-center items-center h-40">
//             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
//             <span className="ml-3 text-gray-600">
//               Loading attributes...
//             </span>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Values
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Field Type
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Subcategory
//                   </th>
//                   {user?.role === "admin" && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   )}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {attributes.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={user?.role === "admin" ? 5 : 4}
//                       className="px-6 py-8 text-center"
//                     >
//                       <div className="text-gray-500">
//                         <svg
//                           className="mx-auto h-12 w-12 text-gray-400"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                           />
//                         </svg>
//                         <p className="mt-2">No attributes found</p>
//                         <p className="text-sm">
//                           Create your first attribute using the form above
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   attributes.map((attr) => (
//                     <tr
//                       key={attr._id}
//                       className="hover:bg-gray-50 transition-colors"
//                     >
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">
//                           {attr.name}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-600 max-w-xs">
//                           {attr.values?.length > 0 ? (
//                             <div className="flex flex-wrap gap-1">
//                               {attr.values.map((value, index) => (
//                                 <span
//                                   key={index}
//                                   className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//                                 >
//                                   {value}
//                                 </span>
//                               ))}
//                             </div>
//                           ) : (
//                             <span className="text-gray-400">No values</span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span
//                           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                             attr.Fieldtype === "checkbox"
//                               ? "bg-green-100 text-green-800"
//                               : attr.Fieldtype === "dropdown"
//                               ? "bg-purple-100 text-purple-800"
//                               : attr.Fieldtype === "select"
//                               ? "bg-indigo-100 text-indigo-800"
//                               : "bg-gray-100 text-gray-800"
//                           }`}
//                         >
//                           {attr.Fieldtype}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-600">
//                           {attr.subcategory?.name || "N/A"}
//                         </div>
//                       </td>
//                       {user?.role === "admin" && (
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                           <button
//                             onClick={() => handleDelete(attr._id)}
//                             className="text-red-600 hover:text-red-900 transition-colors font-medium"
//                           >
//                             Delete
//                           </button>
//                         </td>
//                       )}
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// </div>
