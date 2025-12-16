import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pageApi } from "../../utils/pageApi";
import { FiEdit, FiTrash2, FiPlus, FiEye, FiCopy } from "react-icons/fi";
import Swal from "sweetalert2";

export default function PageList() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await pageApi.getPages();
      if (response.data.success) {
        setPages(response.data.pages);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      Swal.fire("Error!", "Failed to load pages", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (page) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${page.title}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      await pageApi.deletePage(page.slug);
      setPages(pages.filter((p) => p.slug !== page.slug));
      Swal.fire("Deleted!", "Page has been deleted.", "success");
    } catch (error) {
      Swal.fire("Error!", "Failed to delete page.", "error");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: "URL copied to clipboard",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading pages...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <Link
          to="/pages/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FiPlus size={18} />
          Create New Page
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FiCopy className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No pages yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first page to get started
          </p>
          <Link
            to="/pages/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Page
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pages.map((page) => (
                <tr key={page._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {page.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-600">
                        /{page.slug}
                      </span>
                      <button
                        onClick={() => copyToClipboard(`/${page.slug}`)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy URL"
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/page/${page.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-900"
                        title="View Page"
                      >
                        <FiEye size={16} />
                      </Link>
                      <Link
                        to={`/pages/edit/${page.slug}`}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Page"
                      >
                        <FiEdit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(page)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Page"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
