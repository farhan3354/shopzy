import React from "react";

const ActiveFilters = ({
  filters,
  setFilters,
  categories = [],
  subcategories = [],
  attributes = [],
  priceRanges = [
    { label: "All Prices", value: "" },
    { label: "Under ₹500", value: "0-500" },
    { label: "₹500 - ₹1000", value: "500-1000" },
    { label: "₹1000 - ₹2000", value: "1000-2000" },
    { label: "₹2000 - ₹5000", value: "2000-5000" },
    { label: "Over ₹5000", value: "5000-100000" },
  ],
  clearAllFilters,
}) => {
  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.subcategory ||
    filters.priceRange ||
    filters.rating ||
    Object.keys(filters.attributes).length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className="mb-6 flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-600">Active filters:</span>

      {filters.search && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          Search: "{filters.search}"
          <button
            onClick={() => setFilters({ ...filters, search: "" })}
            className="ml-1 hover:text-indigo-600"
          >
            ×
          </button>
        </span>
      )}

      {filters.category && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Category: {categories.find((c) => c._id === filters.category)?.name}
          <button
            onClick={() => setFilters({ ...filters, category: "" })}
            className="ml-1 hover:text-blue-600"
          >
            ×
          </button>
        </span>
      )}

      {filters.subcategory && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Subcategory:{" "}
          {subcategories.find((s) => s._id === filters.subcategory)?.name}
          <button
            onClick={() => setFilters({ ...filters, subcategory: "" })}
            className="ml-1 hover:text-purple-600"
          >
            ×
          </button>
        </span>
      )}

      {filters.priceRange && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Price:{" "}
          {priceRanges.find((p) => p.value === filters.priceRange)?.label}
          <button
            onClick={() => setFilters({ ...filters, priceRange: "" })}
            className="ml-1 hover:text-green-600"
          >
            ×
          </button>
        </span>
      )}

      {filters.rating && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Rating: {filters.rating}★ & above
          <button
            onClick={() => setFilters({ ...filters, rating: "" })}
            className="ml-1 hover:text-yellow-600"
          >
            ×
          </button>
        </span>
      )}

      {Object.entries(filters.attributes).map(([attributeId, values]) => {
        const attribute = attributes.find((a) => a._id === attributeId);
        if (!attribute) return null;

        return (
          <span
            key={attributeId}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
          >
            {attribute.name}: {values.join(", ")}
            <button
              onClick={() => {
                const newAttributes = { ...filters.attributes };
                delete newAttributes[attributeId];
                setFilters({
                  ...filters,
                  attributes: newAttributes,
                });
              }}
              className="ml-1 hover:text-pink-600"
            >
              ×
            </button>
          </span>
        );
      })}

      <button
        onClick={clearAllFilters}
        className="text-sm text-gray-600 hover:text-gray-800 underline font-medium"
      >
        Clear all
      </button>
    </div>
  );
};

export default ActiveFilters;
