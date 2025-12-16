import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useFetchData from "../../hooks/useFetchData";
import {
  ATTRIBUTE_ROUTES,
  CATEGORY_ROUTES,
  PRODUCT_ROUTES,
} from "../../../utils/apiRoute";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedCategory = watch("category");
  const selectedSubcategory = watch("subcategory");
  const price = watch("price");
  const originalPrice = watch("originalPrice");
  const token = useSelector((state) => state.auth.token);

  const { fetchData, updateWithFile, loading } = useFetchData(token);

  // Calculate discount
  const discountPercentage = originalPrice && price && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const discountAmount = originalPrice && price && originalPrice > price
    ? originalPrice - price
    : 0;

  useEffect(() => {
    const fetchCategories = async () => {
      await fetchData(CATEGORY_ROUTES.all, (data) => {
        if (data.success) {
          setCategories(data.categories || data.data || []);
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
          }
        });
      };
      fetchAttributes();
    } else {
      setAttributes([]);
    }
  }, [selectedSubcategory]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        await fetchData(PRODUCT_ROUTES.single(id), (data) => {
          if (data.success) {
            const productData = data.product || data.data;
            setExistingImages(productData.images || []);

            reset({
              name: productData.name,
              category: productData.category?._id || productData.category,
              subcategory: productData.subcategory?._id || productData.subcategory,
              brand: productData.brand || "",
              price: productData.price,
              originalPrice: productData.originalPrice || "",
              stock: productData.stock,
              description: productData.description || "",
              producttype: productData.producttype || "physical",
              imageVisibility: productData.imageVisibility || "public",
              status: productData.status || "active",
            });

            // Set attributes
            if (productData.attributes && productData.attributes.length > 0) {
              const checkboxValues = {};

              productData.attributes.forEach((attr) => {
                if (attr.fieldType === "checkbox") {
                  checkboxValues[attr.attribute] = Array.isArray(attr.value)
                    ? attr.value
                    : typeof attr.value === "string"
                    ? [attr.value]
                    : [];
                } else {
                  const value = Array.isArray(attr.value)
                    ? attr.value[0] || ""
                    : attr.value;
                  setValue(`attributes.${attr.attribute}`, value);
                }
              });

              setSelectedCheckboxes(checkboxValues);
            }
          }
        });
      } catch (error) {
        console.error("❌ Error fetching product:", error);
        Swal.fire("Error", "Failed to load product data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, reset, setValue]);

  const handleImageDelete = (imageUrl) => {
    setImagesToDelete((prev) => [...prev, imageUrl]);
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
  };

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

    const totalImages =
      existingImages.length - imagesToDelete.length + newFiles.length;
    if (totalImages > 5) {
      Swal.fire(
        "Maximum Images Exceeded",
        `Maximum 5 images allowed. You can only add ${
          5 - (existingImages.length - imagesToDelete.length)
        } more images.`,
        "warning"
      );
      e.target.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = newFiles.filter(
      (file) => !validTypes.includes(file.type)
    );
    const oversizedFiles = newFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );

    if (invalidFiles.length > 0) {
      Swal.fire("Error", "Only JPG, PNG, and WebP images are allowed", "error");
      e.target.value = "";
      return;
    }

    if (oversizedFiles.length > 0) {
      Swal.fire("Error", "File size should be less than 10MB", "error");
      e.target.value = "";
      return;
    }

    const newPreviews = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setNewImages((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index].preview);

    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newFiles = newImages.filter((_, i) => i !== index);

    setImagePreviews(newPreviews);
    setNewImages(newFiles);
  };

  const clearAllNewImages = () => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.preview));
    setImagePreviews([]);
    setNewImages([]);
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
      Swal.fire("Error", "Please log in to update products", "error");
      return;
    }

    // Validate price
    const priceValidation = validatePrice(data.originalPrice, data.price);
    if (priceValidation !== true) {
      Swal.fire("Error", priceValidation, "error");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("category", data.category);
      formData.append("subcategory", data.subcategory || "");
      formData.append("brand", data.brand || "");
      formData.append("price", data.price);
      formData.append("originalPrice", data.originalPrice || "");
      formData.append("stock", data.stock);
      formData.append("description", data.description || "");
      formData.append("producttype", data.producttype || "physical");
      formData.append("imageVisibility", data.imageVisibility || "public");
      formData.append("status", data.status);

      // Handle attributes
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

      // Handle image deletions
      if (imagesToDelete.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }

      // Handle new images
      if (newImages.length > 0) {
        newImages.forEach((file) => {
          formData.append("images", file);
        });
      }

      console.log("🔄 Updating product...");
      await updateWithFile(
        PRODUCT_ROUTES.update(id),
        formData,
        "Product updated successfully!",
        (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${progress}%`);
        }
      );

      // Cleanup preview URLs
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.preview));
      navigate("/admin-dashboard/products");
    } catch (error) {
      console.error("❌ Error updating product:", error);
      Swal.fire("Error", "Failed to update product. Please try again.", "error");
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
              {...register(`attributes.${attr._id}`)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select {attr.name}</option>
              {attr.values.map((val, i) => (
                <option key={i} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-sm border p-6 space-y-6"
        >
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
              <button
                type="button"
                onClick={() => navigate("/admin-dashboard/products")}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back to Products
              </button>
            </div>
            <p className="text-gray-600 mt-1">Update product information</p>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

            {/* Product Name & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-red-500 text-sm font-medium">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  {...register("status", { required: "Status is required" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  {...register("category", { required: "Category is required" })}
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
                  <p className="text-red-500 text-sm font-medium">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <select
                  {...register("subcategory")}
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
              </div>
            </div>

            {/* Brand */}
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

            {/* Pricing Section */}
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
                    min: { value: 0, message: "Price must be positive" }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.originalPrice && (
                  <p className="text-red-500 text-sm font-medium">{errors.originalPrice.message}</p>
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
                    min: { value: 0, message: "Price must be positive" }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm font-medium">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Discount
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <p className={`text-sm font-medium ${discountPercentage > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    {discountPercentage > 0 ? `${discountPercentage}% OFF` : 'No discount'}
                  </p>
                  {discountPercentage > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Save ₹{discountAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stock & Product Type & Image Visibility */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    min: { value: 0, message: "Stock must be positive" }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm font-medium">{errors.stock.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Type
                </label>
                <select
                  {...register("producttype")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="physical">Physical</option>
                  <option value="digital">Digital</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Image Visibility
                </label>
                <select
                  {...register("imageVisibility")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Attributes */}
          {attributes.length > 0 && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">Product Attributes</h3>
              {attributes.map((attr) => (
                <div key={attr._id}>{renderAttributeInput(attr)}</div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Enter product description"
              {...register("description")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical min-h-[100px]"
            />
          </div>

          {/* Current Images */}
          {existingImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Current Images ({existingImages.length - imagesToDelete.length} remaining)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageDelete(image)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                      title="Delete image"
                    >
                      ×
                    </button>
                    <span className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Add New Images
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Images ({imagePreviews.length} selected)
              </label>

              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {imagePreviews.length} new image(s) selected
                    </span>
                    <button
                      type="button"
                      onClick={clearAllNewImages}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear All New Images
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                          onClick={() => removeNewImage(index)}
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

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg, image/jpg, image/png, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="new-image-upload"
                />
                <label
                  htmlFor="new-image-upload"
                  className="cursor-pointer block"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Click to upload new images or drag and drop
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, WebP up to 10MB each
                    </span>
                  </div>
                </label>
              </div>

              <p className="text-sm text-gray-500">
                Maximum 5 images total. {imagePreviews.length > 0 &&
                  ` You can add ${
                    5 - (existingImages.length - imagesToDelete.length + imagePreviews.length)
                  } more.`}
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin-dashboard/products")}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 font-medium py-3 px-4 rounded-lg transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed text-gray-700"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Updating Product...</span>
                  </div>
                ) : (
                  "Update Product"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useSelector } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import useFetchData from "../../hooks/useFetchData";
// import {
//   ATTRIBUTE_ROUTES,
//   CATEGORY_ROUTES,
//   PRODUCT_ROUTES,
//   SUBCATEGORY_ROUTES,
// } from "../../../utils/apiRoute";

// export default function EditProduct() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const {
//     register,
//     handleSubmit,
//     watch,
//     reset,
//     setValue,
//     formState: { errors },
//   } = useForm();

//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [attributes, setAttributes] = useState([]);
//   const [selectedCheckboxes, setSelectedCheckboxes] = useState({});
//   const [existingImages, setExistingImages] = useState([]);
//   const [imagesToDelete, setImagesToDelete] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [newImages, setNewImages] = useState([]);

//   const selectedCategory = watch("category");
//   const selectedSubcategory = watch("subcategory");
//   const token = useSelector((state) => state.auth.token);

//   const { fetchData, updateWithFile, loading } = useFetchData(token);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       await fetchData(CATEGORY_ROUTES.all, (data) => {
//         if (data.success) {
//           setCategories(data.categories || data.data || []);
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
//               const response = await fetchData(
//                 endpoint,
//                 (data) => {
//                   if (data.success) {
//                     subcategoriesData =
//                       data.subcategories || data.subcateg || data.data || [];
//                     return true;
//                   }
//                   return false;
//                 },
//                 true
//               );
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

//           if (subcategoriesData.length === 0) {
//             console.warn("No subcategories found for selected category");
//           }
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
//           }
//         });
//       };
//       fetchAttributes();
//     } else {
//       setAttributes([]);
//     }
//   }, [selectedSubcategory]);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         await fetchData(PRODUCT_ROUTES.single(id), (data) => {
//           if (data.success) {
//             const productData = data.product || data.data;
//             setExistingImages(productData.images || []);

//             reset({
//               name: productData.name,
//               category: productData.category?._id || productData.category,
//               subcategory:
//                 productData.subcategory?._id || productData.subcategory,
//               brand: productData.brand || "",
//               price: productData.price,
//               stock: productData.stock,
//               description: productData.description || "",
//               status: productData.status || "active",
//             });

//             if (productData.attributes && productData.attributes.length > 0) {
//               const checkboxValues = {};

//               productData.attributes.forEach((attr) => {
//                 if (attr.fieldType === "checkbox") {
//                   checkboxValues[attr.attribute] = Array.isArray(attr.value)
//                     ? attr.value
//                     : typeof attr.value === "string"
//                     ? [attr.value]
//                     : [];
//                 } else {
//                   const value = Array.isArray(attr.value)
//                     ? attr.value[0] || ""
//                     : attr.value;
//                   setValue(`attributes.${attr.attribute}`, value);
//                 }
//               });

//               setSelectedCheckboxes(checkboxValues);
//             }
//           }
//         });
//       } catch (error) {
//         console.error("❌ Error fetching product:", error);
//         Swal.fire("Error", "Failed to load product data", "error");
//       }
//     };

//     if (id) fetchProduct();
//   }, [id, reset, setValue]);

//   useEffect(() => {
//     console.log("Selected Category:", selectedCategory);
//     console.log("Selected Subcategory:", selectedSubcategory);
//     console.log("Available Subcategories:", subcategories);
//   }, [selectedCategory, selectedSubcategory, subcategories]);

//   const handleImageDelete = (imageUrl) => {
//     setImagesToDelete((prev) => [...prev, imageUrl]);
//     setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
//   };

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

//     const totalImages =
//       existingImages.length - imagesToDelete.length + newFiles.length;
//     if (totalImages > 5) {
//       Swal.fire(
//         "Maximum Images Exceeded",
//         `Maximum 5 images allowed. You can only add ${
//           5 - (existingImages.length - imagesToDelete.length)
//         } more images.`,
//         "warning"
//       );
//       e.target.value = "";
//       return;
//     }

//     const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
//     const invalidFiles = newFiles.filter(
//       (file) => !validTypes.includes(file.type)
//     );
//     const oversizedFiles = newFiles.filter(
//       (file) => file.size > 5 * 1024 * 1024
//     );

//     if (invalidFiles.length > 0) {
//       Swal.fire("Error", "Only JPG, PNG, and WebP images are allowed", "error");
//       e.target.value = "";
//       return;
//     }

//     if (oversizedFiles.length > 0) {
//       Swal.fire("Error", "File size should be less than 5MB", "error");
//       e.target.value = "";
//       return;
//     }

//     const newPreviews = newFiles.map((file) => ({
//       file,
//       preview: URL.createObjectURL(file),
//     }));

//     setImagePreviews((prev) => [...prev, ...newPreviews]);
//     setNewImages((prev) => [...prev, ...newFiles]);
//   };

//   const removeNewImage = (index) => {
//     URL.revokeObjectURL(imagePreviews[index].preview);

//     const newPreviews = imagePreviews.filter((_, i) => i !== index);
//     const newFiles = newImages.filter((_, i) => i !== index);

//     setImagePreviews(newPreviews);
//     setNewImages(newFiles);
//   };

//   const clearAllNewImages = () => {
//     imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.preview));
//     setImagePreviews([]);
//     setNewImages([]);
//   };

//   const onSubmit = async (data) => {
//     if (!token) {
//       Swal.fire("Error", "Please log in to update products", "error");
//       return;
//     }

//     try {
//       const formData = new FormData();

//       formData.append("name", data.name);
//       formData.append("category", data.category);
//       formData.append("subcategory", data.subcategory || "");
//       formData.append("brand", data.brand || "");
//       formData.append("price", data.price);
//       formData.append("stock", data.stock);
//       formData.append("description", data.description || "");
//       formData.append("status", data.status);

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

//       console.log("📦 Attributes to be saved:", attrsArray);
//       formData.append("attributes", JSON.stringify(attrsArray));
//       if (imagesToDelete.length > 0) {
//         formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
//       }
//       if (newImages.length > 0) {
//         newImages.forEach((file) => {
//           formData.append("images", file);
//         });
//       }

//       await updateWithFile(
//         PRODUCT_ROUTES.update(id),
//         formData,
//         "Product updated successfully!",
//         (progressEvent) => {
//           const progress = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );
//           console.log(`Upload Progress: ${progress}%`);
//         }
//       );

//       navigate("/admin-dashboard/products");
//     } catch (error) {
//       console.error("❌ Error updating product:", error);
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
//               {...register(`attributes.${attr._id}`)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//             >
//               <option value="">Select {attr.name}</option>
//               {attr.values.map((val, i) => (
//                 <option key={i} value={val}>
//                   {val}
//                 </option>
//               ))}
//             </select>
//           </div>
//         );
//     }
//   };

//   if (loading) {
//     return (
//       <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
//         <div className="text-center py-8">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           <p className="text-gray-500 mt-2">Loading product data...</p>
//         </div>
//       </div>
//     );
//   }
//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="max-w-4xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-md"
//     >
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
//         <button
//           type="button"
//           onClick={() => navigate(-1)}
//           className="text-gray-600 hover:text-gray-800 font-medium"
//         >
//           ← Back
//         </button>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="space-y-2">
//           <label className="block font-semibold text-gray-700">
//             Product Name *
//           </label>
//           <input
//             placeholder="Product Name"
//             {...register("name", { required: "Name is required" })}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//           />
//           {errors.name && (
//             <p className="text-red-500 text-sm font-medium">
//               {errors.name.message}
//             </p>
//           )}
//         </div>
//         <div className="space-y-2">
//           <label className="block font-semibold text-gray-700">Status *</label>
//           <select
//             {...register("status", { required: "Status is required" })}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//           >
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//           </select>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="space-y-2">
//           <label className="block font-semibold text-gray-700">
//             Category *
//           </label>
//           <select
//             {...register("category", { required: "Category is required" })}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//           >
//             <option value="">Select Category</option>
//             {categories.map((cat) => (
//               <option key={cat._id} value={cat._id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//           {errors.category && (
//             <p className="text-red-500 text-sm font-medium">
//               {errors.category.message}
//             </p>
//           )}
//         </div>
//         <div className="space-y-2">
//           <label className="block font-semibold text-gray-700">
//             Subcategory
//           </label>
//           <select
//             {...register("subcategory")}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//             disabled={!selectedCategory || subcategories.length === 0}
//           >
//             <option value="">
//               {!selectedCategory
//                 ? "Select a category first"
//                 : subcategories.length === 0
//                 ? "No subcategories available"
//                 : "Select Subcategory"}
//             </option>
//             {subcategories.map((sub) => (
//               <option key={sub._id} value={sub._id}>
//                 {sub.name}
//               </option>
//             ))}
//           </select>
//           {!selectedCategory && (
//             <p className="text-xs text-gray-500 mt-1">
//               Please select a category first
//             </p>
//           )}
//           {selectedCategory && subcategories.length === 0 && (
//             <p className="text-xs text-yellow-500 mt-1">
//               No subcategories available for this category
//             </p>
//           )}
//         </div>
//       </div>
//       {attributes.length > 0 && (
//         <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
//           <h3 className="font-semibold text-gray-800">Product Attributes</h3>
//           {attributes.map((attr) => (
//             <div key={attr._id}>{renderAttributeInput(attr)}</div>
//           ))}
//         </div>
//       )}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="space-y-2">
//           <label className="block font-semibold text-gray-700">Brand</label>
//           <input
//             placeholder="Brand"
//             {...register("brand")}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//           />
//         </div>
//         <div className="space-y-2">
//           <label className="block font-semibold text-gray-700">Price *</label>
//           <input
//             type="number"
//             step="0.01"
//             min="0"
//             placeholder="Price"
//             {...register("price", {
//               required: "Price is required",
//               min: { value: 0, message: "Price must be positive" },
//             })}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//           />
//           {errors.price && (
//             <p className="text-red-500 text-sm font-medium">
//               {errors.price.message}
//             </p>
//           )}
//         </div>
//         <div className="space-y-2">
//           <label className="block font-semibold text-gray-700">Stock *</label>
//           <input
//             type="number"
//             min="0"
//             placeholder="Stock"
//             {...register("stock", {
//               required: "Stock is required",
//               min: { value: 0, message: "Stock must be positive" },
//             })}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//           />
//           {errors.stock && (
//             <p className="text-red-500 text-sm font-medium">
//               {errors.stock.message}
//             </p>
//           )}
//         </div>
//       </div>
//       <div className="space-y-2">
//         <label className="block font-semibold text-gray-700">Description</label>
//         <textarea
//           placeholder="Description"
//           {...register("description")}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical min-h-[100px]"
//         />
//       </div>
//       {existingImages.length > 0 && (
//         <div className="space-y-2">
//           <label className="block font-semibold text-gray-700">
//             Current Images ({existingImages.length - imagesToDelete.length}{" "}
//             remaining)
//           </label>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {existingImages.map((image, index) => (
//               <div key={index} className="relative group">
//                 <img
//                   src={image}
//                   alt={`Product ${index + 1}`}
//                   className="w-full h-24 object-cover rounded-lg border"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => handleImageDelete(image)}
//                   className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <div className="space-y-2">
//         <label className="block font-semibold text-gray-700 mb-2">
//           Add New Images ({imagePreviews.length} selected)
//         </label>

//         {imagePreviews.length > 0 && (
//           <div className="mb-4">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-sm text-gray-600">
//                 {imagePreviews.length} new image(s) selected
//               </span>
//               <button
//                 type="button"
//                 onClick={clearAllNewImages}
//                 className="text-sm text-red-600 hover:text-red-800 font-medium"
//               >
//                 Clear All New Images
//               </button>
//             </div>
//             <div className="grid grid-cols-3 gap-4">
//               {imagePreviews.map((preview, index) => (
//                 <div key={index} className="relative group">
//                   <img
//                     src={preview.preview}
//                     alt={`Preview ${index + 1}`}
//                     className="w-full h-24 object-cover rounded-lg border"
//                   />
//                   <span className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
//                     {index + 1}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => removeNewImage(index)}
//                     className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         <input
//           type="file"
//           multiple
//           accept="image/jpeg, image/jpg, image/png, image/webp"
//           onChange={handleImageChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//         />
//         <p className="text-sm text-gray-500">
//           Select up to 5 images (JPG, PNG, WebP). Max 5MB per image.
//           {imagePreviews.length > 0 &&
//             ` You can add ${
//               5 -
//               (existingImages.length -
//                 imagesToDelete.length +
//                 imagePreviews.length)
//             } more.`}
//         </p>
//       </div>

//       <div className="flex gap-4 pt-4">
//         <button
//           type="button"
//           onClick={() => navigate(-1)}
//           className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={loading}
//           className={`flex-1 font-medium py-3 px-4 rounded-lg transition-colors ${
//             loading
//               ? "bg-gray-400 cursor-not-allowed text-gray-700"
//               : "bg-blue-600 hover:bg-blue-700 text-white"
//           }`}
//         >
//           {loading ? "Updating..." : "Update Product"}
//         </button>
//       </div>
//     </form>
//   );
// }
