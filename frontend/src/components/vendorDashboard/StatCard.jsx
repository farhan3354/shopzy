import React from "react";

const StatCard = ({ title, value, prefix = "", suffix = "" }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-bold text-gray-900 mt-1">
      {prefix}
      {typeof value === "number" ? value.toLocaleString() : value}
      {suffix}
    </p>
  </div>
);

export default StatCard;
