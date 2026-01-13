import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiSettings,
  FiHash,
  FiList,
  FiCheckSquare,
  FiChevronDown,
  FiChevronRight,
  FiX
} from "react-icons/fi";
import useFetchData from "../../hooks/useFetchData";
import { ATTRIBUTE_ROUTES } from "../../../utils/apiRoute";
import api from "../../../utils/api";

export default function Attributes() {
  const [attributes, setAttributes] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedAttribute, setExpandedAttribute] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const { fetchData, postData, updateData, deleteData, loading } = useFetchData(token);

  const fetchAttributes = async () => {
    await fetchData(ATTRIBUTE_ROUTES.all, (data) => {
      if (data.success) {
        setAttributes(data.data || []);
      }
    });
  };

  const fetchSubcategories = async () => {
    try {
      const res = await api.get("/subcategories");
      setSubcategories(res.data.subcateg || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const attributeData = {
        name: data.name,
        values: data.values.split(",").map((v) => v.trim()).filter(v => v !== ""),
        subcategory: data.subcategory,
        Fieldtype: data.Fieldtype,
      };

      if (editingId) {
        await updateData(
          ATTRIBUTE_ROUTES.update(editingId),
          attributeData,
          "Attribute updated successfully!"
        );
      } else {
        await postData(
          ATTRIBUTE_ROUTES.create,
          attributeData,
          "Attribute created successfully!"
        );
      }
      
      handleCancel();
      fetchAttributes();
      
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: editingId ? "Attribute updated successfully" : "Attribute created successfully",
        timer: 1500,
        showConfirmButton: false,
        background: "#F9FAFB",
        color: "#1F2937",
      });
    } catch (error) {
      console.error("Error saving attribute:", error);
      const msg = error.response?.data?.message || "Failed to save attribute";
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: msg,
        background: "#F9FAFB",
        color: "#1F2937",
      });
    }
  };

  const handleEdit = (attribute) => {
    setEditingId(attribute._id);
    setValue("name", attribute.name);
    setValue("values", attribute.values?.join(", ") || "");
    setValue("subcategory", attribute.subcategory?._id || "");
    setValue("Fieldtype", attribute.Fieldtype || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete "${name}"?`,
      text: "This attribute will be permanently removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#F9FAFB",
      color: "#1F2937",
    });

    if (result.isConfirmed) {
      try {
        await deleteData(
          ATTRIBUTE_ROUTES.delete(id),
          "Attribute deleted successfully!"
        );
        setAttributes((prev) => prev.filter((item) => item._id !== id));
        
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Attribute has been deleted",
          timer: 1500,
          showConfirmButton: false,
          background: "#F9FAFB",
          color: "#1F2937",
        });
      } catch (error) {
        console.error("Error deleting attribute:", error);
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedAttribute(expandedAttribute === id ? null : id);
  };

  useEffect(() => {
    fetchAttributes();
    fetchSubcategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 border-none">
              Attribute Management
            </h1>
            <p className="text-gray-600 mt-2">
              Add variants like size, color, or material to your products
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto shadow-sm"
            >
              <FiPlus className="w-5 h-5" />
              <span className="font-medium">Create Attribute</span>
            </button>
          )}
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <FiSettings className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingId ? "Edit Attribute" : "Add New Attribute"}
                  </h2>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Subcategory *
                    </label>
                    <select
                      {...register("subcategory", {
                        required: "Subcategory is required",
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                    {errors.subcategory && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.subcategory.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Attribute Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Color, Size, Material"
                      {...register("name", { 
                        required: "Name is required",
                        minLength: { value: 2, message: "Min 2 characters" } 
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-['Outfit']"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Field Type *
                    </label>
                    <select
                      {...register("Fieldtype", {
                        required: "Field type is required",
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">Select Field Type</option>
                      <option value="text">Text</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="select">Select</option>
                      <option value="radio">Radio</option>
                    </select>
                    {errors.Fieldtype && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.Fieldtype.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Attribute Values
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Red, Blue, Green (comma separated)"
                      {...register("values")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <p className="text-xs text-gray-500 font-['Outfit'] tracking-wide">
                      Separate multiple values with commas
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-50">
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="flex-1 px-6 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-sm"
                  >
                    {isSubmitting || loading ? (
                      <span className="flex items-center justify-center">
                        <FiRefreshCw className="animate-spin mr-2" />
                        {editingId ? "Updating..." : "Creating..."}
                      </span>
                    ) : (
                      editingId ? "Update Attribute" : "Add Attribute"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <FiList className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 border-none">
                All Attributes
              </h2>
            </div>
            <button
              onClick={fetchAttributes}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto p-1">
            {loading && attributes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <FiRefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading your attributes...</p>
              </div>
            ) : attributes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FiHash className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No attributes found</h3>
                <p className="text-gray-500 max-w-md mb-8">
                  Attributes are used to define product variations. Start by creating your first attribute.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium"
                >
                  Create Your First Attribute
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 px-6 py-4 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <div className="col-span-3">Attribute Name</div>
                  <div className="col-span-4">Values</div>
                  <div className="col-span-2">Field Type</div>
                  <div className="col-span-2">Subcategory</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>

                {attributes.map((attr, index) => (
                  <div
                    key={attr._id}
                    className={`px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {/* Mobile Card */}
                    <div className="md:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleExpand(attr._id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {expandedAttribute === attr._id ? <FiChevronDown /> : <FiChevronRight />}
                          </button>
                          <span className="font-bold text-gray-900 text-lg">{attr.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(attr)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(attr._id, attr.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {expandedAttribute === attr._id && (
                        <div className="pl-9 space-y-3 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Values</span>
                            <div className="flex flex-wrap gap-1.5">
                              {attr.values?.map((v, i) => (
                                <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                                  {v}
                                </span>
                              )) || <span className="text-gray-400 text-xs italic">No values</span>}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Field Type</span>
                              <span className="text-sm font-medium text-gray-700">{attr.Fieldtype}</span>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Subcategory</span>
                              <span className="text-sm font-medium text-gray-700">{attr.subcategory?.name || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Desktop Row */}
                    <div className="hidden md:grid grid-cols-12 items-center">
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <FiHash className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-gray-900 font-['Outfit']">{attr.name}</span>
                        </div>
                      </div>
                      <div className="col-span-4">
                        <div className="flex flex-wrap gap-1.5">
                          {attr.values?.slice(0, 4).map((v, i) => (
                            <span key={i} className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] text-xs font-bold rounded-md border border-[#E2E8F0]">
                              {v}
                            </span>
                          ))}
                          {attr.values?.length > 4 && (
                            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              +{attr.values.length - 4} more
                            </span>
                          )}
                          {(attr.values?.length === 0 || !attr.values) && (
                            <span className="text-gray-400 text-xs italic">No values defined</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                           {attr.Fieldtype === 'checkbox' ? <FiCheckSquare className="text-green-500" /> : <FiSettings className="text-gray-400" />}
                           <span className="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 capitalize">
                             {attr.Fieldtype}
                           </span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-medium text-gray-600 truncate block mr-4">
                          {attr.subcategory?.name || <span className="text-gray-400 italic">None</span>}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(attr)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Attribute"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(attr._id, attr.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Attribute"
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
          {attributes.length > 0 && !loading && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
              <span className="mb-2 sm:mb-0 font-['Outfit']">
                Showing <span className="font-bold text-gray-900">{attributes.length}</span> attributes
              </span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div> Active System</span>
                <span className="text-xs italic">Last synced: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
