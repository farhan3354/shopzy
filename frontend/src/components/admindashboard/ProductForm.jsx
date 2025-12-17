// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import useFetchData from "../../hooks/useFetchData";
// import {
//   ATTRIBUTE_ROUTES,
//   CATEGORY_ROUTES,
//   PRODUCT_ROUTES,
// } from "../../../utils/apiRoute";
// import { Editor } from "@tinymce/tinymce-react";

// export default function ProductForm() {
//   const {
//     register,
//     handleSubmit,
//     watch,
//     reset,
//     setValue,
//     getValues,
//     formState: { errors },
//   } = useForm();

//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [attributes, setAttributes] = useState([]);
//   const [selectedCheckboxes, setSelectedCheckboxes] = useState({});
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [filePreviews, setFilePreviews] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [description, setDescription] = useState("");
//   const [uploadType, setUploadType] = useState("images"); // "images" or "files"

//   const selectedCategory = watch("category");
//   const selectedSubcategory = watch("subcategory");
//   const price = watch("price");
//   const originalPrice = watch("originalPrice");
//   const imageVisibility = watch("imageVisibility", "public");
//   const productType = watch("producttype");

//   const token = useSelector((state) => state.auth.token);
//   const navigate = useNavigate();

//   const { fetchData, uploadFile, loading } = useFetchData(token);
//   const discountPercentage =
//     originalPrice && price && originalPrice > price
//       ? Math.round(((originalPrice - price) / originalPrice) * 100)
//       : 0;

//   const discountAmount =
//     originalPrice && price && originalPrice > price ? originalPrice - price : 0;

//   useEffect(() => {
//     const fetchCategories = async () => {
//       await fetchData(CATEGORY_ROUTES.all, (data) => {
//         if (data.success) {
//           setCategories(data.categories || []);
//         }
//       });
//     };
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     if (selectedCategory) {
//       const fetchSubcategories = async () => {
//         try {
//           const endpoints = [
//             `/subcategories/category/${selectedCategory}`,
//             `/subcategories?category=${selectedCategory}`,
//             `/categories/${selectedCategory}/subcategories`,
//           ];

//           let subcategoriesData = [];

//           for (const endpoint of endpoints) {
//             try {
//               await fetchData(endpoint, (data) => {
//                 if (data.success) {
//                   subcategoriesData =
//                     data.subcategories || data.subcateg || data.data || [];
//                 }
//               });
//               if (subcategoriesData.length > 0) break;
//             } catch (error) {
//               console.log(`Trying next endpoint...`);
//               continue;
//             }
//           }
//           if (subcategoriesData.length === 0 && categories.length > 0) {
//             const selectedCat = categories.find(
//               (cat) => cat._id === selectedCategory
//             );
//             if (selectedCat && selectedCat.subcategories) {
//               subcategoriesData = selectedCat.subcategories;
//             }
//           }

//           setSubcategories(subcategoriesData);
//         } catch (error) {
//           console.error("Error fetching subcategories:", error);
//           setSubcategories([]);
//         }
//       };
//       fetchSubcategories();
//     } else {
//       setSubcategories([]);
//       setAttributes([]);
//     }
//   }, [selectedCategory, categories]);

//   useEffect(() => {
//     if (selectedSubcategory) {
//       const fetchAttributes = async () => {
//         await fetchData(ATTRIBUTE_ROUTES.all, (data) => {
//           if (data.success) {
//             const allAttrs = data.data || data.attributes || [];
//             const filtered = allAttrs.filter(
//               (attr) =>
//                 attr.subcategory?._id === selectedSubcategory ||
//                 attr.subcategory === selectedSubcategory
//             );
//             setAttributes(filtered);
//             const checkboxState = {};
//             filtered.forEach((attr) => {
//               if (attr.Fieldtype === "checkbox") {
//                 checkboxState[attr._id] = [];
//               }
//             });
//             setSelectedCheckboxes(checkboxState);
//           }
//         });
//       };
//       fetchAttributes();
//     } else {
//       setAttributes([]);
//       setSelectedCheckboxes({});
//     }
//   }, [selectedSubcategory]);

//   const handleCheckboxChange = (attributeId, value, isChecked) => {
//     setSelectedCheckboxes((prev) => {
//       const newState = { ...prev };

//       if (isChecked) {
//         if (!newState[attributeId]?.includes(value)) {
//           newState[attributeId] = [...(newState[attributeId] || []), value];
//         }
//       } else {
//         newState[attributeId] = (newState[attributeId] || []).filter(
//           (v) => v !== value
//         );

//         if (newState[attributeId].length === 0) {
//           delete newState[attributeId];
//         }
//       }

//       return newState;
//     });
//   };

//   const handleImageChange = (e) => {
//     const newFiles = Array.from(e.target.files);

//     const currentFiles = getValues("images") || [];
//     const totalFiles = currentFiles.length + newFiles.length;

//     if (totalFiles > 5) {
//       Swal.fire(
//         "Maximum Files Exceeded",
//         `Maximum 5 files allowed. You already have ${currentFiles.length} files selected.`,
//         "warning"
//       );
//       e.target.value = "";
//       return;
//     }

//     // Define allowed file types based on upload type
//     const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
//     const allowedFileTypes = [
//       "application/zip",
//       "application/x-zip-compressed",
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "text/plain",
//       "application/vnd.ms-excel",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     ];

//     const validTypes = uploadType === "images" ? allowedImageTypes : allowedFileTypes;
//     const invalidFiles = newFiles.filter(
//       (file) => !validTypes.includes(file.type)
//     );

//     if (invalidFiles.length > 0) {
//       const allowedFormats = uploadType === "images"
//         ? "JPG, PNG, WebP"
//         : "ZIP, PDF, DOC, DOCX, TXT, XLS, XLSX";
//       Swal.fire("Error", `Only ${allowedFormats} files are allowed`, "error");
//       e.target.value = "";
//       return;
//     }

//     const maxSize = uploadType === "images" ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB for images, 50MB for files
//     const oversizedFiles = newFiles.filter(
//       (file) => file.size > maxSize
//     );
//     if (oversizedFiles.length > 0) {
//       const maxSizeMB = maxSize / (1024 * 1024);
//       Swal.fire("Error", `File size should be less than ${maxSizeMB}MB`, "error");
//       e.target.value = "";
//       return;
//     }

//     // Create previews for images
//     if (uploadType === "images") {
//       const newPreviews = newFiles.map((file) => ({
//         file,
//         preview: URL.createObjectURL(file),
//         type: "image"
//       }));
//       const updatedFiles = [...currentFiles, ...newFiles];
//       const updatedPreviews = [...imagePreviews, ...newPreviews];

//       setImagePreviews(updatedPreviews);
//       setValue("images", updatedFiles);
//     } else {
//       // For files, create file info objects
//       const newFilePreviews = newFiles.map((file) => ({
//         file,
//         name: file.name,
//         size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
//         type: file.type,
//         icon: getFileIcon(file.type)
//       }));
//       const updatedFiles = [...currentFiles, ...newFiles];
//       const updatedPreviews = [...filePreviews, ...newFilePreviews];

//       setFilePreviews(updatedPreviews);
//       setValue("images", updatedFiles);
//     }

//     e.target.value = "";
//   };

//   const getFileIcon = (fileType) => {
//     if (fileType.includes("zip")) return "📦";
//     if (fileType.includes("pdf")) return "📄";
//     if (fileType.includes("word") || fileType.includes("document")) return "📝";
//     if (fileType.includes("excel") || fileType.includes("sheet")) return "📊";
//     if (fileType.includes("text")) return "📃";
//     return "📎";
//   };

//   const removeFile = (index) => {
//     if (uploadType === "images") {
//       URL.revokeObjectURL(imagePreviews[index].preview);
//       const newPreviews = imagePreviews.filter((_, i) => i !== index);
//       const currentFiles = getValues("images") || [];
//       const newFiles = currentFiles.filter((_, i) => i !== index);

//       setImagePreviews(newPreviews);
//       setValue("images", newFiles);
//     } else {
//       const newPreviews = filePreviews.filter((_, i) => i !== index);
//       const currentFiles = getValues("images") || [];
//       const newFiles = currentFiles.filter((_, i) => i !== index);

//       setFilePreviews(newPreviews);
//       setValue("images", newFiles);
//     }
//   };

//   const clearAllFiles = () => {
//     if (uploadType === "images") {
//       imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.preview));
//       setImagePreviews([]);
//     } else {
//       setFilePreviews([]);
//     }
//     setValue("images", []);
//   };

//   const validatePrice = (originalPrice, sellingPrice) => {
//     if (originalPrice && sellingPrice) {
//       if (parseFloat(originalPrice) < parseFloat(sellingPrice)) {
//         return "Original price cannot be less than selling price";
//       }
//     }
//     return true;
//   };

//   const onSubmit = async (data) => {
//     if (!token) {
//       Swal.fire("Error", "Please log in to create products", "error");
//       return;
//     }
//     const priceValidation = validatePrice(data.originalPrice, data.price);
//     if (priceValidation !== true) {
//       Swal.fire("Error", priceValidation, "error");
//       return;
//     }

//     if (!data.images || data.images.length === 0) {
//       Swal.fire("Error", `Please select at least one ${uploadType === "images" ? "image" : "file"}`, "error");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const formData = new FormData();

//       formData.append("name", data.name);
//       formData.append("category", data.category);
//       formData.append("subcategory", data.subcategory);
//       formData.append("brand", data.brand || "");
//       formData.append("price", data.price);
//       formData.append("originalPrice", data.originalPrice || "");
//       formData.append("stock", data.stock);
//       formData.append("description", description || "");
//       formData.append("producttype", data.producttype || "");
//       formData.append("imageVisibility", data.imageVisibility || "public");
//       formData.append("uploadType", uploadType); // Send upload type to backend

//       const attrsArray = [];
//       attributes.forEach((attr) => {
//         if (attr.Fieldtype === "checkbox") {
//           const selectedValues = selectedCheckboxes[attr._id] || [];
//           if (selectedValues.length > 0) {
//             attrsArray.push({
//               attribute: attr._id,
//               name: attr.name,
//               value: selectedValues,
//               fieldType: attr.Fieldtype,
//             });
//           }
//         } else {
//           const value = data.attributes?.[attr._id];
//           if (value) {
//             attrsArray.push({
//               attribute: attr._id,
//               name: attr.name,
//               value: [value],
//               fieldType: attr.Fieldtype,
//             });
//           }
//         }
//       });

//       if (attrsArray.length > 0) {
//         formData.append("attributes", JSON.stringify(attrsArray));
//       }

//       const files = getValues("images") || [];
//       for (let file of files) {
//         formData.append("files", file); // Changed from "images" to "files" for generic handling
//       }

//       await uploadFile(
//         PRODUCT_ROUTES.create,
//         formData,
//         `Product created successfully with ${files.length} ${uploadType === "images" ? "images" : "files"}!`,
//         (progressEvent) => {
//           const progress = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );
//           console.log(`Upload Progress: ${progress}%`);
//         }
//       );

//       // Cleanup
//       if (uploadType === "images") {
//         imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.preview));
//         setImagePreviews([]);
//       } else {
//         setFilePreviews([]);
//       }
//       reset();
//       setSelectedCheckboxes({});
//       setDescription("");
//       navigate("/admin-dashboard/products");
//     } catch (error) {
//       console.error("❌ Error creating product:", error);
//       Swal.fire(
//         "Error",
//         "Failed to create product. Please try again.",
//         "error"
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const renderAttributeInput = (attr) => {
//     const isChecked = (value) => {
//       return selectedCheckboxes[attr._id]?.includes(value) || false;
//     };

//     switch (attr.Fieldtype) {
//       case "checkbox":
//         return (
//           <div className="space-y-2">
//             <label className="block font-semibold text-gray-700 mb-2">
//               {attr.name}
//             </label>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//               {attr.values.map((value, index) => (
//                 <label key={index} className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     value={value}
//                     checked={isChecked(value)}
//                     onChange={(e) =>
//                       handleCheckboxChange(attr._id, value, e.target.checked)
//                     }
//                     className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <span className="text-sm text-gray-700">{value}</span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         );

//       case "dropdown":
//       default:
//         return (
//           <div className="space-y-2">
//             <label className="block font-semibold text-gray-700">
//               {attr.name}
//             </label>
//             <select
//               {...register(`attributes.${attr._id}`, {
//                 required: `Please select ${attr.name}`,
//               })}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//             >
//               <option value="">Select {attr.name}</option>
//               {attr.values.map((val, i) => (
//                 <option key={i} value={val}>
//                   {val}
//                 </option>
//               ))}
//             </select>
//             {errors.attributes?.[attr._id] && (
//               <p className="text-red-500 text-sm font-medium">
//                 {errors.attributes[attr._id]?.message}
//               </p>
//             )}
//           </div>
//         );
//     }
//   };

//   const editorConfig = {
//     height: 300,
//     menubar: true,
//     plugins: [
//       "advlist",
//       "autolink",
//       "lists",
//       "link",
//       "image",
//       "charmap",
//       "preview",
//       "anchor",
//       "searchreplace",
//       "visualblocks",
//       "code",
//       "fullscreen",
//       "insertdatetime",
//       "media",
//       "table",
//       "code",
//       "help",
//       "wordcount",
//     ],
//     toolbar:
//       "undo redo | blocks | bold italic underline strikethrough | " +
//       "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
//       "bullist numlist outdent indent | link image media | " +
//       "fontsizeselect fontselect | removeformat | code | help",
//     content_style: `
//       body {
//         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//         font-size: 14px;
//         line-height: 1.6;
//         color: #374151;
//       }
//       h1, h2, h3, h4, h5, h6 {
//         color: #111827;
//         margin-top: 1em;
//         margin-bottom: 0.5em;
//       }
//       h1 { font-size: 2em; }
//       h2 { font-size: 1.5em; }
//       h3 { font-size: 1.25em; }
//       p { margin-bottom: 1em; }
//       ul, ol { padding-left: 2em; }
//       blockquote {
//         border-left: 4px solid #0ea5e9;
//         background-color: #f0f9ff;
//         padding: 1em 1.5em;
//         margin: 1em 0;
//         font-style: italic;
//         color: #1e40af;
//         border-radius: 0 0.5em 0.5em 0;
//       }
//       code {
//         background-color: #f3f4f6;
//         padding: 0.1em 0.3em;
//         border-radius: 0.25em;
//         font-family: 'Courier New', monospace;
//         color: #dc2626;
//       }
//       pre {
//         background-color: #1f2937;
//         color: #f9fafb;
//         padding: 1em;
//         border-radius: 0.375em;
//         overflow-x: auto;
//         margin: 1em 0;
//       }
//       a { color: #0ea5e9; }
//       a:hover { color: #0284c7; }
//       table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
//       table, th, td { border: 1px solid #e5e7eb; }
//       th { background-color: #f8fafc; font-weight: 600; }
//       th, td { padding: 0.75em; text-align: left; }
//       tr:nth-child(even) { background-color: #f9fafb; }

//       .text-red { color: #dc2626; }
//       .text-blue { color: #2563eb; }
//       .text-green { color: #059669; }
//       .text-yellow { color: #d97706; }
//       .text-purple { color: #7c3aed; }

//       .bg-red { background-color: #fef2f2; padding: 0.25em 0.5em; border-radius: 0.25em; }
//       .bg-blue { background-color: #eff6ff; padding: 0.25em 0.5em; border-radius: 0.25em; }
//       .bg-green { background-color: #f0fdf4; padding: 0.25em 0.5em; border-radius: 0.25em; }

//       .text-xs { font-size: 0.75em; }
//       .text-sm { font-size: 0.875em; }
//       .text-base { font-size: 1em; }
//       .text-lg { font-size: 1.125em; }
//       .text-xl { font-size: 1.25em; }

//       .font-light { font-weight: 300; }
//       .font-normal { font-weight: 400; }
//       .font-medium { font-weight: 500; }
//       .font-semibold { font-weight: 600; }
//       .font-bold { font-weight: 700; }

//       .text-left { text-align: left; }
//       .text-center { text-align: center; }
//       .text-right { text-align: right; }
//       .text-justify { text-align: justify; }
//     `,
//     branding: false,
//     promotion: false,
//     paste_data_images: false,
//     automatic_uploads: false,
//     formats: {
//       alignleft: {
//         selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
//         classes: "text-left",
//       },
//       aligncenter: {
//         selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
//         classes: "text-center",
//       },
//       alignright: {
//         selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
//         classes: "text-right",
//       },
//       alignjustify: {
//         selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
//         classes: "text-justify",
//       },
//     },
//     style_formats: [
//       { title: "Heading 1", format: "h1" },
//       { title: "Heading 2", format: "h2" },
//       { title: "Heading 3", format: "h3" },
//       { title: "Heading 4", format: "h4" },
//       { title: "Heading 5", format: "h5" },
//       { title: "Heading 6", format: "h6" },
//       { title: "Paragraph", format: "p" },
//       { title: "Blockquote", format: "blockquote" },
//       { title: "Pre", format: "pre" },
//       {
//         title: "Text Colors",
//         items: [
//           { title: "Red", inline: "span", classes: "text-red" },
//           { title: "Blue", inline: "span", classes: "text-blue" },
//           { title: "Green", inline: "span", classes: "text-green" },
//           { title: "Yellow", inline: "span", classes: "text-yellow" },
//           { title: "Purple", inline: "span", classes: "text-purple" },
//         ],
//       },
//       {
//         title: "Background Colors",
//         items: [
//           { title: "Red Background", inline: "span", classes: "bg-red" },
//           { title: "Blue Background", inline: "span", classes: "bg-blue" },
//           { title: "Green Background", inline: "span", classes: "bg-green" },
//         ],
//       },
//       {
//         title: "Font Sizes",
//         items: [
//           { title: "Extra Small", inline: "span", classes: "text-xs" },
//           { title: "Small", inline: "span", classes: "text-sm" },
//           { title: "Base", inline: "span", classes: "text-base" },
//           { title: "Large", inline: "span", classes: "text-lg" },
//           { title: "Extra Large", inline: "span", classes: "text-xl" },
//         ],
//       },
//       {
//         title: "Font Weights",
//         items: [
//           { title: "Light", inline: "span", classes: "font-light" },
//           { title: "Normal", inline: "span", classes: "font-normal" },
//           { title: "Medium", inline: "span", classes: "font-medium" },
//           { title: "Semibold", inline: "span", classes: "font-semibold" },
//           { title: "Bold", inline: "span", classes: "font-bold" },
//         ],
//       },
//     ],
//   };

//   const isSubmitDisabled = loading || isSubmitting;

//   return (
//     <>
//       <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-4xl mx-auto">
//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="bg-white rounded-lg shadow-sm border-white p-6 space-y-6"
//           >
//             <div className="border-b border-gray-200 pb-4">
//               <h2 className="text-2xl font-bold text-gray-900 text-center">
//                 Add New Product
//               </h2>
//               <p className="text-gray-600 text-center mt-1">
//                 Fill in the details to create a new product
//               </p>
//             </div>
//             <div className="space-y-6">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Basic Information
//               </h3>
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Product Name *
//                 </label>
//                 <input
//                   placeholder="Enter product name"
//                   {...register("name", { required: "Name is required" })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                 />
//                 {errors.name && (
//                   <p className="text-red-500 text-sm font-medium">
//                     {errors.name.message}
//                   </p>
//                 )}
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Category *
//                   </label>
//                   <select
//                     {...register("category", {
//                       required: "Category is required",
//                     })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((cat) => (
//                       <option key={cat._id} value={cat._id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
//                   {errors.category && (
//                     <p className="text-red-500 text-sm font-medium">
//                       {errors.category.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Subcategory *
//                   </label>
//                   <select
//                     {...register("subcategory", {
//                       required: "Subcategory is required",
//                     })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     disabled={!selectedCategory || subcategories.length === 0}
//                   >
//                     <option value="">
//                       {!selectedCategory
//                         ? "Select a category first"
//                         : subcategories.length === 0
//                         ? "No subcategories available"
//                         : "Select Subcategory"}
//                     </option>
//                     {subcategories.map((sub) => (
//                       <option key={sub._id} value={sub._id}>
//                         {sub.name}
//                       </option>
//                     ))}
//                   </select>
//                   {errors.subcategory && (
//                     <p className="text-red-500 text-sm font-medium">
//                       {errors.subcategory.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Brand
//                 </label>
//                 <input
//                   placeholder="Enter brand name"
//                   {...register("brand")}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                 />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Original Price
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     placeholder="0.00"
//                     {...register("originalPrice", {
//                       min: { value: 0, message: "Price must be positive" },
//                     })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   />
//                   {errors.originalPrice && (
//                     <p className="text-red-500 text-sm font-medium">
//                       {errors.originalPrice.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Selling Price *
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     placeholder="0.00"
//                     {...register("price", {
//                       required: "Price is required",
//                       min: { value: 0, message: "Price must be positive" },
//                     })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   />
//                   {errors.price && (
//                     <p className="text-red-500 text-sm font-medium">
//                       {errors.price.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Discount
//                   </label>
//                   <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
//                     <p
//                       className={`text-sm font-medium ${
//                         discountPercentage > 0
//                           ? "text-green-600"
//                           : "text-gray-500"
//                       }`}
//                     >
//                       {discountPercentage > 0
//                         ? `${discountPercentage}% OFF`
//                         : "No discount"}
//                     </p>
//                     {discountPercentage > 0 && (
//                       <p className="text-xs text-gray-600 mt-1">
//                         Save ₹{discountAmount.toFixed(2)}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Stock *
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     placeholder="0"
//                     {...register("stock", {
//                       required: "Stock is required",
//                       min: { value: 0, message: "Stock must be positive" },
//                     })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   />
//                   {errors.stock && (
//                     <p className="text-red-500 text-sm font-medium">
//                       {errors.stock.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Product Type
//                   </label>
//                   <select
//                     {...register("producttype")}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     defaultValue=""
//                   >
//                     <option value="" disabled>
//                       Select type
//                     </option>
//                     <option value="physical">Physical</option>
//                     <option value="digital">Digital</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Image Visibility
//                 </label>
//                 <select
//                   {...register("imageVisibility")}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   defaultValue="public"
//                 >
//                   <option value="public">Public (Anyone can view)</option>
//                   <option value="private">Private (Restricted access)</option>
//                 </select>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {imageVisibility === "private"
//                     ? "🔒 Files will be stored privately with restricted access"
//                     : "🌐 Files will be publicly accessible to everyone"}
//                 </p>
//               </div>
//             </div>
//             {attributes.length > 0 && (
//               <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Product Attributes
//                 </h3>
//                 {attributes.map((attr) => (
//                   <div key={attr._id}>{renderAttributeInput(attr)}</div>
//                 ))}
//               </div>
//             )}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 Description
//               </label>
//               <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
//                 <Editor
//                   value={description}
//                   onEditorChange={(newValue) => setDescription(newValue)}
//                   init={editorConfig}
//                   apiKey={"5vdp2934fu4e3s9ppww5is091de5hxrjv2ju7lh5unb8ycvd"}
//                 />
//               </div>
//               <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
//                 <span>
//                   💡 <strong>Formatting Tips:</strong>
//                 </span>
//                 <span>• Use headings for structure</span>
//                 <span>• Create lists for features</span>
//                 <span>• Add links for references</span>
//                 <span>• Use tables for specifications</span>
//                 <span>• Apply colors and formatting from menu</span>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Product Files
//               </h3>

//               {/* Upload Type Selection */}
//               <div className="flex space-x-4 mb-4">
//                 <button
//                   type="button"
//                   onClick={() => setUploadType("images")}
//                   className={`px-4 py-2 rounded-lg transition-colors ${
//                     uploadType === "images"
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   📸 Upload Images
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setUploadType("files")}
//                   className={`px-4 py-2 rounded-lg transition-colors ${
//                     uploadType === "files"
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   📁 Upload Files
//                 </button>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   {uploadType === "images"
//                     ? `Upload Images (${imagePreviews.length}/5)`
//                     : `Upload Files (${filePreviews.length}/5)`
//                   }
//                 </label>

//                 {/* Image Previews */}
//                 {uploadType === "images" && imagePreviews.length > 0 && (
//                   <div className="mb-4">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-sm text-gray-600">
//                         {imagePreviews.length} image(s) selected
//                       </span>
//                       <button
//                         type="button"
//                         onClick={clearAllFiles}
//                         className="text-sm text-red-600 hover:text-red-800 font-medium"
//                       >
//                         Clear All
//                       </button>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//                       {imagePreviews.map((preview, index) => (
//                         <div key={index} className="relative group">
//                           <img
//                             src={preview.preview}
//                             alt={`Preview ${index + 1}`}
//                             className="w-full h-24 object-cover rounded-lg border shadow-sm"
//                           />
//                           <span className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
//                             {index + 1}
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => removeFile(index)}
//                             className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
//                             title="Remove image"
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* File Previews */}
//                 {uploadType === "files" && filePreviews.length > 0 && (
//                   <div className="mb-4">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-sm text-gray-600">
//                         {filePreviews.length} file(s) selected
//                       </span>
//                       <button
//                         type="button"
//                         onClick={clearAllFiles}
//                         className="text-sm text-red-600 hover:text-red-800 font-medium"
//                       >
//                         Clear All
//                       </button>
//                     </div>
//                     <div className="space-y-2">
//                       {filePreviews.map((file, index) => (
//                         <div
//                           key={index}
//                           className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
//                         >
//                           <div className="flex items-center space-x-3">
//                             <span className="text-xl">{file.icon}</span>
//                             <div>
//                               <p className="text-sm font-medium text-gray-800">
//                                 {file.name}
//                               </p>
//                               <p className="text-xs text-gray-500">
//                                 {file.size} • {file.type}
//                               </p>
//                             </div>
//                           </div>
//                           <button
//                             type="button"
//                             onClick={() => removeFile(index)}
//                             className="text-red-500 hover:text-red-700 transition-colors"
//                             title="Remove file"
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
//                   <input
//                     type="file"
//                     multiple
//                     accept={uploadType === "images"
//                       ? "image/jpeg, image/jpg, image/png, image/webp"
//                       : ".zip,.pdf,.doc,.docx,.txt,.xls,.xlsx"
//                     }
//                     onChange={handleImageChange}
//                     className="hidden"
//                     id="file-upload"
//                   />
//                   <label
//                     htmlFor="file-upload"
//                     className="cursor-pointer block"
//                   >
//                     <div className="flex flex-col items-center justify-center space-y-2">
//                       <svg
//                         className="w-8 h-8 text-gray-400"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                         />
//                       </svg>
//                       <span className="text-sm text-gray-600">
//                         Click to upload {uploadType} or drag and drop
//                       </span>
//                       <span className="text-xs text-gray-500">
//                         {uploadType === "images"
//                           ? "PNG, JPG, WebP up to 10MB each"
//                           : "ZIP, PDF, DOC, DOCX, TXT, XLS, XLSX up to 50MB each"
//                         }
//                       </span>
//                     </div>
//                   </label>
//                 </div>

//                 <p className="text-sm text-gray-500">
//                   Maximum 5 {uploadType} allowed.{" "}
//                   {(uploadType === "images" ? imagePreviews.length : filePreviews.length) > 0 &&
//                     ` You can add ${5 - (uploadType === "images" ? imagePreviews.length : filePreviews.length)} more.`}
//                 </p>
//               </div>
//             </div>
//             <div className="pt-4 border-t border-gray-200">
//               <button
//                 type="submit"
//                 disabled={isSubmitDisabled}
//                 className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
//                   isSubmitDisabled
//                     ? "bg-gray-400 cursor-not-allowed text-gray-700"
//                     : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
//                 }`}
//               >
//                 {isSubmitDisabled ? (
//                   <div className="flex items-center justify-center space-x-2">
//                     <svg
//                       className="animate-spin h-4 w-4 text-white"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     <span>Creating Product...</span>
//                   </div>
//                 ) : (
//                   "Create Product"
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }

// // import { useEffect, useState } from "react";
// // import { useForm } from "react-hook-form";
// // import { useSelector } from "react-redux";
// // import { useNavigate } from "react-router-dom";
// // import Swal from "sweetalert2";
// // import useFetchData from "../../hooks/useFetchData";
// // import {
// //   ATTRIBUTE_ROUTES,
// //   CATEGORY_ROUTES,
// //   PRODUCT_ROUTES,
// // } from "../../../utils/apiRoute";
// // import { Editor } from "@tinymce/tinymce-react";

// // export default function ProductForm() {
// //   const {
// //     register,
// //     handleSubmit,
// //     watch,
// //     reset,
// //     setValue,
// //     getValues,
// //     formState: { errors },
// //   } = useForm();

// //   const [categories, setCategories] = useState([]);
// //   const [subcategories, setSubcategories] = useState([]);
// //   const [attributes, setAttributes] = useState([]);
// //   const [selectedCheckboxes, setSelectedCheckboxes] = useState({});
// //   const [imagePreviews, setImagePreviews] = useState([]);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [description, setDescription] = useState("");

// //   const selectedCategory = watch("category");
// //   const selectedSubcategory = watch("subcategory");
// //   const price = watch("price");
// //   const originalPrice = watch("originalPrice");
// //   const imageVisibility = watch("imageVisibility", "public");

// //   const token = useSelector((state) => state.auth.token);
// //   const navigate = useNavigate();

// //   const { fetchData, uploadFile, loading } = useFetchData(token);
// //   const discountPercentage =
// //     originalPrice && price && originalPrice > price
// //       ? Math.round(((originalPrice - price) / originalPrice) * 100)
// //       : 0;

// //   const discountAmount =
// //     originalPrice && price && originalPrice > price ? originalPrice - price : 0;

// //   useEffect(() => {
// //     const fetchCategories = async () => {
// //       await fetchData(CATEGORY_ROUTES.all, (data) => {
// //         if (data.success) {
// //           setCategories(data.categories || []);
// //         }
// //       });
// //     };
// //     fetchCategories();
// //   }, []);

// //   useEffect(() => {
// //     if (selectedCategory) {
// //       const fetchSubcategories = async () => {
// //         try {
// //           const endpoints = [
// //             `/subcategories/category/${selectedCategory}`,
// //             `/subcategories?category=${selectedCategory}`,
// //             `/categories/${selectedCategory}/subcategories`,
// //           ];

// //           let subcategoriesData = [];

// //           for (const endpoint of endpoints) {
// //             try {
// //               await fetchData(endpoint, (data) => {
// //                 if (data.success) {
// //                   subcategoriesData =
// //                     data.subcategories || data.subcateg || data.data || [];
// //                 }
// //               });
// //               if (subcategoriesData.length > 0) break;
// //             } catch (error) {
// //               console.log(`Trying next endpoint...`);
// //               continue;
// //             }
// //           }
// //           if (subcategoriesData.length === 0 && categories.length > 0) {
// //             const selectedCat = categories.find(
// //               (cat) => cat._id === selectedCategory
// //             );
// //             if (selectedCat && selectedCat.subcategories) {
// //               subcategoriesData = selectedCat.subcategories;
// //             }
// //           }

// //           setSubcategories(subcategoriesData);
// //         } catch (error) {
// //           console.error("Error fetching subcategories:", error);
// //           setSubcategories([]);
// //         }
// //       };
// //       fetchSubcategories();
// //     } else {
// //       setSubcategories([]);
// //       setAttributes([]);
// //     }
// //   }, [selectedCategory, categories]);

// //   useEffect(() => {
// //     if (selectedSubcategory) {
// //       const fetchAttributes = async () => {
// //         await fetchData(ATTRIBUTE_ROUTES.all, (data) => {
// //           if (data.success) {
// //             const allAttrs = data.data || data.attributes || [];
// //             const filtered = allAttrs.filter(
// //               (attr) =>
// //                 attr.subcategory?._id === selectedSubcategory ||
// //                 attr.subcategory === selectedSubcategory
// //             );
// //             setAttributes(filtered);
// //             const checkboxState = {};
// //             filtered.forEach((attr) => {
// //               if (attr.Fieldtype === "checkbox") {
// //                 checkboxState[attr._id] = [];
// //               }
// //             });
// //             setSelectedCheckboxes(checkboxState);
// //           }
// //         });
// //       };
// //       fetchAttributes();
// //     } else {
// //       setAttributes([]);
// //       setSelectedCheckboxes({});
// //     }
// //   }, [selectedSubcategory]);

// //   const handleCheckboxChange = (attributeId, value, isChecked) => {
// //     setSelectedCheckboxes((prev) => {
// //       const newState = { ...prev };

// //       if (isChecked) {
// //         if (!newState[attributeId]?.includes(value)) {
// //           newState[attributeId] = [...(newState[attributeId] || []), value];
// //         }
// //       } else {
// //         newState[attributeId] = (newState[attributeId] || []).filter(
// //           (v) => v !== value
// //         );

// //         if (newState[attributeId].length === 0) {
// //           delete newState[attributeId];
// //         }
// //       }

// //       return newState;
// //     });
// //   };

// //   const handleImageChange = (e) => {
// //     const newFiles = Array.from(e.target.files);

// //     const currentFiles = getValues("images") || [];
// //     const totalFiles = currentFiles.length + newFiles.length;

// //     if (totalFiles > 5) {
// //       Swal.fire(
// //         "Maximum Images Exceeded",
// //         `Maximum 5 images allowed. You already have ${currentFiles.length} images selected.`,
// //         "warning"
// //       );
// //       e.target.value = "";
// //       return;
// //     }

// //     const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// //     const invalidFiles = newFiles.filter(
// //       (file) => !validTypes.includes(file.type)
// //     );

// //     if (invalidFiles.length > 0) {
// //       Swal.fire("Error", "Only JPG, PNG, and WebP images are allowed", "error");
// //       e.target.value = "";
// //       return;
// //     }

// //     const oversizedFiles = newFiles.filter(
// //       (file) => file.size > 10 * 1024 * 1024
// //     );
// //     if (oversizedFiles.length > 0) {
// //       Swal.fire("Error", "File size should be less than 10MB", "error");
// //       e.target.value = "";
// //       return;
// //     }

// //     const newPreviews = newFiles.map((file) => ({
// //       file,
// //       preview: URL.createObjectURL(file),
// //     }));
// //     const updatedFiles = [...currentFiles, ...newFiles];
// //     const updatedPreviews = [...imagePreviews, ...newPreviews];

// //     setImagePreviews(updatedPreviews);
// //     setValue("images", updatedFiles);

// //     e.target.value = "";
// //   };

// //   const removeImage = (index) => {
// //     URL.revokeObjectURL(imagePreviews[index].preview);

// //     const newPreviews = imagePreviews.filter((_, i) => i !== index);
// //     const currentFiles = getValues("images") || [];
// //     const newFiles = currentFiles.filter((_, i) => i !== index);

// //     setImagePreviews(newPreviews);
// //     setValue("images", newFiles);
// //   };

// //   const clearAllImages = () => {
// //     imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.preview));
// //     setImagePreviews([]);
// //     setValue("images", []);
// //   };

// //   const validatePrice = (originalPrice, sellingPrice) => {
// //     if (originalPrice && sellingPrice) {
// //       if (parseFloat(originalPrice) < parseFloat(sellingPrice)) {
// //         return "Original price cannot be less than selling price";
// //       }
// //     }
// //     return true;
// //   };

// //   const onSubmit = async (data) => {
// //     if (!token) {
// //       Swal.fire("Error", "Please log in to create products", "error");
// //       return;
// //     }
// //     const priceValidation = validatePrice(data.originalPrice, data.price);
// //     if (priceValidation !== true) {
// //       Swal.fire("Error", priceValidation, "error");
// //       return;
// //     }

// //     if (!data.images || data.images.length === 0) {
// //       Swal.fire("Error", "Please select at least one image", "error");
// //       return;
// //     }

// //     setIsSubmitting(true);

// //     try {
// //       const formData = new FormData();

// //       formData.append("name", data.name);
// //       formData.append("category", data.category);
// //       formData.append("subcategory", data.subcategory);
// //       formData.append("brand", data.brand || "");
// //       formData.append("price", data.price);
// //       formData.append("originalPrice", data.originalPrice || "");
// //       formData.append("stock", data.stock);
// //       formData.append("description", description || "");
// //       formData.append("producttype", data.producttype || "");
// //       formData.append("imageVisibility", data.imageVisibility || "public");

// //       const attrsArray = [];
// //       attributes.forEach((attr) => {
// //         if (attr.Fieldtype === "checkbox") {
// //           const selectedValues = selectedCheckboxes[attr._id] || [];
// //           if (selectedValues.length > 0) {
// //             attrsArray.push({
// //               attribute: attr._id,
// //               name: attr.name,
// //               value: selectedValues,
// //               fieldType: attr.Fieldtype,
// //             });
// //           }
// //         } else {
// //           const value = data.attributes?.[attr._id];
// //           if (value) {
// //             attrsArray.push({
// //               attribute: attr._id,
// //               name: attr.name,
// //               value: [value],
// //               fieldType: attr.Fieldtype,
// //             });
// //           }
// //         }
// //       });

// //       if (attrsArray.length > 0) {
// //         formData.append("attributes", JSON.stringify(attrsArray));
// //       }

// //       const images = getValues("images") || [];
// //       for (let file of images) {
// //         formData.append("images", file);
// //       }

// //       await uploadFile(
// //         PRODUCT_ROUTES.create,
// //         formData,
// //         `Product created successfully with ${images.length} ${data.imageVisibility} images!`,
// //         (progressEvent) => {
// //           const progress = Math.round(
// //             (progressEvent.loaded * 100) / progressEvent.total
// //           );
// //           console.log(`Upload Progress: ${progress}%`);
// //         }
// //       );

// //       imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.preview));
// //       reset();
// //       setSelectedCheckboxes({});
// //       setImagePreviews([]);
// //       setDescription("");
// //       navigate("/admin-dashboard/products");
// //     } catch (error) {
// //       console.error("❌ Error creating product:", error);
// //       Swal.fire(
// //         "Error",
// //         "Failed to create product. Please try again.",
// //         "error"
// //       );
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   const renderAttributeInput = (attr) => {
// //     const isChecked = (value) => {
// //       return selectedCheckboxes[attr._id]?.includes(value) || false;
// //     };

// //     switch (attr.Fieldtype) {
// //       case "checkbox":
// //         return (
// //           <div className="space-y-2">
// //             <label className="block font-semibold text-gray-700 mb-2">
// //               {attr.name}
// //             </label>
// //             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
// //               {attr.values.map((value, index) => (
// //                 <label key={index} className="flex items-center space-x-2">
// //                   <input
// //                     type="checkbox"
// //                     value={value}
// //                     checked={isChecked(value)}
// //                     onChange={(e) =>
// //                       handleCheckboxChange(attr._id, value, e.target.checked)
// //                     }
// //                     className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
// //                   />
// //                   <span className="text-sm text-gray-700">{value}</span>
// //                 </label>
// //               ))}
// //             </div>
// //           </div>
// //         );

// //       case "dropdown":
// //       default:
// //         return (
// //           <div className="space-y-2">
// //             <label className="block font-semibold text-gray-700">
// //               {attr.name}
// //             </label>
// //             <select
// //               {...register(`attributes.${attr._id}`, {
// //                 required: `Please select ${attr.name}`,
// //               })}
// //               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// //             >
// //               <option value="">Select {attr.name}</option>
// //               {attr.values.map((val, i) => (
// //                 <option key={i} value={val}>
// //                   {val}
// //                 </option>
// //               ))}
// //             </select>
// //             {errors.attributes?.[attr._id] && (
// //               <p className="text-red-500 text-sm font-medium">
// //                 {errors.attributes[attr._id]?.message}
// //               </p>
// //             )}
// //           </div>
// //         );
// //     }
// //   };

// //   const editorConfig = {
// //     height: 300,
// //     menubar: true,
// //     plugins: [
// //       "advlist",
// //       "autolink",
// //       "lists",
// //       "link",
// //       "image",
// //       "charmap",
// //       "preview",
// //       "anchor",
// //       "searchreplace",
// //       "visualblocks",
// //       "code",
// //       "fullscreen",
// //       "insertdatetime",
// //       "media",
// //       "table",
// //       "code",
// //       "help",
// //       "wordcount",
// //     ],
// //     toolbar:
// //       "undo redo | blocks | bold italic underline strikethrough | " +
// //       "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
// //       "bullist numlist outdent indent | link image media | " +
// //       "fontsizeselect fontselect | removeformat | code | help",
// //     content_style: `
// //       body {
// //         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
// //         font-size: 14px;
// //         line-height: 1.6;
// //         color: #374151;
// //       }
// //       h1, h2, h3, h4, h5, h6 {
// //         color: #111827;
// //         margin-top: 1em;
// //         margin-bottom: 0.5em;
// //       }
// //       h1 { font-size: 2em; }
// //       h2 { font-size: 1.5em; }
// //       h3 { font-size: 1.25em; }
// //       p { margin-bottom: 1em; }
// //       ul, ol { padding-left: 2em; }
// //       blockquote {
// //         border-left: 4px solid #0ea5e9;
// //         background-color: #f0f9ff;
// //         padding: 1em 1.5em;
// //         margin: 1em 0;
// //         font-style: italic;
// //         color: #1e40af;
// //         border-radius: 0 0.5em 0.5em 0;
// //       }
// //       code {
// //         background-color: #f3f4f6;
// //         padding: 0.1em 0.3em;
// //         border-radius: 0.25em;
// //         font-family: 'Courier New', monospace;
// //         color: #dc2626;
// //       }
// //       pre {
// //         background-color: #1f2937;
// //         color: #f9fafb;
// //         padding: 1em;
// //         border-radius: 0.375em;
// //         overflow-x: auto;
// //         margin: 1em 0;
// //       }
// //       a { color: #0ea5e9; }
// //       a:hover { color: #0284c7; }
// //       table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
// //       table, th, td { border: 1px solid #e5e7eb; }
// //       th { background-color: #f8fafc; font-weight: 600; }
// //       th, td { padding: 0.75em; text-align: left; }
// //       tr:nth-child(even) { background-color: #f9fafb; }

// //       /* Custom classes for product description */
// //       .text-red { color: #dc2626; }
// //       .text-blue { color: #2563eb; }
// //       .text-green { color: #059669; }
// //       .text-yellow { color: #d97706; }
// //       .text-purple { color: #7c3aed; }

// //       .bg-red { background-color: #fef2f2; padding: 0.25em 0.5em; border-radius: 0.25em; }
// //       .bg-blue { background-color: #eff6ff; padding: 0.25em 0.5em; border-radius: 0.25em; }
// //       .bg-green { background-color: #f0fdf4; padding: 0.25em 0.5em; border-radius: 0.25em; }

// //       .text-xs { font-size: 0.75em; }
// //       .text-sm { font-size: 0.875em; }
// //       .text-base { font-size: 1em; }
// //       .text-lg { font-size: 1.125em; }
// //       .text-xl { font-size: 1.25em; }

// //       .font-light { font-weight: 300; }
// //       .font-normal { font-weight: 400; }
// //       .font-medium { font-weight: 500; }
// //       .font-semibold { font-weight: 600; }
// //       .font-bold { font-weight: 700; }

// //       .text-left { text-align: left; }
// //       .text-center { text-align: center; }
// //       .text-right { text-align: right; }
// //       .text-justify { text-align: justify; }
// //     `,
// //     branding: false,
// //     promotion: false,
// //     paste_data_images: false,
// //     automatic_uploads: false,
// //     formats: {
// //       alignleft: {
// //         selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
// //         classes: "text-left",
// //       },
// //       aligncenter: {
// //         selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
// //         classes: "text-center",
// //       },
// //       alignright: {
// //         selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
// //         classes: "text-right",
// //       },
// //       alignjustify: {
// //         selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
// //         classes: "text-justify",
// //       },
// //     },
// //     style_formats: [
// //       { title: "Heading 1", format: "h1" },
// //       { title: "Heading 2", format: "h2" },
// //       { title: "Heading 3", format: "h3" },
// //       { title: "Heading 4", format: "h4" },
// //       { title: "Heading 5", format: "h5" },
// //       { title: "Heading 6", format: "h6" },
// //       { title: "Paragraph", format: "p" },
// //       { title: "Blockquote", format: "blockquote" },
// //       { title: "Pre", format: "pre" },
// //       {
// //         title: "Text Colors",
// //         items: [
// //           { title: "Red", inline: "span", classes: "text-red" },
// //           { title: "Blue", inline: "span", classes: "text-blue" },
// //           { title: "Green", inline: "span", classes: "text-green" },
// //           { title: "Yellow", inline: "span", classes: "text-yellow" },
// //           { title: "Purple", inline: "span", classes: "text-purple" },
// //         ],
// //       },
// //       {
// //         title: "Background Colors",
// //         items: [
// //           { title: "Red Background", inline: "span", classes: "bg-red" },
// //           { title: "Blue Background", inline: "span", classes: "bg-blue" },
// //           { title: "Green Background", inline: "span", classes: "bg-green" },
// //         ],
// //       },
// //       {
// //         title: "Font Sizes",
// //         items: [
// //           { title: "Extra Small", inline: "span", classes: "text-xs" },
// //           { title: "Small", inline: "span", classes: "text-sm" },
// //           { title: "Base", inline: "span", classes: "text-base" },
// //           { title: "Large", inline: "span", classes: "text-lg" },
// //           { title: "Extra Large", inline: "span", classes: "text-xl" },
// //         ],
// //       },
// //       {
// //         title: "Font Weights",
// //         items: [
// //           { title: "Light", inline: "span", classes: "font-light" },
// //           { title: "Normal", inline: "span", classes: "font-normal" },
// //           { title: "Medium", inline: "span", classes: "font-medium" },
// //           { title: "Semibold", inline: "span", classes: "font-semibold" },
// //           { title: "Bold", inline: "span", classes: "font-bold" },
// //         ],
// //       },
// //     ],
// //   };

// //   const isSubmitDisabled = loading || isSubmitting;

// //   return (
// //     <>
// //       <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
// //         <div className="max-w-4xl mx-auto">
// //           <form
// //             onSubmit={handleSubmit(onSubmit)}
// //             className="bg-white rounded-lg shadow-sm border-white p-6 space-y-6"
// //           >
// //             <div className="border-b border-gray-200 pb-4">
// //               <h2 className="text-2xl font-bold text-gray-900 text-center">
// //                 Add New Product
// //               </h2>
// //               <p className="text-gray-600 text-center mt-1">
// //                 Fill in the details to create a new product
// //               </p>
// //             </div>
// //             <div className="space-y-6">
// //               <h3 className="text-lg font-semibold text-gray-900">
// //                 Basic Information
// //               </h3>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">
// //                   Product Name *
// //                 </label>
// //                 <input
// //                   placeholder="Enter product name"
// //                   {...register("name", { required: "Name is required" })}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// //                 />
// //                 {errors.name && (
// //                   <p className="text-red-500 text-sm font-medium">
// //                     {errors.name.message}
// //                   </p>
// //                 )}
// //               </div>
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div className="space-y-2">
// //                   <label className="block text-sm font-medium text-gray-700">
// //                     Category *
// //                   </label>
// //                   <select
// //                     {...register("category", {
// //                       required: "Category is required",
// //                     })}
// //                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// //                   >
// //                     <option value="">Select Category</option>
// //                     {categories.map((cat) => (
// //                       <option key={cat._id} value={cat._id}>
// //                         {cat.name}
// //                       </option>
// //                     ))}
// //                   </select>
// //                   {errors.category && (
// //                     <p className="text-red-500 text-sm font-medium">
// //                       {errors.category.message}
// //                     </p>
// //                   )}
// //                 </div>
// //                 <div className="space-y-2">
// //                   <label className="block text-sm font-medium text-gray-700">
// //                     Subcategory *
// //                   </label>
// //                   <select
// //                     {...register("subcategory", {
// //                       required: "Subcategory is required",
// //                     })}
// //                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// //                     disabled={!selectedCategory || subcategories.length === 0}
// //                   >
// //                     <option value="">
// //                       {!selectedCategory
// //                         ? "Select a category first"
// //                         : subcategories.length === 0
// //                         ? "No subcategories available"
// //                         : "Select Subcategory"}
// //                     </option>
// //                     {subcategories.map((sub) => (
// //                       <option key={sub._id} value={sub._id}>
// //                         {sub.name}
// //                       </option>
// //                     ))}
// //                   </select>
// //                   {errors.subcategory && (
// //                     <p className="text-red-500 text-sm font-medium">
// //                       {errors.subcategory.message}
// //                     </p>
// //                   )}
// //                 </div>
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">
// //                   Brand
// //                 </label>
// //                 <input
// //                   placeholder="Enter brand name"
// //                   {...register("brand")}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// //                 />
// //               </div>
// //               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                 <div className="space-y-2">
// //                   <label className="block text-sm font-medium text-gray-700">
// //                     Original Price
// //                   </label>
// //                   <input
// //                     type="number"
// //                     step="0.01"
// //                     min="0"
// //                     placeholder="0.00"
// //                     {...register("originalPrice", {
// //                       min: { value: 0, message: "Price must be positive" },
// //                     })}
// //                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// //                   />
// //                   {errors.originalPrice && (
// //                     <p className="text-red-500 text-sm font-medium">
// //                       {errors.originalPrice.message}
// //                     </p>
// //                   )}
// //                 </div>
// //                 <div className="space-y-2">
// //                   <label className="block text-sm font-medium text-gray-700">
// //                     Selling Price *
// //                   </label>
// //                   <input
// //                     type="number"
// //                     step="0.01"
// //                     min="0"
// //                     placeholder="0.00"
// //                     {...register("price", {
// //                       required: "Price is required",
// //                       min: { value: 0, message: "Price must be positive" },
// //                     })}
// //                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// //                   />
// //                   {errors.price && (
// //                     <p className="text-red-500 text-sm font-medium">
// //                       {errors.price.message}
// //                     </p>
// //                   )}
// //                 </div>
// //                 <div className="space-y-2">
// //                   <label className="block text-sm font-medium text-gray-700">
// //                     Discount
// //                   </label>
// //                   <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
// //                     <p
// //                       className={`text-sm font-medium ${
// //                         discountPercentage > 0
// //                           ? "text-green-600"
// //                           : "text-gray-500"
// //                       }`}
// //                     >
// //                       {discountPercentage > 0
// //                         ? `${discountPercentage}% OFF`
// //                         : "No discount"}
// //                     </p>
// //                     {discountPercentage > 0 && (
// //                       <p className="text-xs text-gray-600 mt-1">
// //                         Save ₹{discountAmount.toFixed(2)}
// //                       </p>
// //                     )}
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div className="space-y-2">
// //                   <label className="block text-sm font-medium text-gray-700">
// //                     Stock *
// //                   </label>
// //                   <input
// //                     type="number"
// //                     min="0"
// //                     placeholder="0"
// //                     {...register("stock", {
// //                       required: "Stock is required",
// //                       min: { value: 0, message: "Stock must be positive" },
// //                     })}
// //                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// //                   />
// //                   {errors.stock && (
// //                     <p className="text-red-500 text-sm font-medium">
// //                       {errors.stock.message}
// //                     </p>
// //                   )}
// //                 </div>
// //                 <div className="space-y-2">
// //                   <label className="block text-sm font-medium text-gray-700">
// //                     Product Type
// //                   </label>
// //                   <select
// //                     {...register("producttype")}
// //                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// //                     defaultValue=""
// //                   >
// //                     <option value="" disabled>
// //                       Select type
// //                     </option>
// //                     <option value="physical">Physical</option>
// //                     <option value="digital">Digital</option>
// //                   </select>
// //                 </div>
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">
// //                   Image Visibility
// //                 </label>
// //                 <select
// //                   {...register("imageVisibility")}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// //                   defaultValue="public"
// //                 >
// //                   <option value="public">Public (Anyone can view)</option>
// //                   <option value="private">Private (Restricted access)</option>
// //                 </select>
// //                 <p className="text-sm text-gray-500 mt-1">
// //                   {imageVisibility === "private"
// //                     ? "🔒 Images will be stored privately with restricted access"
// //                     : "🌐 Images will be publicly accessible to everyone"}
// //                 </p>
// //               </div>
// //             </div>
// //             {attributes.length > 0 && (
// //               <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
// //                 <h3 className="text-lg font-semibold text-gray-900">
// //                   Product Attributes
// //                 </h3>
// //                 {attributes.map((attr) => (
// //                   <div key={attr._id}>{renderAttributeInput(attr)}</div>
// //                 ))}
// //               </div>
// //             )}
// //             <div className="space-y-2">
// //               <label className="block text-sm font-medium text-gray-700">
// //                 Description
// //               </label>
// //               <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
// //                 <Editor
// //                   value={description}
// //                   onEditorChange={(newValue) => setDescription(newValue)}
// //                   init={editorConfig}
// //                   apiKey="r57z7qpiukxw2dgybheabhvqtuyla0n0io0luqgm8zta35gh"
// //                 />
// //               </div>
// //               <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
// //                 <span>
// //                   💡 <strong>Formatting Tips:</strong>
// //                 </span>
// //                 <span>• Use headings for structure</span>
// //                 <span>• Create lists for features</span>
// //                 <span>• Add links for references</span>
// //                 <span>• Use tables for specifications</span>
// //                 <span>• Apply colors and formatting from menu</span>
// //               </div>
// //             </div>

// //             <div className="space-y-4">
// //               <h3 className="text-lg font-semibold text-gray-900">
// //                 Product Images
// //               </h3>

// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Upload Images ({imagePreviews.length}/5)
// //                 </label>
// //                 {imagePreviews.length > 0 && (
// //                   <div className="mb-4">
// //                     <div className="flex justify-between items-center mb-2">
// //                       <span className="text-sm text-gray-600">
// //                         {imagePreviews.length} image(s) selected
// //                       </span>
// //                       <button
// //                         type="button"
// //                         onClick={clearAllImages}
// //                         className="text-sm text-red-600 hover:text-red-800 font-medium"
// //                       >
// //                         Clear All
// //                       </button>
// //                     </div>
// //                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
// //                       {imagePreviews.map((preview, index) => (
// //                         <div key={index} className="relative group">
// //                           <img
// //                             src={preview.preview}
// //                             alt={`Preview ${index + 1}`}
// //                             className="w-full h-24 object-cover rounded-lg border shadow-sm"
// //                           />
// //                           <span className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
// //                             {index + 1}
// //                           </span>
// //                           <button
// //                             type="button"
// //                             onClick={() => removeImage(index)}
// //                             className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
// //                             title="Remove image"
// //                           >
// //                             ×
// //                           </button>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 )}
// //                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
// //                   <input
// //                     type="file"
// //                     multiple
// //                     accept="image/jpeg, image/jpg, image/png, image/webp"
// //                     onChange={handleImageChange}
// //                     className="hidden"
// //                     id="image-upload"
// //                   />
// //                   <label
// //                     htmlFor="image-upload"
// //                     className="cursor-pointer block"
// //                   >
// //                     <div className="flex flex-col items-center justify-center space-y-2">
// //                       <svg
// //                         className="w-8 h-8 text-gray-400"
// //                         fill="none"
// //                         stroke="currentColor"
// //                         viewBox="0 0 24 24"
// //                       >
// //                         <path
// //                           strokeLinecap="round"
// //                           strokeLinejoin="round"
// //                           strokeWidth={2}
// //                           d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
// //                         />
// //                       </svg>
// //                       <span className="text-sm text-gray-600">
// //                         Click to upload images or drag and drop
// //                       </span>
// //                       <span className="text-xs text-gray-500">
// //                         PNG, JPG, WebP up to 10MB each
// //                       </span>
// //                     </div>
// //                   </label>
// //                 </div>

// //                 <p className="text-sm text-gray-500">
// //                   Maximum 5 images allowed.{" "}
// //                   {imagePreviews.length > 0 &&
// //                     ` You can add ${5 - imagePreviews.length} more.`}
// //                 </p>
// //               </div>
// //             </div>
// //             <div className="pt-4 border-t border-gray-200">
// //               <button
// //                 type="submit"
// //                 disabled={isSubmitDisabled}
// //                 className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
// //                   isSubmitDisabled
// //                     ? "bg-gray-400 cursor-not-allowed text-gray-700"
// //                     : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
// //                 }`}
// //               >
// //                 {isSubmitDisabled ? (
// //                   <div className="flex items-center justify-center space-x-2">
// //                     <svg
// //                       className="animate-spin h-4 w-4 text-white"
// //                       fill="none"
// //                       viewBox="0 0 24 24"
// //                     >
// //                       <circle
// //                         className="opacity-25"
// //                         cx="12"
// //                         cy="12"
// //                         r="10"
// //                         stroke="currentColor"
// //                         strokeWidth="4"
// //                       ></circle>
// //                       <path
// //                         className="opacity-75"
// //                         fill="currentColor"
// //                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
// //                       ></path>
// //                     </svg>
// //                     <span>Creating Product...</span>
// //                   </div>
// //                 ) : (
// //                   "Create Product"
// //                 )}
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       </div>
// //     </>
// //   );
// // }

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useFetchData from "../../hooks/useFetchData";
import {
  ATTRIBUTE_ROUTES,
  CATEGORY_ROUTES,
  PRODUCT_ROUTES,
} from "../../../utils/apiRoute";

export default function ProductForm() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  const [uploadType, setUploadType] = useState("images"); // "images" or "files"

  const selectedCategory = watch("category");
  const selectedSubcategory = watch("subcategory");
  const price = watch("price");
  const originalPrice = watch("originalPrice");
  const productType = watch("producttype");

  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const { fetchData, uploadFile, loading } = useFetchData(token);
  const discountPercentage =
    originalPrice && price && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const discountAmount =
    originalPrice && price && originalPrice > price ? originalPrice - price : 0;

  useEffect(() => {
    const fetchCategories = async () => {
      await fetchData(CATEGORY_ROUTES.all, (data) => {
        if (data.success) {
          setCategories(data.categories || []);
        }
      });
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchSubcategories = async () => {
        try {
          const endpoints = [
            `/subcategories/category/${selectedCategory}`,
            `/subcategories?category=${selectedCategory}`,
            `/categories/${selectedCategory}/subcategories`,
          ];

          let subcategoriesData = [];

          for (const endpoint of endpoints) {
            try {
              await fetchData(endpoint, (data) => {
                if (data.success) {
                  subcategoriesData =
                    data.subcategories || data.subcateg || data.data || [];
                }
              });
              if (subcategoriesData.length > 0) break;
            } catch (error) {
              console.log(`Trying next endpoint...`);
              continue;
            }
          }
          if (subcategoriesData.length === 0 && categories.length > 0) {
            const selectedCat = categories.find(
              (cat) => cat._id === selectedCategory
            );
            if (selectedCat && selectedCat.subcategories) {
              subcategoriesData = selectedCat.subcategories;
            }
          }

          setSubcategories(subcategoriesData);
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          setSubcategories([]);
        }
      };
      fetchSubcategories();
    } else {
      setSubcategories([]);
      setAttributes([]);
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (selectedSubcategory) {
      const fetchAttributes = async () => {
        await fetchData(ATTRIBUTE_ROUTES.all, (data) => {
          if (data.success) {
            const allAttrs = data.data || data.attributes || [];
            const filtered = allAttrs.filter(
              (attr) =>
                attr.subcategory?._id === selectedSubcategory ||
                attr.subcategory === selectedSubcategory
            );
            setAttributes(filtered);
            const checkboxState = {};
            filtered.forEach((attr) => {
              if (attr.Fieldtype === "checkbox") {
                checkboxState[attr._id] = [];
              }
            });
            setSelectedCheckboxes(checkboxState);
          }
        });
      };
      fetchAttributes();
    } else {
      setAttributes([]);
      setSelectedCheckboxes({});
    }
  }, [selectedSubcategory]);

  const handleCheckboxChange = (attributeId, value, isChecked) => {
    setSelectedCheckboxes((prev) => {
      const newState = { ...prev };

      if (isChecked) {
        if (!newState[attributeId]?.includes(value)) {
          newState[attributeId] = [...(newState[attributeId] || []), value];
        }
      } else {
        newState[attributeId] = (newState[attributeId] || []).filter(
          (v) => v !== value
        );

        if (newState[attributeId].length === 0) {
          delete newState[attributeId];
        }
      }

      return newState;
    });
  };

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);

    const currentFiles = getValues("files") || [];
    const totalFiles = currentFiles.length + newFiles.length;

    if (totalFiles > 5) {
      Swal.fire(
        "Maximum Files Exceeded",
        `Maximum 5 files allowed. You already have ${currentFiles.length} files selected.`,
        "warning"
      );
      e.target.value = "";
      return;
    }

    // Define allowed file types based on upload type
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    const allowedFileTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const validTypes =
      uploadType === "images" ? allowedImageTypes : allowedFileTypes;
    const invalidFiles = newFiles.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      const allowedFormats =
        uploadType === "images"
          ? "JPG, PNG, WebP"
          : "PDF, DOC, DOCX, TXT, XLS, XLSX";
      Swal.fire("Error", `Only ${allowedFormats} files are allowed`, "error");
      e.target.value = "";
      return;
    }

    const maxSize =
      uploadType === "images" ? 10 * 1024 * 1024 : 20 * 1024 * 1024; // 10MB for images, 20MB for files
    const oversizedFiles = newFiles.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      const maxSizeMB = maxSize / (1024 * 1024);
      Swal.fire(
        "Error",
        `File size should be less than ${maxSizeMB}MB`,
        "error"
      );
      e.target.value = "";
      return;
    }

    // Create previews for images
    if (uploadType === "images") {
      const newPreviews = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        type: "image",
      }));
      const updatedFiles = [...currentFiles, ...newFiles];
      const updatedPreviews = [...imagePreviews, ...newPreviews];

      setImagePreviews(updatedPreviews);
      setValue("files", updatedFiles);
    } else {
      // For files, create file info objects
      const newFilePreviews = newFiles.map((file) => ({
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        type: file.type,
        icon: getFileIcon(file.type),
      }));
      const updatedFiles = [...currentFiles, ...newFiles];
      const updatedPreviews = [...filePreviews, ...newFilePreviews];

      setFilePreviews(updatedPreviews);
      setValue("files", updatedFiles);
    }

    e.target.value = "";
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("sheet")) return "📊";
    if (fileType.includes("text")) return "📃";
    return "📎";
  };

  const removeFile = (index) => {
    if (uploadType === "images") {
      URL.revokeObjectURL(imagePreviews[index].preview);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      const currentFiles = getValues("files") || [];
      const newFiles = currentFiles.filter((_, i) => i !== index);

      setImagePreviews(newPreviews);
      setValue("files", newFiles);
    } else {
      const newPreviews = filePreviews.filter((_, i) => i !== index);
      const currentFiles = getValues("files") || [];
      const newFiles = currentFiles.filter((_, i) => i !== index);

      setFilePreviews(newPreviews);
      setValue("files", newFiles);
    }
  };

  const clearAllFiles = () => {
    if (uploadType === "images") {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.preview));
      setImagePreviews([]);
    } else {
      setFilePreviews([]);
    }
    setValue("files", []);
  };

  const validatePrice = (originalPrice, sellingPrice) => {
    if (originalPrice && sellingPrice) {
      if (parseFloat(originalPrice) < parseFloat(sellingPrice)) {
        return "Original price cannot be less than selling price";
      }
    }
    return true;
  };

  const onSubmit = async (data) => {
    if (!token) {
      Swal.fire("Error", "Please log in to create products", "error");
      return;
    }
    const priceValidation = validatePrice(data.originalPrice, data.price);
    if (priceValidation !== true) {
      Swal.fire("Error", priceValidation, "error");
      return;
    }

    const files = getValues("files") || [];
    if (!files || files.length === 0) {
      Swal.fire(
        "Error",
        `Please select at least one ${
          uploadType === "images" ? "image" : "file"
        }`,
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("category", data.category);
      formData.append("subcategory", data.subcategory);
      formData.append("brand", data.brand || "");
      formData.append("price", data.price);
      formData.append("originalPrice", data.originalPrice || "");
      formData.append("stock", data.stock);
      formData.append("description", description || "");
      formData.append("producttype", data.producttype || "physical");
      // REMOVED: imageVisibility - Cloudinary doesn't need this

      const attrsArray = [];
      attributes.forEach((attr) => {
        if (attr.Fieldtype === "checkbox") {
          const selectedValues = selectedCheckboxes[attr._id] || [];
          if (selectedValues.length > 0) {
            attrsArray.push({
              attribute: attr._id,
              name: attr.name,
              value: selectedValues,
              fieldType: attr.Fieldtype,
            });
          }
        } else {
          const value = data.attributes?.[attr._id];
          if (value) {
            attrsArray.push({
              attribute: attr._id,
              name: attr.name,
              value: [value],
              fieldType: attr.Fieldtype,
            });
          }
        }
      });

      if (attrsArray.length > 0) {
        formData.append("attributes", JSON.stringify(attrsArray));
      }

      // Append files - field name should be "files" to match multer upload.array("files", 5)
      for (let file of files) {
        formData.append("files", file);
      }

      await uploadFile(
        PRODUCT_ROUTES.create,
        formData,
        `Product created successfully with ${files.length} ${
          uploadType === "images" ? "images" : "files"
        }!`,
        (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${progress}%`);
        }
      );

      // Cleanup
      if (uploadType === "images") {
        imagePreviews.forEach((preview) =>
          URL.revokeObjectURL(preview.preview)
        );
        setImagePreviews([]);
      } else {
        setFilePreviews([]);
      }
      reset();
      setSelectedCheckboxes({});
      setDescription("");
      navigate("/admin-dashboard/products");
    } catch (error) {
      console.error("❌ Error creating product:", error);
      Swal.fire(
        "Error",
        error.message || "Failed to create product. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAttributeInput = (attr) => {
    const isChecked = (value) => {
      return selectedCheckboxes[attr._id]?.includes(value) || false;
    };

    switch (attr.Fieldtype) {
      case "checkbox":
        return (
          <div className="space-y-2">
            <label className="block font-semibold text-gray-700 mb-2">
              {attr.name}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {attr.values.map((value, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={value}
                    checked={isChecked(value)}
                    onChange={(e) =>
                      handleCheckboxChange(attr._id, value, e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{value}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "dropdown":
      default:
        return (
          <div className="space-y-2">
            <label className="block font-semibold text-gray-700">
              {attr.name}
            </label>
            <select
              {...register(`attributes.${attr._id}`, {
                required: `Please select ${attr.name}`,
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select {attr.name}</option>
              {attr.values.map((val, i) => (
                <option key={i} value={val}>
                  {val}
                </option>
              ))}
            </select>
            {errors.attributes?.[attr._id] && (
              <p className="text-red-500 text-sm font-medium">
                {errors.attributes[attr._id]?.message}
              </p>
            )}
          </div>
        );
    }
  };

  const isSubmitDisabled = loading || isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6"
        >
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Add New Product
            </h2>
            <p className="text-gray-600 text-center mt-1">
              Fill in the details to create a new product
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <input
                placeholder="Enter product name"
                {...register("name", { required: "Name is required" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.name && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subcategory *
                </label>
                <select
                  {...register("subcategory", {
                    required: "Subcategory is required",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={!selectedCategory || subcategories.length === 0}
                >
                  <option value="">
                    {!selectedCategory
                      ? "Select a category first"
                      : subcategories.length === 0
                      ? "No subcategories available"
                      : "Select Subcategory"}
                  </option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {errors.subcategory && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.subcategory.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Brand
              </label>
              <input
                placeholder="Enter brand name"
                {...register("brand")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Original Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("originalPrice", {
                    min: { value: 0, message: "Price must be positive" },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.originalPrice && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.originalPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Selling Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 0, message: "Price must be positive" },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Discount
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <p
                    className={`text-sm font-medium ${
                      discountPercentage > 0
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {discountPercentage > 0
                      ? `${discountPercentage}% OFF`
                      : "No discount"}
                  </p>
                  {discountPercentage > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Save ₹{discountAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("stock", {
                    required: "Stock is required",
                    min: { value: 0, message: "Stock must be positive" },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.stock.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Type
                </label>
                <select
                  {...register("producttype")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  defaultValue="physical"
                >
                  <option value="physical">Physical</option>
                  <option value="digital">Digital</option>
                </select>
              </div>
            </div>

            {/* Description Field (Simple Textarea) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                placeholder="Enter product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none"
                rows={4}
              />
            </div>
          </div>

          {attributes.length > 0 && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">
                Product Attributes
              </h3>
              {attributes.map((attr) => (
                <div key={attr._id}>{renderAttributeInput(attr)}</div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Product Files
            </h3>

            {/* Upload Type Selection */}
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setUploadType("images")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  uploadType === "images"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📸 Upload Images
              </button>
              <button
                type="button"
                onClick={() => setUploadType("files")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  uploadType === "files"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📁 Upload Documents
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {uploadType === "images"
                  ? `Upload Images (${imagePreviews.length}/5)`
                  : `Upload Documents (${filePreviews.length}/5)`}
              </label>

              {/* Image Previews */}
              {uploadType === "images" && imagePreviews.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {imagePreviews.length} image(s) selected
                    </span>
                    <button
                      type="button"
                      onClick={clearAllFiles}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border shadow-sm"
                        />
                        <span className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Previews */}
              {uploadType === "files" && filePreviews.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {filePreviews.length} file(s) selected
                    </span>
                    <button
                      type="button"
                      onClick={clearAllFiles}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {filePreviews.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{file.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.size} • {file.type}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept={
                    uploadType === "images"
                      ? "image/jpeg, image/jpg, image/png, image/webp"
                      : ".pdf,.doc,.docx,.txt,.xls,.xlsx"
                  }
                  onChange={handleImageChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Click to upload{" "}
                      {uploadType === "images" ? "images" : "documents"} or drag
                      and drop
                    </span>
                    <span className="text-xs text-gray-500">
                      {uploadType === "images"
                        ? "PNG, JPG, WebP up to 10MB each"
                        : "PDF, DOC, DOCX, TXT, XLS, XLSX up to 20MB each"}
                    </span>
                  </div>
                </label>
              </div>

              <p className="text-sm text-gray-500">
                Maximum 5 {uploadType === "images" ? "images" : "files"}{" "}
                allowed.{" "}
                {(uploadType === "images"
                  ? imagePreviews.length
                  : filePreviews.length) > 0 &&
                  ` You can add ${
                    5 -
                    (uploadType === "images"
                      ? imagePreviews.length
                      : filePreviews.length)
                  } more.`}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSubmitDisabled
                  ? "bg-gray-400 cursor-not-allowed text-gray-700"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              }`}
            >
              {isSubmitDisabled ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Creating Product...</span>
                </div>
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
