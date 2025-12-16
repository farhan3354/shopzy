import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { pageApi } from "../../utils/pageApi";
import {
  FiHome,
  FiArrowLeft,
  FiRefreshCw,
  FiShoppingBag,
} from "react-icons/fi";

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) {
      fetchPage();
    } else {
      setError("Invalid page URL");
      setLoading(false);
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await pageApi.getPageBySlug(slug);

      if (response.data?.success) {
        setPage(response.data.page);
      } else {
        setError("Page not found");
      }
    } catch (error) {
      console.error("Error fetching page:", error);
      setError(error.response?.data?.message || "Failed to load page");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchPage();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading page content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="text-red-600 text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Page Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The page you're looking for doesn't exist."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 inline-flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <FiRefreshCw size={18} />
                Try Again
              </button>
              <Link
                to="/"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <FiHome size={18} />
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-semibold group"
            >
              <FiArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Continue Shopping
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiShoppingBag size={16} />
              <span className="capitalize">{slug.replace(/-/g, " ")}</span>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <article className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        

          <div className="px-8 py-12">
            <div
              className="prose prose-lg max-w-none 
                        prose-headings:text-gray-900 prose-headings:font-bold
                        prose-h2:text-3xl prose-h2:border-b prose-h2:pb-2 prose-h2:mt-12 prose-h2:mb-6
                        prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg
                        prose-a:text-blue-600 prose-a:no-underline prose-a:font-semibold
                        prose-a:hover:text-blue-700 prose-a:transition-colors
                        prose-strong:text-gray-900 prose-strong:font-bold
                        prose-ul:text-gray-700 prose-ul:text-lg
                        prose-ol:text-gray-700 prose-ol:text-lg
                        prose-li:leading-relaxed
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-400 
                        prose-blockquote:bg-blue-50 prose-blockquote:px-6 prose-blockquote:py-4
                        prose-blockquote:text-gray-700 prose-blockquote:italic
                        prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
                        prose-pre:bg-gray-900 prose-pre:text-gray-100
                        prose-table:border-collapse prose-table:border prose-table:border-gray-300
                        prose-th:bg-gray-100 prose-th:text-gray-900 prose-th:font-semibold
                        prose-td:border prose-td:border-gray-300
                        prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
                        prose-figure:mx-auto"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
          <footer className="border-t border-gray-200 px-8 py-8 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
              <div className="text-gray-600">
                Last updated:{" "}
                <span className="font-semibold">
                  {new Date(page.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {page.author && (
                <div className="text-gray-600">
                  Published by{" "}
                  <span className="font-semibold">{page.author}</span>
                </div>
              )}
            </div>
          </footer>
        </article>
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <FiShoppingBag size={20} />
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
