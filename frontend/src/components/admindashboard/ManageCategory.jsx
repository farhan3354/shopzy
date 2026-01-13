import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiX, FiRefreshCw, FiTrash2, FiFolder, FiEdit, FiChevronDown, FiChevronRight } from "react-icons/fi";
import api from "../../../utils/api";
import { CATEGORY_ROUTES } from "../../../utils/apiRoute";
import Swal from "sweetalert2";

export default function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCancel = () => {
    reset();
    setDescription("");
    setShowForm(false);
    setEditingId(null);
  };

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

  const onSubmit = async (data) => {
    try {
      const hasContent = description && description.trim().length > 0;

      if (!hasContent) {
        showWarningAlert(
          "Description Required",
          "Please enter a category description"
        );
        return;
      }

      Swal.fire({
        title: editingId ? "Updating Category..." : "Creating Category...",
        html: "Please wait while we process your request",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: "#F9FAFB",
        color: "#1F2937",
      });

      const categoryData = {
        name: data.name,
        description: description,
      };

      if (editingId) {
        await api.put(CATEGORY_ROUTES.single(editingId), categoryData);
        showSuccessAlert("Updated!", "Category updated successfully");
      } else {
        await api.post(CATEGORY_ROUTES.create, categoryData);
        showSuccessAlert("Success!", "Category created successfully");
      }

      reset();
      setDescription("");
      setShowForm(false);
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      const message = err?.response?.data?.message || `Error ${editingId ? 'updating' : 'creating'} category`;
      showErrorAlert(`${editingId ? 'Update' : 'Creation'} Failed`, message);
      console.error(`${editingId ? 'Update' : 'Create'} category error:`, err);
    }
  };

  const handleEdit = (category) => {
    reset({
      name: category.name,
    });
    setDescription(category.description || "");
    setEditingId(category._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCategory = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete "${name}"?`,
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

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Category Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage product categories in a list format
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto shadow-sm"
            >
              <FiPlus className="w-5 h-5" />
              <span className="font-medium">Create Category</span>
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingId ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Close form"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name (e.g., Electronics, Clothing)"
                    {...register("name", {
                      required: "Category name is required",
                      minLength: {
                        value: 2,
                        message: "Category name must be at least 2 characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Category name must be less than 100 characters",
                      },
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-2">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a detailed description of this category..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">
                      {description.length}/500 characters
                    </p>
                    <p className="text-xs text-gray-500">
                      Provide a clear description for this category
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-base shadow-sm"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        {editingId ? "Updating Category..." : "Creating Category..."}
                      </span>
                    ) : (
                      editingId ? "Update Category" : "Create Category"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <FiFolder className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Categories List
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Total: {categories.length} categories
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchCategories}
                  disabled={isLoading}
                  className="px-4 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600 text-lg font-medium">
                  Loading categories...
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Please wait while we fetch your categories
                </p>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FiFolder className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No categories found
                </h3>
                <p className="text-gray-500 text-center mb-8 max-w-md">
                  You haven't created any categories yet. Categories help organize your products and improve customer experience.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 shadow-sm"
                >
                  <FiPlus className="w-5 h-5" />
                  <span>Create Your First Category</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Table Header - Desktop */}
                <div className="hidden md:grid grid-cols-12 px-6 py-3.5 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="col-span-5">Category Name</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Created Date</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>

                {/* Categories List */}
                {categories.map((category, index) => (
                  <div
                    key={category._id}
                    className={`px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {/* Mobile View */}
                    <div className="md:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleCategoryExpand(category._id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {expandedCategory === category._id ? (
                              <FiChevronDown className="w-5 h-5 text-gray-500" />
                            ) : (
                              <FiChevronRight className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-base">
                              {category.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Slug: {category.slug || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(category.createdAt)}
                          </span>
                          <button
                            onClick={() => deleteCategory(category._id, category.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Delete ${category.name}`}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {expandedCategory === category._id && (
                        <div className="pl-10 mt-3 space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              Description:
                            </h4>
                            <p className="text-gray-600 text-sm whitespace-pre-line bg-gray-100 p-3 rounded-lg">
                              {category.description || "No description provided"}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                              ID: {category._id}
                            </div>
                            <button
                              onClick={() => handleEdit(category)}
                              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                            >
                              <FiEdit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:grid grid-cols-12 items-center">
                      <div className="col-span-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiFolder className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Slug: {category.slug || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-4">
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {category.description || "No description provided"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-600">
                          {formatDate(category.createdAt)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label={`Edit ${category.name}`}
                            title="Edit Category"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCategory(category._id, category.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Delete ${category.name}`}
                            title="Delete Category"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Stats */}
          {categories.length > 0 && !isLoading && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                <div className="mb-2 sm:mb-0">
                  Showing <span className="font-semibold">{categories.length}</span> categories
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Active Categories</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
