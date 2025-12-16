import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { BANNER_ROUTES } from "../../../utils/apiRoute";
import useFetchData from "../../hooks/useFetchData";

export default function AdminBanner() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "header",
    link: "",
    image: null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const token = useSelector((state) => state.auth.token);
  const { fetchData, uploadFile, deleteData, loading } = useFetchData(token);

  const fetchBanners = async () => {
    await fetchData(BANNER_ROUTES.all, (data) => {
      if (data.success) {
        setBanners(data.data || []);
      }
    });
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.description.trim() || !form.image) {
      Swal.fire("Error", "Please fill all required fields!", "error");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("type", form.type);
    formData.append("link", form.link);
    formData.append("image", form.image);

    try {
      await uploadFile(
        BANNER_ROUTES.create,
        formData,
        "✅ Banner added successfully!",
        (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      );
      setForm({
        name: "",
        description: "",
        type: "header",
        link: "",
        image: null,
      });
      setUploadProgress(0);
      fetchBanners();
    } catch (error) {
      setUploadProgress(0);
      // Error is handled by the hook
    }
  };

  const deleteBanner = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This banner will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteData(
            BANNER_ROUTES.delete(id),
            "Banner deleted successfully!"
          );
          fetchBanners();
        } catch (error) {
          // Error is handled by the hook
        }
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        Swal.fire("Error", "Please select an image file", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Error", "File size should be less than 5MB", "error");
        return;
      }

      setForm({ ...form, image: file });
    }
  };

  const clearForm = () => {
    setForm({
      name: "",
      description: "",
      type: "header",
      link: "",
      image: null,
    });
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Manage Banners
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 bg-white shadow-lg p-4 sm:p-6 rounded-lg max-w-md mb-8"
        >
          <h3 className="text-lg font-semibold mb-2">Add New Banner</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Name *
            </label>
            <input
              type="text"
              placeholder="Enter banner name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Description *
            </label>
            <input
              type="text"
              placeholder="Enter banner description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Type *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="header">Header Banner</option>
              <option value="center">Center Banner</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Link (optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, PNG, WebP. Max size: 5MB
            </p>
            {form.image && (
              <p className="text-xs text-green-600 mt-1">
                Selected: {form.image.name}
              </p>
            )}
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-gray-600 mt-1 text-center">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || uploadProgress > 0}
              className={`flex-1 p-3 rounded font-semibold transition-colors ${
                loading || uploadProgress > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#9B3232] hover:bg-[#7f2929]"
              } text-white`}
            >
              {loading ? "Adding Banner..." : "Add Banner"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </form>
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <h3 className="text-xl font-semibold mb-4">
            Existing Banners ({banners.length})
          </h3>

          {banners.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No banners found. Add your first banner above.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <div
                  key={banner._id}
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={banner.image}
                      alt={banner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {banner.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {banner.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded capitalize">
                        {banner.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(banner.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {banner.link && (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-blue-600 hover:text-blue-800 text-sm truncate"
                      >
                        {banner.link}
                      </a>
                    )}
                    <button
                      onClick={() => deleteBanner(banner._id)}
                      className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                    >
                      Delete Banner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import api from "../../../utils/api";

// export default function AdminBanner() {
//   const [banners, setBanners] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     type: "header",
//     link: "",
//     image: null,
//   });

//   const fetchBanners = async () => {
//     try {
//       const res = await api.get("/banners");
//       setBanners(res.data.data || []);
//     } catch (err) {
//       console.error("Error fetching banners:", err);
//       alert("Error loading banners");
//     }
//   };

//   useEffect(() => {
//     fetchBanners();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const data = new FormData();
//     data.append("name", form.name);
//     data.append("description", form.description);
//     data.append("type", form.type);
//     data.append("link", form.link);
//     if (form.image) {
//       data.append("image", form.image);
//     }

//     try {
//       const response = await api.post("/banners/add", data, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data.success) {
//         alert("✅ Banner added successfully!");
//         setForm({ name: "", type: "header", link: "", image: null });
//         fetchBanners();
//       } else {
//         alert(`Error: ${response.data.message}`);
//       }
//     } catch (err) {
//       console.error("Error adding banner:", err);

//       if (err.response) {
//         alert(`Error: ${err.response.data.message || "Server error"}`);
//       } else if (err.request) {
//         alert("Error: No response from server. Check your connection.");
//       } else {
//         alert("Error: " + err.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteBanner = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this banner?")) return;

//     try {
//       await api.delete(`/banners/${id}`);
//       alert("Banner deleted successfully!");
//       fetchBanners();
//     } catch (err) {
//       console.error("Error deleting banner:", err);
//       alert("Error deleting banner");
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         alert("Please select an image file");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         alert("File size should be less than 5MB");
//         return;
//       }
//       setForm({ ...form, image: file });
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Banners</h2>

//       <form
//         onSubmit={handleSubmit}
//         className="grid gap-4 bg-white shadow-lg p-6 rounded-lg max-w-md mb-8"
//       >
//         <h3 className="text-lg font-semibold mb-2">Add New Banner</h3>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Banner Name *
//           </label>
//           <input
//             type="text"
//             placeholder="Enter banner name"
//             value={form.name}
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//             className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Banner description *
//           </label>
//           <input
//             type="text"
//             placeholder="Enter banner description"
//             value={form.description}
//             onChange={(e) => setForm({ ...form, description: e.target.value })}
//             className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Banner Type *
//           </label>
//           <select
//             value={form.type}
//             onChange={(e) => setForm({ ...form, type: e.target.value })}
//             className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           >
//             <option value="header">Header Banner</option>
//             <option value="center">Center Banner</option>
//             <option value="other">Other</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Banner Link (optional)
//           </label>
//           <input
//             type="url"
//             placeholder="https://example.com"
//             value={form.link}
//             onChange={(e) => setForm({ ...form, link: e.target.value })}
//             className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Banner Image *
//           </label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             required
//           />
//           <p className="text-xs text-gray-500 mt-1">
//             Supported formats: JPG, PNG, WebP. Max size: 5MB
//           </p>
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className={`w-full p-3 rounded font-semibold transition-colors ${
//             loading
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-[#9B3232] hover:bg-[#7f2929]"
//           } text-white`}
//         >
//           {loading ? "Adding Banner..." : "Add Banner"}
//         </button>
//       </form>

//       {/* Banners List */}
//       <div className="bg-white shadow-lg rounded-lg p-6">
//         <h3 className="text-xl font-semibold mb-4">
//           Existing Banners ({banners.length})
//         </h3>

//         {banners.length === 0 ? (
//           <p className="text-gray-500 text-center py-8">
//             No banners found. Add your first banner above.
//           </p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {banners.map((banner) => (
//               <div
//                 key={banner._id}
//                 className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <div className="h-48 overflow-hidden">
//                   <img
//                     src={banner.image}
//                     alt={banner.name}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="p-4">
//                   <h3 className="font-semibold text-lg text-gray-800">
//                     {banner.name}
//                   </h3>
//                   <div className="flex items-center justify-between mt-2">
//                     <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded capitalize">
//                       {banner.type}
//                     </span>
//                     <span className="text-xs text-gray-500">
//                       {new Date(banner.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                   {banner.link && (
//                     <a
//                       href={banner.link}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="block mt-2 text-blue-600 hover:text-blue-800 text-sm truncate"
//                     >
//                       {banner.link}
//                     </a>
//                   )}
//                   <button
//                     onClick={() => deleteBanner(banner._id)}
//                     className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
//                   >
//                     Delete Banner
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
