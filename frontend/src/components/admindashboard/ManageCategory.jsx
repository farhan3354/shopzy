import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  FiPlus,
  FiX,
  FiRefreshCw,
  FiTrash2,
  FiFolder,
  FiImage,
} from "react-icons/fi";
import { Editor } from "@tinymce/tinymce-react";
import api from "../../../utils/api";
import { CATEGORY_ROUTES } from "../../../utils/apiRoute";
import Swal from "sweetalert2";

export default function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const editorRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const imageFile = watch("image");
  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // const fetchCategories = async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await api.get(CATEGORY_ROUTES.all);
  //     setCategories(response.data.categories || []);
  //   } catch (error) {
  //     console.error("Failed to fetch categories:", error);
  //     alert("Failed to load categories");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const onSubmit = async (data) => {
  //   try {
  //     const hasContent =
  //       description && description.replace(/<[^>]*>/g, "").trim().length > 0;

  //     if (!hasContent) {
  //       alert("Please enter a category description");
  //       return;
  //     }

  //     const formData = new FormData();
  //     formData.append("name", data.name);
  //     formData.append("description", description);

  //     if (data.image && data.image[0]) {
  //       formData.append("image", data.image[0]);
  //     }

  //     // Use CATEGORY_ROUTES.create instead of hardcoded "/categories"
  //     await api.post(CATEGORY_ROUTES.create, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     alert("Category created successfully");
  //     reset();
  //     setImagePreview(null);
  //     setDescription("");
  //     setShowForm(false);
  //     fetchCategories();
  //   } catch (err) {
  //     const message = err?.response?.data?.message || "Error creating category";
  //     alert(message);
  //     console.error("Create category error:", err);
  //   }
  // };

  const handleCancel = () => {
    reset();
    setImagePreview(null);
    setDescription("");
    setShowForm(false);
  };

  // Custom success alert style
  const showSuccessAlert = (title, text) => {
    Swal.fire({
      icon: "success",
      title: title,
      text: text,
      confirmButtonColor: "#10B981",
      iconColor: "#10B981",
      background: "#F9FAFB",
      color: "#1F2937",
      timer: 2000,
    });
  };

  // Custom error alert style
  const showErrorAlert = (title, text) => {
    Swal.fire({
      icon: "error",
      title: title,
      text: text,
      confirmButtonColor: "#EF4444",
      iconColor: "#EF4444",
      background: "#F9FAFB",
      color: "#1F2937",
    });
  };

  // Custom warning alert style
  const showWarningAlert = (title, text) => {
    Swal.fire({
      icon: "warning",
      title: title,
      text: text,
      confirmButtonColor: "#F59E0B",
      iconColor: "#F59E0B",
      background: "#F9FAFB",
      color: "#1F2937",
    });
  };

  // Updated functions using custom alerts
  const onSubmit = async (data) => {
    try {
      const hasContent =
        description && description.replace(/<[^>]*>/g, "").trim().length > 0;

      if (!hasContent) {
        showWarningAlert(
          "Description Required",
          "Please enter a category description"
        );
        return;
      }

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", description);

      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      // Show loading
      Swal.fire({
        title: "Creating Category...",
        html: "Please wait while we process your request",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: "#F9FAFB",
        color: "#1F2937",
      });

      await api.post(CATEGORY_ROUTES.create, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccessAlert("Success!", "Category created successfully");

      reset();
      setImagePreview(null);
      setDescription("");
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      const message = err?.response?.data?.message || "Error creating category";
      showErrorAlert("Creation Failed", message);
      console.error("Create category error:", err);
    }
  };

  const deleteCategory = async (id) => {
    const result = await Swal.fire({
      title: "Delete Category?",
      text: "This action cannot be undone. All products in this category might be affected.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#F9FAFB",
      color: "#1F2937",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting Category...",
        html: "Please wait while we remove the category",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: "#F9FAFB",
        color: "#1F2937",
      });

      await api.delete(CATEGORY_ROUTES.single(id));

      showSuccessAlert("Deleted!", "Category has been deleted successfully");
      fetchCategories();
    } catch (err) {
      const message = err?.response?.data?.message || "Error deleting category";
      showErrorAlert("Delete Failed", message);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(CATEGORY_ROUTES.all);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const deleteCategory = async (id) => {
  //   if (!window.confirm("Are you sure you want to delete this category?"))
  //     return;

  //   try {
  //     await api.delete(CATEGORY_ROUTES.single(id));
  //     alert("Category deleted successfully");
  //     fetchCategories();
  //   } catch (err) {
  //     const message = err?.response?.data?.message || "Error deleting category";
  //     alert(message);
  //   }
  // };

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
        border-left: 4px solid #0ea5e9; 
        background-color: #f0f9ff;
        padding: 1em 1.5em; 
        margin: 1em 0;
        font-style: italic;
        color: #1e40af;
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
      a { color: #0ea5e9; }
      a:hover { color: #0284c7; }
      table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
      table, th, td { border: 1px solid #e5e7eb; }
      th { background-color: #f8fafc; font-weight: 600; }
      th, td { padding: 0.75em; text-align: left; }
      tr:nth-child(even) { background-color: #f9fafb; }
      
      /* Custom classes for category description */
      .text-red { color: #dc2626; }
      .text-blue { color: #2563eb; }
      .text-green { color: #059669; }
      .text-yellow { color: #d97706; }
      .text-purple { color: #7c3aed; }
      
      .bg-red { background-color: #fef2f2; padding: 0.25em 0.5em; border-radius: 0.25em; }
      .bg-blue { background-color: #eff6ff; padding: 0.25em 0.5em; border-radius: 0.25em; }
      .bg-green { background-color: #f0fdf4; padding: 0.25em 0.5em; border-radius: 0.25em; }
      
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Category Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Create and manage product categories
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Create Category</span>
            </button>
          )}
        </div>
        {showForm && (
          <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Add New Category
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                >
                  <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    {...register("name", {
                      required: "Category name is required",
                      minLength: {
                        value: 2,
                        message: "Category name must be at least 2 characters",
                      },
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <Editor
                      onInit={(evt, editor) => (editorRef.current = editor)}
                      value={description}
                      onEditorChange={(newValue) => setDescription(newValue)}
                      init={editorConfig}
                      apiKey={
                        "5vdp2934fu4e3s9ppww5is091de5hxrjv2ju7lh5unb8ycvd"
                      }
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Image *
                  </label>
                  <div className="flex items-center gap-3 mb-2">
                    <FiImage className="text-gray-400 text-lg" />
                    <input
                      type="file"
                      accept="image/*"
                      {...register("image", {
                        required: "Category image is required",
                        validate: {
                          fileType: (files) =>
                            !files[0] ||
                            files[0].type.startsWith("image/") ||
                            "Please select an image file",
                          fileSize: (files) =>
                            !files[0] ||
                            files[0].size <= 5 * 1024 * 1024 ||
                            "File size should be less than 5MB",
                        },
                      })}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                  {errors.image && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                      {errors.image.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, WebP. Max size: 5MB
                  </p>
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview:
                      </p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </span>
                    ) : (
                      "Create Category"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiFolder className="text-blue-600" />
                Categories ({categories.length})
              </h2>
              <button
                onClick={fetchCategories}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600 text-sm sm:text-base">
                    Loading categories...
                  </span>
                </div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <FiFolder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No categories
                </h3>
                <p className="text-gray-500 text-sm sm:text-base mb-6">
                  Get started by creating your first category.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  Create Category
                </button>
              </div>
            ) : (
              <>
                <div className="hidden lg:grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex flex-col h-full">
                        {cat.image && (
                          <div className="mb-3">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                            {cat.name}
                          </h3>
                          {cat.description && (
                            <div
                              className="text-gray-600 mt-1 text-sm line-clamp-2 category-description-content"
                              dangerouslySetInnerHTML={{
                                __html: cat.description,
                              }}
                            />
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {cat.slug}
                            </span>
                            {cat.createdAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(cat.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteCategory(cat._id)}
                          className="mt-3 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <FiTrash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lg:hidden space-y-4">
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex gap-4">
                        {cat.image && (
                          <div className="flex-shrink-0">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-base truncate">
                            {cat.name}
                          </h3>
                          {cat.description && (
                            <div
                              className="text-gray-600 mt-1 text-sm line-clamp-2 category-description-content"
                              dangerouslySetInnerHTML={{
                                __html: cat.description,
                              }}
                            />
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {cat.slug}
                            </span>
                            <button
                              onClick={() => deleteCategory(cat._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium flex items-center gap-1"
                            >
                              <FiTrash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                          {cat.createdAt && (
                            <div className="mt-2 text-xs text-gray-500">
                              Created:{" "}
                              {new Date(cat.createdAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block lg:hidden grid gap-4 grid-cols-2">
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex flex-col h-full">
                        {cat.image && (
                          <div className="mb-3">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm">
                            {cat.name}
                          </h3>
                          {cat.description && (
                            <div
                              className="text-gray-600 mt-1 text-xs line-clamp-2 category-description-content"
                              dangerouslySetInnerHTML={{
                                __html: cat.description,
                              }}
                            />
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {cat.slug}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          {cat.createdAt && (
                            <span className="text-xs text-gray-500">
                              {new Date(cat.createdAt).toLocaleDateString()}
                            </span>
                          )}
                          <button
                            onClick={() => deleteCategory(cat._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium flex items-center gap-1"
                          >
                            <FiTrash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import {
//   FiPlus,
//   FiX,
//   FiRefreshCw,
//   FiTrash2,
//   FiFolder,
//   FiImage,
// } from "react-icons/fi";
// import api from "../../../utils/api";
// import { CATEGORY_ROUTES } from "../../../utils/apiRoute";

// export default function ManageCategory() {
//   const [categories, setCategories] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null);
//   const {
//     register,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors, isSubmitting },
//   } = useForm();

//   const imageFile = watch("image");
//   useEffect(() => {
//     if (imageFile && imageFile.length > 0) {
//       const file = imageFile[0];
//       if (file.type.startsWith("image/")) {
//         const reader = new FileReader();
//         reader.onload = (e) => setImagePreview(e.target.result);
//         reader.readAsDataURL(file);
//       }
//     } else {
//       setImagePreview(null);
//     }
//   }, [imageFile]);

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setIsLoading(true);
//       const response = await api.get(CATEGORY_ROUTES.all);
//       setCategories(response.data.categories || []);
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//       alert("Failed to load categories");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const onSubmit = async (data) => {
//     try {
//       const formData = new FormData();
//       formData.append("name", data.name);
//       formData.append("description", data.description);
//       if (data.image && data.image[0]) {
//         formData.append("image", data.image[0]);
//       }

//       await api.post("/categories", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       alert("Category created successfully");
//       reset();
//       setImagePreview(null);
//       setShowForm(false);
//       fetchCategories();
//     } catch (err) {
//       const message = err?.response?.data?.message || "Error creating category";
//       alert(message);
//     }
//   };

//   const handleCancel = () => {
//     reset();
//     setImagePreview(null);
//     setShowForm(false);
//   };

//   const deleteCategory = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this category?"))
//       return;

//     try {
//       await api.delete(CATEGORY_ROUTES.single(id));
//       alert("Category deleted successfully");
//       fetchCategories();
//     } catch (err) {
//       const message = err?.response?.data?.message || "Error deleting category";
//       alert(message);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
//               Category Management
//             </h1>
//             <p className="text-gray-600 mt-1 text-sm sm:text-base">
//               Create and manage product categories
//             </p>
//           </div>
//           {!showForm && (
//             <button
//               onClick={() => setShowForm(true)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
//             >
//               <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
//               <span className="text-sm sm:text-base">Create Category</span>
//             </button>
//           )}
//         </div>
//         {showForm && (
//           <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
//             <div className="p-4 sm:p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
//                   Add New Category
//                 </h2>
//                 <button
//                   onClick={handleCancel}
//                   className="text-gray-500 hover:text-gray-700 transition-colors p-1"
//                 >
//                   <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Category Name *
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Enter category name"
//                     {...register("name", {
//                       required: "Category name is required",
//                       minLength: {
//                         value: 2,
//                         message: "Category name must be at least 2 characters",
//                       },
//                     })}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
//                   />
//                   {errors.name && (
//                     <p className="text-red-500 text-xs sm:text-sm mt-1">
//                       {errors.name.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Description *
//                   </label>
//                   <textarea
//                     placeholder="Enter category description"
//                     rows={3}
//                     {...register("description", {
//                       required: "Description is required",
//                       minLength: {
//                         value: 10,
//                         message: "Description must be at least 10 characters",
//                       },
//                     })}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical text-sm sm:text-base"
//                   />
//                   {errors.description && (
//                     <p className="text-red-500 text-xs sm:text-sm mt-1">
//                       {errors.description.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Category Image *
//                   </label>
//                   <div className="flex items-center gap-3 mb-2">
//                     <FiImage className="text-gray-400 text-lg" />
//                     <input
//                       type="file"
//                       accept="image/*"
//                       {...register("image", {
//                         required: "Category image is required",
//                         validate: {
//                           fileType: (files) =>
//                             !files[0] ||
//                             files[0].type.startsWith("image/") ||
//                             "Please select an image file",
//                           fileSize: (files) =>
//                             !files[0] ||
//                             files[0].size <= 5 * 1024 * 1024 ||
//                             "File size should be less than 5MB",
//                         },
//                       })}
//                       className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
//                     />
//                   </div>
//                   {errors.image && (
//                     <p className="text-red-500 text-xs sm:text-sm mt-1">
//                       {errors.image.message}
//                     </p>
//                   )}
//                   <p className="text-xs text-gray-500">
//                     Supported formats: JPG, PNG, WebP. Max size: 5MB
//                   </p>
//                   {imagePreview && (
//                     <div className="mt-3">
//                       <p className="text-sm font-medium text-gray-700 mb-2">
//                         Preview:
//                       </p>
//                       <img
//                         src={imagePreview}
//                         alt="Preview"
//                         className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border border-gray-300"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-3 pt-2">
//                   <button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
//                   >
//                     {isSubmitting ? (
//                       <span className="flex items-center justify-center">
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                         Creating...
//                       </span>
//                     ) : (
//                       "Create Category"
//                     )}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleCancel}
//                     className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           <div className="p-4 sm:p-6">
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
//               <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
//                 <FiFolder className="text-blue-600" />
//                 Categories ({categories.length})
//               </h2>
//               <button
//                 onClick={fetchCategories}
//                 className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
//               >
//                 <FiRefreshCw className="w-4 h-4" />
//                 <span>Refresh</span>
//               </button>
//             </div>

//             {isLoading ? (
//               <div className="text-center py-8">
//                 <div className="inline-flex items-center justify-center">
//                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
//                   <span className="text-gray-600 text-sm sm:text-base">
//                     Loading categories...
//                   </span>
//                 </div>
//               </div>
//             ) : categories.length === 0 ? (
//               <div className="text-center py-8">
//                 <FiFolder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                 <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
//                   No categories
//                 </h3>
//                 <p className="text-gray-500 text-sm sm:text-base mb-6">
//                   Get started by creating your first category.
//                 </p>
//                 <button
//                   onClick={() => setShowForm(true)}
//                   className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   <FiPlus className="-ml-1 mr-2 h-5 w-5" />
//                   Create Category
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <div className="hidden lg:grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//                   {categories.map((cat) => (
//                     <div
//                       key={cat._id}
//                       className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
//                     >
//                       <div className="flex flex-col h-full">
//                         {cat.image && (
//                           <div className="mb-3">
//                             <img
//                               src={cat.image}
//                               alt={cat.name}
//                               className="w-full h-32 object-cover rounded-lg"
//                             />
//                           </div>
//                         )}

//                         <div className="flex-1">
//                           <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
//                             {cat.name}
//                           </h3>
//                           <p className="text-gray-600 mt-1 text-sm line-clamp-2">
//                             {cat.description}
//                           </p>
//                           <div className="flex items-center justify-between mt-3">
//                             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                               {cat.slug}
//                             </span>
//                             {cat.createdAt && (
//                               <span className="text-xs text-gray-500">
//                                 {new Date(cat.createdAt).toLocaleDateString()}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         <button
//                           onClick={() => deleteCategory(cat._id)}
//                           className="mt-3 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
//                         >
//                           <FiTrash2 className="w-3 h-3" />
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="lg:hidden space-y-4">
//                   {categories.map((cat) => (
//                     <div
//                       key={cat._id}
//                       className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
//                     >
//                       <div className="flex gap-4">
//                         {cat.image && (
//                           <div className="flex-shrink-0">
//                             <img
//                               src={cat.image}
//                               alt={cat.name}
//                               className="w-20 h-20 object-cover rounded-lg"
//                             />
//                           </div>
//                         )}
//                         <div className="flex-1 min-w-0">
//                           <h3 className="font-semibold text-gray-800 text-base truncate">
//                             {cat.name}
//                           </h3>
//                           <p className="text-gray-600 mt-1 text-sm line-clamp-2">
//                             {cat.description}
//                           </p>
//                           <div className="flex items-center justify-between mt-2">
//                             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                               {cat.slug}
//                             </span>
//                             <button
//                               onClick={() => deleteCategory(cat._id)}
//                               className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium flex items-center gap-1"
//                             >
//                               <FiTrash2 className="w-3 h-3" />
//                               Delete
//                             </button>
//                           </div>
//                           {cat.createdAt && (
//                             <div className="mt-2 text-xs text-gray-500">
//                               Created:{" "}
//                               {new Date(cat.createdAt).toLocaleDateString()}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="hidden md:block lg:hidden grid gap-4 grid-cols-2">
//                   {categories.map((cat) => (
//                     <div
//                       key={cat._id}
//                       className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
//                     >
//                       <div className="flex flex-col h-full">
//                         {cat.image && (
//                           <div className="mb-3">
//                             <img
//                               src={cat.image}
//                               alt={cat.name}
//                               className="w-full h-24 object-cover rounded-lg"
//                             />
//                           </div>
//                         )}

//                         <div className="flex-1">
//                           <h3 className="font-semibold text-gray-800 text-sm">
//                             {cat.name}
//                           </h3>
//                           <p className="text-gray-600 mt-1 text-xs line-clamp-2">
//                             {cat.description}
//                           </p>
//                           <div className="flex items-center justify-between mt-2">
//                             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                               {cat.slug}
//                             </span>
//                           </div>
//                         </div>
//                         <div className="flex items-center justify-between mt-3">
//                           {cat.createdAt && (
//                             <span className="text-xs text-gray-500">
//                               {new Date(cat.createdAt).toLocaleDateString()}
//                             </span>
//                           )}
//                           <button
//                             onClick={() => deleteCategory(cat._id)}
//                             className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium flex items-center gap-1"
//                           >
//                             <FiTrash2 className="w-3 h-3" />
//                             Delete
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
