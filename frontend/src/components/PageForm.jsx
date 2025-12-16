import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor from "./RichTextEditor";
import { pageApi } from "../../utils/pageApi";
import Swal from "sweetalert2";

export default function PageForm() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (slug) {
      setIsEditing(true);
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await pageApi.getPageBySlug(slug);
      if (response.data.success) {
        const page = response.data.page;
        setFormData({
          title: page.title,
          content: page.content,
          isActive: page.isActive,
        });
      }
    } catch (error) {
      console.error("Error fetching page:", error);
      Swal.fire("Error!", "Failed to load page", "error");
      navigate("/admin/pages");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      Swal.fire("Error!", "Title is required", "error");
      return;
    }

    if (!formData.content.trim()) {
      Swal.fire("Error!", "Content is required", "error");
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await pageApi.updatePage(slug, formData);
        Swal.fire("Success!", "Page updated successfully", "success");
      } else {
        await pageApi.createPage(formData);
        Swal.fire("Success!", "Page created successfully", "success");
      }
      navigate("/admin/pages");
    } catch (error) {
      console.error("Error saving page:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save page";
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Page" : "Create New Page"}
          </h1>
          <button
            onClick={() => navigate("/admin/pages")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Pages
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter page title"
              required
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Page is active (visible to public)
            </label>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              height={400}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/admin/pages")}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Page"
                : "Create Page"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
