import React from "react";
import { FiSearch } from "react-icons/fi";

export default function SearchBar({ searchTerm, onSearchChange, placeholder }) {
  return (
    <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-80 shadow-sm">
      <FiSearch className="text-gray-500 mr-2" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="w-full outline-none text-gray-700"
      />
    </div>
  );
}
