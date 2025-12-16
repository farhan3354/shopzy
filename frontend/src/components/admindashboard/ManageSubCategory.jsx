// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import {
//   FaPlus,
//   FaTimes,
//   FaSync,
//   FaFolder,
//   FaFolderOpen,
//   FaList,
//   FaSave,
//   FaArrowLeft,
//   FaTag,
//   FaLink,
//   FaBox,
// } from "react-icons/fa";
// import { RiFolderAddLine, RiFolderChartLine } from "react-icons/ri";
// import { BiCategory, BiSubdirectoryRight } from "react-icons/bi";
// import { IoIosWarning, IoIosInformationCircle } from "react-icons/io";
// import api from "../../../utils/api";

// export default function ManageSubcategory() {
//   const [subcategories, setSubcategories] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFormLoading, setIsFormLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting },
//     watch,
//     setValue,
//   } = useForm({
//     defaultValues: {
//       name: "",
//       slug: "",
//       parentCategory: "",
//       description: "",
//     },
//   });

//   const watchName = watch("name");
//   useEffect(() => {
//     fetchSubcategories();
//     fetchCategories();
//   }, []);
//   useEffect(() => {
//     if (watchName) {
//       const slug = watchName
//         .toLowerCase()
//         .replace(/\s+/g, "-")
//         .replace(/[^\w-]+/g, "");
//       setValue("slug", slug);
//     }
//   }, [watchName, setValue]);

//   const fetchSubcategories = async () => {
//     try {
//       setIsLoading(true);
//       const response = await api.get("/subcategories");
//       setSubcategories(response.data.subcateg || []);
//     } catch (error) {
//       console.error("Failed to fetch subcategories:", error);
//       alert("Failed to load subcategories");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       setIsFormLoading(true);
//       const response = await api.get("/categories");
//       if (Array.isArray(response.data.categories)) {
//         setCategories(response.data.categories);
//       } else {
//         console.error("Expected categories array, got:", response.data);
//         setCategories([]);
//       }
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//       setCategories([]);
//     } finally {
//       setIsFormLoading(false);
//     }
//   };

//   const onSubmit = async (data) => {
//     try {
//       await api.post("/subcategories", data);
//       alert("Subcategory created successfully");
//       reset();
//       setShowForm(false);
//       fetchSubcategories();
//     } catch (err) {
//       const msg = err?.response?.data?.message || "Error creating subcategory";
//       alert(msg);
//       console.error(err);
//     }
//   };

//   const handleCancel = () => {
//     reset();
//     setShowForm(false);
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//         <div className="flex items-center space-x-3">
//           <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
//             <RiFolderChartLine className="w-6 h-6 text-white" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">
//               Subcategory Management
//             </h1>
//             <p className="text-gray-600 text-sm">
//               Manage your product subcategories
//             </p>
//           </div>
//         </div>

//         {!showForm && (
//           <button
//             onClick={() => setShowForm(true)}
//             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md"
//           >
//             <FaPlus className="w-4 h-4" />
//             <span>Create Subcategory</span>
//           </button>
//         )}
//       </div>

//       {showForm && (
//         <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-200">
//           <div className="p-6">
//             <div className="flex justify-between items-center mb-6">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <RiFolderAddLine className="w-5 h-5 text-green-600" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-semibold text-gray-800">
//                     Create New Subcategory
//                   </h2>
//                   <p className="text-gray-600 text-sm">
//                     Add a new subcategory to organize your products
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={handleCancel}
//                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <FaTimes className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
//                     <FaTag className="w-4 h-4 text-green-600" />
//                     <span>Subcategory Name *</span>
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Enter subcategory name"
//                     {...register("name", {
//                       required: "Subcategory name is required",
//                       minLength: {
//                         value: 2,
//                         message: "Name must be at least 2 characters",
//                       },
//                     })}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
//                   />
//                   {errors.name && (
//                     <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
//                       <IoIosWarning className="w-4 h-4" />
//                       <span>{errors.name.message}</span>
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
//                     <FaLink className="w-4 h-4 text-green-600" />
//                     <span>Slug *</span>
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Enter slug"
//                     {...register("slug", {
//                       required: "Slug is required",
//                       pattern: {
//                         value: /^[a-z0-9-]+$/,
//                         message:
//                           "Slug can only contain lowercase letters, numbers, and hyphens",
//                       },
//                     })}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
//                   />
//                   {errors.slug && (
//                     <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
//                       <IoIosWarning className="w-4 h-4" />
//                       <span>{errors.slug.message}</span>
//                     </p>
//                   )}
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
//                   <BiCategory className="w-4 h-4 text-green-600" />
//                   <span>Parent Category *</span>
//                 </label>
//                 {isFormLoading ? (
//                   <div className="flex items-center space-x-2 text-gray-500 p-3 bg-gray-50 rounded-lg">
//                     <FaSync className="animate-spin h-4 w-4 text-green-600" />
//                     <span>Loading categories...</span>
//                   </div>
//                 ) : categories.length === 0 ? (
//                   <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                     <p className="text-yellow-800 text-sm flex items-center space-x-2">
//                       <IoIosInformationCircle className="w-4 h-4" />
//                       <span>
//                         No categories found. Please create categories first.
//                       </span>
//                     </p>
//                   </div>
//                 ) : (
//                   <select
//                     {...register("parentCategory", {
//                       required: "Parent category is required",
//                     })}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
//                   >
//                     <option value="">Select Parent Category</option>
//                     {categories.map((cat) => (
//                       <option key={cat._id} value={cat._id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//                 {errors.parentCategory && (
//                   <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
//                     <IoIosWarning className="w-4 h-4" />
//                     <span>{errors.parentCategory.message}</span>
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
//                   <FaList className="w-4 h-4 text-green-600" />
//                   <span>Description</span>
//                 </label>
//                 <textarea
//                   placeholder="Enter subcategory description (optional)"
//                   rows={3}
//                   {...register("description")}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical"
//                 />
//               </div>
//               <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2 shadow-md"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <FaSync className="animate-spin w-4 h-4" />
//                       <span>Creating...</span>
//                     </>
//                   ) : (
//                     <>
//                       <FaSave className="w-4 h-4" />
//                       <span>Create Subcategory</span>
//                     </>
//                   )}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleCancel}
//                   className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center space-x-2"
//                 >
//                   <FaTimes className="w-4 h-4" />
//                   <span>Cancel</span>
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//       <div className="bg-white rounded-xl shadow-lg border border-gray-200">
//         <div className="p-6">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <FaFolderOpen className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-800">
//                   Subcategories ({subcategories.length})
//                 </h2>
//                 <p className="text-gray-600 text-sm">
//                   All available subcategories
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={fetchSubcategories}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md"
//             >
//               <FaSync className="w-4 h-4" />
//               <span>Refresh</span>
//             </button>
//           </div>
//           {isLoading ? (
//             <div className="text-center py-12">
//               <div className="inline-flex flex-col items-center space-y-4">
//                 <FaSync className="animate-spin w-8 h-8 text-blue-600" />
//                 <span className="text-gray-600">Loading subcategories...</span>
//               </div>
//             </div>
//           ) : subcategories.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="inline-flex flex-col items-center space-y-4 max-w-sm">
//                 <div className="p-4 bg-gray-100 rounded-full">
//                   <FaFolder className="w-8 h-8 text-gray-400" />
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900">
//                   No subcategories found
//                 </h3>
//                 <p className="text-gray-500 text-sm">
//                   Get started by creating your first subcategory to organize
//                   your products.
//                 </p>
//                 <button
//                   onClick={() => setShowForm(true)}
//                   className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors space-x-2 shadow-md"
//                 >
//                   <FaPlus className="w-4 h-4" />
//                   <span>Create Subcategory</span>
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="grid gap-4">
//               {subcategories.map((sub) => (
//                 <div
//                   key={sub._id}
//                   className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors group"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3 mb-2">
//                         <div className="p-2 bg-green-100 rounded-lg">
//                           <BiSubdirectoryRight className="w-4 h-4 text-green-600" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-gray-800 text-lg group-hover:text-green-700 transition-colors">
//                             {sub.name}
//                           </h3>
//                           <div className="flex flex-wrap items-center gap-2 mt-1">
//                             <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center space-x-1">
//                               <FaLink className="w-3 h-3" />
//                               <span>{sub.slug}</span>
//                             </span>
//                             <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center space-x-1">
//                               <FaBox className="w-3 h-3" />
//                               <span>Parent: {sub.parentCategory?.name}</span>
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       {sub.description && (
//                         <p className="text-gray-600 mt-2 text-sm">
//                           {sub.description}
//                         </p>
//                       )}

//                       <div className="flex items-center space-x-4 mt-3">
//                         {sub.createdAt && (
//                           <span className="text-xs text-gray-500">
//                             Created:{" "}
//                             {new Date(sub.createdAt).toLocaleDateString()}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  FaPlus,
  FaTimes,
  FaSync,
  FaFolder,
  FaFolderOpen,
  FaList,
  FaSave,
  FaArrowLeft,
  FaTag,
  FaLink,
  FaBox,
} from "react-icons/fa";
import { RiFolderAddLine, RiFolderChartLine } from "react-icons/ri";
import { BiCategory, BiSubdirectoryRight } from "react-icons/bi";
import { IoIosWarning, IoIosInformationCircle } from "react-icons/io";
import { Editor } from "@tinymce/tinymce-react";
import api from "../../../utils/api";

export default function ManageSubcategory() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [description, setDescription] = useState("");
  const editorRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      parentCategory: "",
      description: "",
    },
  });

  const watchName = watch("name");
  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);
  useEffect(() => {
    if (watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      setValue("slug", slug);
    }
  }, [watchName, setValue]);

  const fetchSubcategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/subcategories");
      setSubcategories(response.data.subcateg || []);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      alert("Failed to load subcategories");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsFormLoading(true);
      const response = await api.get("/categories");
      if (Array.isArray(response.data.categories)) {
        setCategories(response.data.categories);
      } else {
        console.error("Expected categories array, got:", response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setIsFormLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        description: description, // Use TinyMCE content
      };

      await api.post("/subcategories", formData);
      alert("Subcategory created successfully");
      reset();
      setDescription("");
      setShowForm(false);
      fetchSubcategories();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error creating subcategory";
      alert(msg);
      console.error(err);
    }
  };

  const handleCancel = () => {
    reset();
    setDescription("");
    setShowForm(false);
  };

  // TinyMCE configuration for subcategory description
  const editorConfig = {
    height: 300,
    menubar: true,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "preview",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "code",
      "help",
      "wordcount",
    ],
    toolbar:
      "undo redo | blocks | bold italic underline strikethrough | " +
      "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
      "bullist numlist outdent indent | link image media | " +
      "fontsizeselect fontselect | removeformat | code | help",
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: #374151;
      }
      h1, h2, h3, h4, h5, h6 { 
        color: #111827; 
        margin-top: 1em;
        margin-bottom: 0.5em;
      }
      h1 { font-size: 2em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.25em; }
      p { margin-bottom: 1em; }
      ul, ol { padding-left: 2em; }
      blockquote { 
        border-left: 4px solid #10b981; 
        background-color: #ecfdf5;
        padding: 1em 1.5em; 
        margin: 1em 0;
        font-style: italic;
        color: #047857;
        border-radius: 0 0.5em 0.5em 0;
      }
      code {
        background-color: #f3f4f6;
        padding: 0.1em 0.3em;
        border-radius: 0.25em;
        font-family: 'Courier New', monospace;
        color: #dc2626;
      }
      pre {
        background-color: #1f2937;
        color: #f9fafb;
        padding: 1em;
        border-radius: 0.375em;
        overflow-x: auto;
        margin: 1em 0;
      }
      a { color: #10b981; }
      a:hover { color: #059669; }
      table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
      table, th, td { border: 1px solid #e5e7eb; }
      th { background-color: #f8fafc; font-weight: 600; }
      th, td { padding: 0.75em; text-align: left; }
      tr:nth-child(even) { background-color: #f9fafb; }
      
      /* Custom classes for subcategory description */
      .text-red { color: #dc2626; }
      .text-blue { color: #2563eb; }
      .text-green { color: #059669; }
      .text-yellow { color: #d97706; }
      .text-purple { color: #7c3aed; }
      
      .bg-red { background-color: #fef2f2; padding: 0.25em 0.5em; border-radius: 0.25em; }
      .bg-blue { background-color: #eff6ff; padding: 0.25em 0.5em; border-radius: 0.25em; }
      .bg-green { background-color: #ecfdf5; padding: 0.25em 0.5em; border-radius: 0.25em; }
      
      .text-xs { font-size: 0.75em; }
      .text-sm { font-size: 0.875em; }
      .text-base { font-size: 1em; }
      .text-lg { font-size: 1.125em; }
      .text-xl { font-size: 1.25em; }
      
      .font-light { font-weight: 300; }
      .font-normal { font-weight: 400; }
      .font-medium { font-weight: 500; }
      .font-semibold { font-weight: 600; }
      .font-bold { font-weight: 700; }
      
      .text-left { text-align: left; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-justify { text-align: justify; }
    `,
    branding: false,
    promotion: false,
    paste_data_images: false,
    automatic_uploads: false,
    formats: {
      alignleft: {
        selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
        classes: "text-left",
      },
      aligncenter: {
        selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
        classes: "text-center",
      },
      alignright: {
        selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
        classes: "text-right",
      },
      alignjustify: {
        selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
        classes: "text-justify",
      },
    },
    style_formats: [
      { title: "Heading 1", format: "h1" },
      { title: "Heading 2", format: "h2" },
      { title: "Heading 3", format: "h3" },
      { title: "Heading 4", format: "h4" },
      { title: "Heading 5", format: "h5" },
      { title: "Heading 6", format: "h6" },
      { title: "Paragraph", format: "p" },
      { title: "Blockquote", format: "blockquote" },
      { title: "Pre", format: "pre" },
      {
        title: "Text Colors",
        items: [
          { title: "Red", inline: "span", classes: "text-red" },
          { title: "Blue", inline: "span", classes: "text-blue" },
          { title: "Green", inline: "span", classes: "text-green" },
          { title: "Yellow", inline: "span", classes: "text-yellow" },
          { title: "Purple", inline: "span", classes: "text-purple" },
        ],
      },
      {
        title: "Background Colors",
        items: [
          { title: "Red Background", inline: "span", classes: "bg-red" },
          { title: "Blue Background", inline: "span", classes: "bg-blue" },
          { title: "Green Background", inline: "span", classes: "bg-green" },
        ],
      },
      {
        title: "Font Sizes",
        items: [
          { title: "Extra Small", inline: "span", classes: "text-xs" },
          { title: "Small", inline: "span", classes: "text-sm" },
          { title: "Base", inline: "span", classes: "text-base" },
          { title: "Large", inline: "span", classes: "text-lg" },
          { title: "Extra Large", inline: "span", classes: "text-xl" },
        ],
      },
      {
        title: "Font Weights",
        items: [
          { title: "Light", inline: "span", classes: "font-light" },
          { title: "Normal", inline: "span", classes: "font-normal" },
          { title: "Medium", inline: "span", classes: "font-medium" },
          { title: "Semibold", inline: "span", classes: "font-semibold" },
          { title: "Bold", inline: "span", classes: "font-bold" },
        ],
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
            <RiFolderChartLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Subcategory Management
            </h1>
            <p className="text-gray-600 text-sm">
              Manage your product subcategories
            </p>
          </div>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md"
          >
            <FaPlus className="w-4 h-4" />
            <span>Create Subcategory</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <RiFolderAddLine className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Create New Subcategory
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Add a new subcategory to organize your products
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <FaTag className="w-4 h-4 text-green-600" />
                    <span>Subcategory Name *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter subcategory name"
                    {...register("name", {
                      required: "Subcategory name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                      <IoIosWarning className="w-4 h-4" />
                      <span>{errors.name.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <FaLink className="w-4 h-4 text-green-600" />
                    <span>Slug *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter slug"
                    {...register("slug", {
                      required: "Slug is required",
                      pattern: {
                        value: /^[a-z0-9-]+$/,
                        message:
                          "Slug can only contain lowercase letters, numbers, and hyphens",
                      },
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                      <IoIosWarning className="w-4 h-4" />
                      <span>{errors.slug.message}</span>
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <BiCategory className="w-4 h-4 text-green-600" />
                  <span>Parent Category *</span>
                </label>
                {isFormLoading ? (
                  <div className="flex items-center space-x-2 text-gray-500 p-3 bg-gray-50 rounded-lg">
                    <FaSync className="animate-spin h-4 w-4 text-green-600" />
                    <span>Loading categories...</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm flex items-center space-x-2">
                      <IoIosInformationCircle className="w-4 h-4" />
                      <span>
                        No categories found. Please create categories first.
                      </span>
                    </p>
                  </div>
                ) : (
                  <select
                    {...register("parentCategory", {
                      required: "Parent category is required",
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="">Select Parent Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.parentCategory && (
                  <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                    <IoIosWarning className="w-4 h-4" />
                    <span>{errors.parentCategory.message}</span>
                  </p>
                )}
              </div>

              {/* TinyMCE Editor for Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <FaList className="w-4 h-4 text-green-600" />
                  <span>Description</span>
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                  <Editor
                    onInit={(evt, editor) => (editorRef.current = editor)}
                    value={description}
                    onEditorChange={(newValue) => setDescription(newValue)}
                    init={editorConfig}
                    apiKey={"5vdp2934fu4e3s9ppww5is091de5hxrjv2ju7lh5unb8ycvd"}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                  <span>
                    💡 <strong>Formatting Tips:</strong>
                  </span>
                  <span>• Use headings for structure</span>
                  <span>• Create lists for features</span>
                  <span>• Add links for references</span>
                  <span>• Use tables for specifications</span>
                  <span>• Apply colors and formatting from menu</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <FaSync className="animate-spin w-4 h-4" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      <span>Create Subcategory</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <FaTimes className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaFolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Subcategories ({subcategories.length})
                </h2>
                <p className="text-gray-600 text-sm">
                  All available subcategories
                </p>
              </div>
            </div>
            <button
              onClick={fetchSubcategories}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md"
            >
              <FaSync className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex flex-col items-center space-y-4">
                <FaSync className="animate-spin w-8 h-8 text-blue-600" />
                <span className="text-gray-600">Loading subcategories...</span>
              </div>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex flex-col items-center space-y-4 max-w-sm">
                <div className="p-4 bg-gray-100 rounded-full">
                  <FaFolder className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No subcategories found
                </h3>
                <p className="text-gray-500 text-sm">
                  Get started by creating your first subcategory to organize
                  your products.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors space-x-2 shadow-md"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Create Subcategory</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {subcategories.map((sub) => (
                <div
                  key={sub._id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <BiSubdirectoryRight className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg group-hover:text-green-700 transition-colors">
                            {sub.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center space-x-1">
                              <FaLink className="w-3 h-3" />
                              <span>{sub.slug}</span>
                            </span>
                            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center space-x-1">
                              <FaBox className="w-3 h-3" />
                              <span>Parent: {sub.parentCategory?.name}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {sub.description && (
                        <div
                          className="text-gray-600 mt-2 text-sm subcategory-description-content"
                          dangerouslySetInnerHTML={{ __html: sub.description }}
                        />
                      )}

                      <div className="flex items-center space-x-4 mt-3">
                        {sub.createdAt && (
                          <span className="text-xs text-gray-500">
                            Created:{" "}
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
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
