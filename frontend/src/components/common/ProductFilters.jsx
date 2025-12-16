import React from "react";
import { FiChevronDown } from "react-icons/fi";

const ProductFilters = ({
  filters,
  setFilters,
  categories = [],
  subcategories = [],
  attributes = [],
  openAttributeSections = {},
  toggleAttributeSection,
  handleAttributeChange,
  clearAllFilters,
  priceRanges = [
    { label: "All Prices", value: "" },
    { label: "Under ₹500", value: "0-500" },
    { label: "₹500 - ₹1000", value: "500-1000" },
    { label: "₹1000 - ₹2000", value: "1000-2000" },
    { label: "₹2000 - ₹5000", value: "2000-5000" },
    { label: "Over ₹5000", value: "5000-100000" },
  ],
  showCategoryFilter = true,
  showSearchFilter = true
}) => {
  return (
    <div className="w-full lg:w-80 bg-white p-6 rounded-lg shadow-sm h-fit sticky top-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Search Filter */}
      {showSearchFilter && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Category Filter */}
      {showCategoryFilter && categories.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => {
              setFilters({
                ...filters,
                category: e.target.value,
                subcategory: "",
                attributes: {},
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Subcategory Filter */}
      {subcategories.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcategory
          </label>
          <select
            value={filters.subcategory}
            onChange={(e) =>
              setFilters({
                ...filters,
                subcategory: e.target.value,
                attributes: {},
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Subcategories</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory._id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <select
          value={filters.priceRange}
          onChange={(e) =>
            setFilters({ ...filters, priceRange: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {priceRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Rating
        </label>
        <select
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Any Rating</option>
          <option value="4">4★ & above</option>
          <option value="3">3★ & above</option>
          <option value="2">2★ & above</option>
          <option value="1">1★ & above</option>
        </select>
      </div>

      {/* Attributes Filter */}
      {attributes.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Attributes</h4>
          <div className="space-y-2">
            {attributes.map((attribute) => (
              <div
                key={attribute._id}
                className="border-b border-gray-100 pb-3 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => toggleAttributeSection(attribute._id)}
                  className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-900 text-sm">
                    {attribute.name}
                  </span>
                  <FiChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${
                      openAttributeSections[attribute._id] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openAttributeSections[attribute._id] && (
                  <div className="mt-2 pl-3 space-y-2 max-h-48 overflow-y-auto">
                    {attribute.values.map((value, index) => {
                      const isChecked =
                        filters.attributes[attribute._id]?.includes(value) ||
                        false;
                      return (
                        <label
                          key={index}
                          className="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              handleAttributeChange(
                                attribute._id,
                                value,
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span
                            className={`text-sm ${
                              isChecked
                                ? "text-indigo-700 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {value}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;

// import React from "react";
// import { FiX } from "react-icons/fi";

// export default function ProductFilter({
//   categories,
//   priceRanges,
//   filters,
//   setFilters,
//   clearAll,
// }) {
//   return (
//     <aside className="bg-white rounded-lg shadow-sm p-4 w-full lg:w-64">
//       <h3 className="text-lg font-semibold mb-4">Filters</h3>

//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Search products..."
//           value={filters.search}
//           onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//         />
//       </div>

//       <div className="mb-4">
//         <h4 className="font-medium text-gray-700 mb-2">Category</h4>
//         <select
//           value={filters.category}
//           onChange={(e) => setFilters({ ...filters, category: e.target.value })}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//         >
//           <option value="">All Categories</option>
//           {categories.map((c) => (
//             <option key={c._id} value={c._id}>
//               {c.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="mb-4">
//         <h4 className="font-medium text-gray-700 mb-2">Price Range</h4>
//         <select
//           value={filters.priceRange}
//           onChange={(e) =>
//             setFilters({ ...filters, priceRange: e.target.value })
//           }
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//         >
//           {priceRanges.map((range) => (
//             <option key={range.value} value={range.value}>
//               {range.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="mb-4">
//         <h4 className="font-medium text-gray-700 mb-2">Minimum Rating</h4>
//         <select
//           value={filters.rating}
//           onChange={(e) =>
//             setFilters({ ...filters, rating: parseFloat(e.target.value) })
//           }
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//         >
//           <option value="">All Ratings</option>
//           {[5, 4, 3, 2, 1].map((r) => (
//             <option key={r} value={r}>
//               {r} ★ & above
//             </option>
//           ))}
//         </select>
//       </div>

//       <button
//         onClick={clearAll}
//         className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50"
//       >
//         <FiX className="h-4 w-4" />
//         Clear All Filters
//       </button>
//     </aside>
//   );
// }
