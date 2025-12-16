import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import useFetchData from "../../hooks/useFetchData";
import { CATEGORY_ROUTES, COUPON_ROUTES } from "../../../utils/apiRoute";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    maxDiscountAmount: "",
    minimumOrderAmount: 0,
    totalUsageLimit: "",
    perUserLimit: 1,
    startDate: "",
    endDate: "",
    applicableTo: "all",
    categories: [],
    subcategories: [],
    products: [],
    isActive: true,
    coupantype: "discount",
  });

  const token = useSelector((state) => state.auth.token);
  const { fetchData, postData, updateData, deleteData, loading } =
    useFetchData(token);

  useEffect(() => {
    fetchCoupons();
    fetchCategoriesAndSubcategories();
  }, []);

  useEffect(() => {
    if (selectedCategory && categoriesList.length > 0) {
      const category = categoriesList.find(
        (cat) => cat._id === selectedCategory
      );
      if (category && category.subcategories) {
        setAvailableSubcategories(category.subcategories);
      } else {
        setAvailableSubcategories([]);
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategory, categoriesList]);

  const fetchCoupons = async () => {
    await fetchData(COUPON_ROUTES.all, (data) => {
      if (data.success) {
        setCoupons(data.coupons || data.data || []);
      }
    });
  };

  const fetchCategoriesAndSubcategories = async () => {
    await fetchData(CATEGORY_ROUTES.all, (data) => {
      if (data.success) {
        const categories = data.data || data.categories || [];
        setCategoriesList(categories);
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "select-multiple") {
      const selectedOptions = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setFormData((prev) => ({
        ...prev,
        [name]: selectedOptions,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseFloat(value),
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (name === "applicableTo" && value !== "subcategories") {
        setSelectedCategory("");
        setFormData((prev) => ({
          ...prev,
          subcategories: [],
        }));
      }

      if (name === "coupantype" && value === "cashback") {
        setFormData((prev) => ({
          ...prev,
          discountType: "percentage",
        }));
      }
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);

    setFormData((prev) => ({
      ...prev,
      subcategories: [],
    }));
  };

  const handleSubcategoryChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      subcategories: selectedOptions,
    }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    if (formData.coupantype === "cashback") {
      if (formData.discountType !== "percentage") {
        Swal.fire(
          "Error",
          "Cashback coupons must use percentage discount type",
          "error"
        );
        return;
      }
      if (!formData.maxDiscountAmount) {
        Swal.fire(
          "Error",
          "Cashback coupons require a maximum discount amount",
          "error"
        );
        return;
      }
    }

    if (formData.applicableTo === "subcategories" && !selectedCategory) {
      Swal.fire("Error", "Please select a category for subcategories", "error");
      return;
    }

    const couponData = {
      ...formData,
      maxDiscountAmount: formData.maxDiscountAmount || null,
      totalUsageLimit: formData.totalUsageLimit || null,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    try {
      await postData(
        COUPON_ROUTES.create,
        couponData,
        "Coupon created successfully!"
      );
      setShowCreateForm(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      maxDiscountAmount: "",
      minimumOrderAmount: 0,
      totalUsageLimit: "",
      perUserLimit: 1,
      startDate: "",
      endDate: "",
      applicableTo: "all",
      categories: [],
      subcategories: [],
      products: [],
      isActive: true,
      coupantype: "discount",
    });
    setSelectedCategory("");
    setAvailableSubcategories([]);
  };

  const handleDeleteCoupon = async (couponId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This coupon will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteData(
            COUPON_ROUTES.delete(couponId),
            "Coupon deleted successfully!"
          );
          fetchCoupons();
        } catch (error) {
          // Error is handled by the hook
        }
      }
    });
  };

  const toggleCouponStatus = async (id, currentStatus) => {
    try {
      await updateData(
        COUPON_ROUTES.update(id),
        { isActive: !currentStatus },
        `Coupon ${currentStatus ? "deactivated" : "activated"} successfully!`
      );
      fetchCoupons();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getCouponTypeBadge = (coupantype) => {
    if (coupantype === "cashback") {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
          Cashback
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
        Discount
      </span>
    );
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
  <div className="max-w-7xl mx-auto">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Coupon Management
      </h1>
      <button
        onClick={() => setShowCreateForm(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 text-sm sm:text-base w-full sm:w-auto border border-indigo-700"
      >
        Create New Coupon
      </button>
    </div>
    
    {showCreateForm && (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Create New Coupon
          </h2>
          <button
            onClick={() => {
              setShowCreateForm(false);
              resetForm();
            }}
            className="text-gray-500 hover:text-gray-700 text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateCoupon}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Type *
              </label>
              <select
                name="coupantype"
                value={formData.coupantype}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="discount">Discount Coupon</option>
                <option value="cashback">Cashback Coupon</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.coupantype === "cashback"
                  ? "Cashback coupons give money back to user's wallet after admin approval"
                  : "Discount coupons provide instant discount at checkout"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="e.g., SUMMER2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="e.g., Summer Sale"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="2"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Describe the coupon purpose..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                disabled={formData.coupantype === "cashback"}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
              {formData.coupantype === "cashback" && (
                <p className="text-xs text-blue-500 mt-1">
                  Cashback coupons use percentage discount type
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.coupantype === "cashback"
                  ? "Cashback Value *"
                  : "Discount Value *"}
              </label>
              <input
                type="number"
                name="discountValue"
                min="0"
                step={formData.discountType === "percentage" ? "0.1" : "1"}
                value={formData.discountValue}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            {formData.discountType === "percentage" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.coupantype === "cashback"
                    ? "Max Cashback Amount *"
                    : "Max Discount Amount (Optional)"}
                </label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  min="0"
                  value={formData.maxDiscountAmount}
                  onChange={handleInputChange}
                  required={formData.coupantype === "cashback"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder={
                    formData.coupantype === "cashback"
                      ? "Required for cashback"
                      : "No limit if empty"
                  }
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount
              </label>
              <input
                type="number"
                name="minimumOrderAmount"
                min="0"
                value={formData.minimumOrderAmount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Usage Limit (Optional)
              </label>
              <input
                type="number"
                name="totalUsageLimit"
                min="0"
                value={formData.totalUsageLimit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Unlimited if empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per User Limit
              </label>
              <input
                type="number"
                name="perUserLimit"
                min="1"
                value={formData.perUserLimit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Applicable To
              </label>
              <select
                name="applicableTo"
                value={formData.applicableTo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">All Orders</option>
                <option value="categories">Specific Categories</option>
                <option value="subcategories">
                  Specific Subcategories
                </option>
              </select>
            </div>

            {formData.applicableTo === "categories" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Categories
                </label>
                <select
                  multiple
                  name="categories"
                  value={formData.categories}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent p-2 min-h-[100px] text-sm overflow-y-auto"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.categories.length > 0
                    ? `${formData.categories.length} categories selected`
                    : "Hold Ctrl (Cmd on Mac) to select multiple categories"}
                </p>
              </div>
            )}

            {formData.applicableTo === "subcategories" && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Category
                  </label>
                  <select
                    name="category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    <option value="">Select a category</option>
                    {categoriesList.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCategory && availableSubcategories.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Subcategories
                    </label>
                    <select
                      multiple
                      name="subcategories"
                      value={formData.subcategories}
                      onChange={handleSubcategoryChange}
                      className="w-full border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent p-2 min-h-[100px] text-sm overflow-y-auto"
                    >
                      {availableSubcategories.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.subcategories.length > 0
                        ? `${formData.subcategories.length} subcategories selected`
                        : "Hold Ctrl (Cmd on Mac) to select multiple subcategories"}
                    </p>
                  </div>
                )}

                {selectedCategory &&
                  availableSubcategories.length === 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        No subcategories available for the selected
                        category.
                      </p>
                    </div>
                  )}

                {!selectedCategory && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      Please select a category first to view subcategories.
                    </p>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={getTodayDate()}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || getTodayDate()}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active Coupon
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm sm:text-base flex-1 disabled:opacity-50 disabled:cursor-not-allowed border border-green-700"
              disabled={
                loading ||
                (formData.applicableTo === "subcategories" &&
                  !selectedCategory)
              }
            >
              {loading
                ? "Creating..."
                : `Create ${
                    formData.coupantype === "cashback"
                      ? "Cashback"
                      : "Discount"
                  } Coupon`}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200 text-sm sm:text-base flex-1 border border-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )}
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {coupons.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">
            No coupons found. Create your first coupon!
          </p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Name & Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Min Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Validity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-semibold text-sm border-b border-gray-200">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {coupon.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {coupon.description}
                        </div>
                        <div className="mt-1">
                          {getCouponTypeBadge(coupon.coupantype)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-200">
                      <span className="font-semibold">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue}`}
                      </span>
                      {coupon.maxDiscountAmount && (
                        <div className="text-xs text-gray-500">
                          Max: ₹{coupon.maxDiscountAmount}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-200">
                      ₹{coupon.minimumOrderAmount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-200">
                      <div>
                        {new Date(coupon.startDate).toLocaleDateString()}
                      </div>
                      <div>
                        to {new Date(coupon.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-200">
                      <div>Used: {coupon.currentUsageCount || 0}</div>
                      <div>Limit: {coupon.totalUsageLimit || "∞"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                          coupon.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-b border-gray-200">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            toggleCouponStatus(coupon._id, coupon.isActive)
                          }
                          className={`${
                            coupon.isActive
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          } text-sm transition-colors`}
                        >
                          {coupon.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="text-red-600 hover:text-red-900 text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden">
            <div className="p-4 space-y-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg font-mono">
                          {coupon.code}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {coupon.name}
                        </p>
                        <div className="mt-1">
                          {getCouponTypeBadge(coupon.coupantype)}
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                          coupon.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {coupon.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">
                          {coupon.coupantype === "cashback"
                            ? "Cashback:"
                            : "Discount:"}
                        </span>
                        <p className="font-semibold">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`}
                          {coupon.maxDiscountAmount && (
                            <span className="text-xs text-gray-500 block">
                              Max: ₹{coupon.maxDiscountAmount}
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Min Order:
                        </span>
                        <p>₹{coupon.minimumOrderAmount || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Usage:
                        </span>
                        <p>
                          {coupon.currentUsageCount || 0}/
                          {coupon.totalUsageLimit || "∞"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Per User:
                        </span>
                        <p>{coupon.perUserLimit || 1}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">
                        Validity:
                      </span>
                      <p>
                        {new Date(coupon.startDate).toLocaleDateString()} -{" "}
                        {new Date(coupon.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() =>
                          toggleCouponStatus(coupon._id, coupon.isActive)
                        }
                        className={`flex-1 px-3 py-2 rounded text-sm transition-colors border ${
                          coupon.isActive
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                        }`}
                      >
                        {coupon.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm transition-colors border border-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</div>
   
  );
};

export default AdminCoupons;


 // <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
    //   <div className="max-w-7xl mx-auto">
    //     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
    //       <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
    //         Coupon Management
    //       </h1>
    //       <button
    //         onClick={() => setShowCreateForm(true)}
    //         className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 text-sm sm:text-base w-full sm:w-auto"
    //       >
    //         Create New Coupon
    //       </button>
    //     </div>
    //     {showCreateForm && (
    //       <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
    //         <div className="flex justify-between items-center mb-4">
    //           <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
    //             Create New Coupon
    //           </h2>
    //           <button
    //             onClick={() => {
    //               setShowCreateForm(false);
    //               resetForm();
    //             }}
    //             className="text-gray-500 hover:text-gray-700 text-lg"
    //           >
    //             ✕
    //           </button>
    //         </div>

    //         <form onSubmit={handleCreateCoupon}>
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
    //             <div className="md:col-span-2">
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 Coupon Type *
    //               </label>
    //               <select
    //                 name="coupantype"
    //                 value={formData.coupantype}
    //                 onChange={handleInputChange}
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //               >
    //                 <option value="discount">Discount Coupon</option>
    //                 <option value="cashback">Cashback Coupon</option>
    //               </select>
    //               <p className="text-xs text-gray-500 mt-1">
    //                 {formData.coupantype === "cashback"
    //                   ? "Cashback coupons give money back to user's wallet after admin approval"
    //                   : "Discount coupons provide instant discount at checkout"}
    //               </p>
    //             </div>

    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 Coupon Code *
    //               </label>
    //               <input
    //                 type="text"
    //                 name="code"
    //                 value={formData.code}
    //                 onChange={handleInputChange}
    //                 required
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //                 placeholder="e.g., SUMMER2024"
    //               />
    //             </div>

    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 Coupon Name *
    //               </label>
    //               <input
    //                 type="text"
    //                 name="name"
    //                 value={formData.name}
    //                 onChange={handleInputChange}
    //                 required
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //                 placeholder="e.g., Summer Sale"
    //               />
    //             </div>

    //             <div className="md:col-span-2">
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 Description *
    //               </label>
    //               <textarea
    //                 name="description"
    //                 value={formData.description}
    //                 onChange={handleInputChange}
    //                 rows="2"
    //                 required
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //                 placeholder="Describe the coupon purpose..."
    //               />
    //             </div>

    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 Discount Type *
    //               </label>
    //               <select
    //                 name="discountType"
    //                 value={formData.discountType}
    //                 onChange={handleInputChange}
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //                 disabled={formData.coupantype === "cashback"}
    //               >
    //                 <option value="percentage">Percentage</option>
    //                 <option value="fixed">Fixed Amount</option>
    //               </select>
    //               {formData.coupantype === "cashback" && (
    //                 <p className="text-xs text-blue-500 mt-1">
    //                   Cashback coupons use percentage discount type
    //                 </p>
    //               )}
    //             </div>

    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 {formData.coupantype === "cashback"
    //                   ? "Cashback Value *"
    //                   : "Discount Value *"}
    //               </label>
    //               <input
    //                 type="number"
    //                 name="discountValue"
    //                 min="0"
    //                 step={formData.discountType === "percentage" ? "0.1" : "1"}
    //                 value={formData.discountValue}
    //                 onChange={handleInputChange}
    //                 required
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //               />
    //             </div>

    //             {formData.discountType === "percentage" && (
    //               <div>
    //                 <label className="block text-sm font-medium text-gray-700 mb-1">
    //                   {formData.coupantype === "cashback"
    //                     ? "Max Cashback Amount *"
    //                     : "Max Discount Amount (Optional)"}
    //                 </label>
    //                 <input
    //                   type="number"
    //                   name="maxDiscountAmount"
    //                   min="0"
    //                   value={formData.maxDiscountAmount}
    //                   onChange={handleInputChange}
    //                   required={formData.coupantype === "cashback"}
    //                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //                   placeholder={
    //                     formData.coupantype === "cashback"
    //                       ? "Required for cashback"
    //                       : "No limit if empty"
    //                   }
    //                 />
    //               </div>
    //             )}

    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 Minimum Order Amount
    //               </label>
    //               <input
    //                 type="number"
    //                 name="minimumOrderAmount"
    //                 min="0"
    //                 value={formData.minimumOrderAmount}
    //                 onChange={handleInputChange}
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //               />
    //             </div>

    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 Total Usage Limit (Optional)
    //               </label>
    //               <input
    //                 type="number"
    //                 name="totalUsageLimit"
    //                 min="0"
    //                 value={formData.totalUsageLimit}
    //                 onChange={handleInputChange}
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //                 placeholder="Unlimited if empty"
    //               />
    //             </div>

    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 Per User Limit
    //               </label>
    //               <input
    //                 type="number"
    //                 name="perUserLimit"
    //                 min="1"
    //                 value={formData.perUserLimit}
    //                 onChange={handleInputChange}
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //               />
    //             </div>

    //             <div className="md:col-span-2">
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 Applicable To
    //               </label>
    //               <select
    //                 name="applicableTo"
    //                 value={formData.applicableTo}
    //                 onChange={handleInputChange}
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //               >
    //                 <option value="all">All Orders</option>
    //                 <option value="categories">Specific Categories</option>
    //                 <option value="subcategories">
    //                   Specific Subcategories
    //                 </option>
    //               </select>
    //             </div>

    //             {formData.applicableTo === "categories" && (
    //               <div className="md:col-span-2">
    //                 <label className="block text-sm font-medium text-gray-700 mb-1">
    //                   Select Categories
    //                 </label>
    //                 <select
    //                   multiple
    //                   name="categories"
    //                   value={formData.categories}
    //                   onChange={handleInputChange}
    //                   className="w-full border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent p-2 min-h-[100px] text-sm overflow-y-auto"
    //                 >
    //                   {categoriesList.map((cat) => (
    //                     <option key={cat._id} value={cat._id}>
    //                       {cat.name}
    //                     </option>
    //                   ))}
    //                 </select>
    //                 <p className="text-xs text-gray-500 mt-1">
    //                   {formData.categories.length > 0
    //                     ? `${formData.categories.length} categories selected`
    //                     : "Hold Ctrl (Cmd on Mac) to select multiple categories"}
    //                 </p>
    //               </div>
    //             )}

    //             {formData.applicableTo === "subcategories" && (
    //               <>
    //                 <div className="md:col-span-2">
    //                   <label className="block text-sm font-medium text-gray-700 mb-1">
    //                     Select Category
    //                   </label>
    //                   <select
    //                     name="category"
    //                     value={selectedCategory}
    //                     onChange={handleCategoryChange}
    //                     className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //                   >
    //                     <option value="">Select a category</option>
    //                     {categoriesList.map((cat) => (
    //                       <option key={cat._id} value={cat._id}>
    //                         {cat.name}
    //                       </option>
    //                     ))}
    //                   </select>
    //                 </div>

    //                 {selectedCategory && availableSubcategories.length > 0 && (
    //                   <div className="md:col-span-2">
    //                     <label className="block text-sm font-medium text-gray-700 mb-1">
    //                       Select Subcategories
    //                     </label>
    //                     <select
    //                       multiple
    //                       name="subcategories"
    //                       value={formData.subcategories}
    //                       onChange={handleSubcategoryChange}
    //                       className="w-full border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent p-2 min-h-[100px] text-sm overflow-y-auto"
    //                     >
    //                       {availableSubcategories.map((sub) => (
    //                         <option key={sub._id} value={sub._id}>
    //                           {sub.name}
    //                         </option>
    //                       ))}
    //                     </select>
    //                     <p className="text-xs text-gray-500 mt-1">
    //                       {formData.subcategories.length > 0
    //                         ? `${formData.subcategories.length} subcategories selected`
    //                         : "Hold Ctrl (Cmd on Mac) to select multiple subcategories"}
    //                     </p>
    //                   </div>
    //                 )}

    //                 {selectedCategory &&
    //                   availableSubcategories.length === 0 && (
    //                     <div className="md:col-span-2">
    //                       <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
    //                         No subcategories available for the selected
    //                         category.
    //                       </p>
    //                     </div>
    //                   )}

    //                 {!selectedCategory && (
    //                   <div className="md:col-span-2">
    //                     <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
    //                       Please select a category first to view subcategories.
    //                     </p>
    //                   </div>
    //                 )}
    //               </>
    //             )}

    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 Start Date *
    //               </label>
    //               <input
    //                 type="date"
    //                 name="startDate"
    //                 value={formData.startDate}
    //                 onChange={handleInputChange}
    //                 min={getTodayDate()}
    //                 required
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //               />
    //             </div>

    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-1">
    //                 End Date *
    //               </label>
    //               <input
    //                 type="date"
    //                 name="endDate"
    //                 value={formData.endDate}
    //                 onChange={handleInputChange}
    //                 min={formData.startDate || getTodayDate()}
    //                 required
    //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    //               />
    //             </div>

    //             <div className="md:col-span-2 flex items-center">
    //               <input
    //                 type="checkbox"
    //                 name="isActive"
    //                 checked={formData.isActive}
    //                 onChange={handleInputChange}
    //                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
    //               />
    //               <label className="ml-2 block text-sm text-gray-900">
    //                 Active Coupon
    //               </label>
    //             </div>
    //           </div>

    //           <div className="flex flex-col sm:flex-row gap-2 mt-6">
    //             <button
    //               type="submit"
    //               className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm sm:text-base flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
    //               disabled={
    //                 loading ||
    //                 (formData.applicableTo === "subcategories" &&
    //                   !selectedCategory)
    //               }
    //             >
    //               {loading
    //                 ? "Creating..."
    //                 : `Create ${
    //                     formData.coupantype === "cashback"
    //                       ? "Cashback"
    //                       : "Discount"
    //                   } Coupon`}
    //             </button>
    //             <button
    //               type="button"
    //               onClick={() => {
    //                 setShowCreateForm(false);
    //                 resetForm();
    //               }}
    //               className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200 text-sm sm:text-base flex-1"
    //             >
    //               Cancel
    //             </button>
    //           </div>
    //         </form>
    //       </div>
    //     )}

    //     {/* Coupons List */}
    //     <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
    //       {coupons.length === 0 ? (
    //         <div className="p-6 text-center">
    //           <p className="text-gray-500">
    //             No coupons found. Create your first coupon!
    //           </p>
    //         </div>
    //       ) : (
    //         <>
    //           {/* Desktop Table */}
    //           <div className="hidden lg:block">
    //             <table className="min-w-full divide-y divide-gray-200">
    //               <thead className="bg-gray-50">
    //                 <tr>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Code
    //                   </th>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Name & Type
    //                   </th>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Discount
    //                   </th>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Min Order
    //                   </th>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Validity
    //                   </th>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Usage
    //                   </th>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Status
    //                   </th>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Actions
    //                   </th>
    //                 </tr>
    //               </thead>
    //               <tbody className="bg-white divide-y divide-gray-200">
    //                 {coupons.map((coupon) => (
    //                   <tr key={coupon._id} className="hover:bg-gray-50">
    //                     <td className="px-6 py-4 whitespace-nowrap font-mono font-semibold text-sm">
    //                       {coupon.code}
    //                     </td>
    //                     <td className="px-6 py-4">
    //                       <div>
    //                         <div className="font-medium text-gray-900 text-sm">
    //                           {coupon.name}
    //                         </div>
    //                         <div className="text-xs text-gray-500">
    //                           {coupon.description}
    //                         </div>
    //                         <div className="mt-1">
    //                           {getCouponTypeBadge(coupon.coupantype)}
    //                         </div>
    //                       </div>
    //                     </td>
    //                     <td className="px-6 py-4 whitespace-nowrap text-sm">
    //                       <span className="font-semibold">
    //                         {coupon.discountType === "percentage"
    //                           ? `${coupon.discountValue}%`
    //                           : `₹${coupon.discountValue}`}
    //                       </span>
    //                       {coupon.maxDiscountAmount && (
    //                         <div className="text-xs text-gray-500">
    //                           Max: ₹{coupon.maxDiscountAmount}
    //                         </div>
    //                       )}
    //                     </td>
    //                     <td className="px-6 py-4 whitespace-nowrap text-sm">
    //                       ₹{coupon.minimumOrderAmount || 0}
    //                     </td>
    //                     <td className="px-6 py-4 whitespace-nowrap text-sm">
    //                       <div>
    //                         {new Date(coupon.startDate).toLocaleDateString()}
    //                       </div>
    //                       <div>
    //                         to {new Date(coupon.endDate).toLocaleDateString()}
    //                       </div>
    //                     </td>
    //                     <td className="px-6 py-4 whitespace-nowrap text-sm">
    //                       <div>Used: {coupon.currentUsageCount || 0}</div>
    //                       <div>Limit: {coupon.totalUsageLimit || "∞"}</div>
    //                     </td>
    //                     <td className="px-6 py-4 whitespace-nowrap">
    //                       <span
    //                         className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
    //                           coupon.isActive
    //                             ? "bg-green-100 text-green-800"
    //                             : "bg-red-100 text-red-800"
    //                         }`}
    //                       >
    //                         {coupon.isActive ? "Active" : "Inactive"}
    //                       </span>
    //                     </td>
    //                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
    //                       <div className="flex space-x-2">
    //                         <button
    //                           onClick={() =>
    //                             toggleCouponStatus(coupon._id, coupon.isActive)
    //                           }
    //                           className={`${
    //                             coupon.isActive
    //                               ? "text-orange-600 hover:text-orange-900"
    //                               : "text-green-600 hover:text-green-900"
    //                           } text-sm`}
    //                         >
    //                           {coupon.isActive ? "Deactivate" : "Activate"}
    //                         </button>
    //                         <button
    //                           onClick={() => handleDeleteCoupon(coupon._id)}
    //                           className="text-red-600 hover:text-red-900 text-sm"
    //                         >
    //                           Delete
    //                         </button>
    //                       </div>
    //                     </td>
    //                   </tr>
    //                 ))}
    //               </tbody>
    //             </table>
    //           </div>

    //           {/* Mobile Cards */}
    //           <div className="lg:hidden">
    //             <div className="p-4 space-y-4">
    //               {coupons.map((coupon) => (
    //                 <div
    //                   key={coupon._id}
    //                   className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
    //                 >
    //                   <div className="space-y-3">
    //                     <div className="flex justify-between items-start">
    //                       <div>
    //                         <h3 className="font-semibold text-gray-900 text-lg font-mono">
    //                           {coupon.code}
    //                         </h3>
    //                         <p className="text-sm text-gray-600">
    //                           {coupon.name}
    //                         </p>
    //                         <div className="mt-1">
    //                           {getCouponTypeBadge(coupon.coupantype)}
    //                         </div>
    //                       </div>
    //                       <span
    //                         className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
    //                           coupon.isActive
    //                             ? "bg-green-100 text-green-800"
    //                             : "bg-red-100 text-red-800"
    //                         }`}
    //                       >
    //                         {coupon.isActive ? "Active" : "Inactive"}
    //                       </span>
    //                     </div>
    //                     <p className="text-sm text-gray-500">
    //                       {coupon.description}
    //                     </p>
    //                     <div className="grid grid-cols-2 gap-4 text-sm">
    //                       <div>
    //                         <span className="font-medium text-gray-500">
    //                           {coupon.coupantype === "cashback"
    //                             ? "Cashback:"
    //                             : "Discount:"}
    //                         </span>
    //                         <p className="font-semibold">
    //                           {coupon.discountType === "percentage"
    //                             ? `${coupon.discountValue}%`
    //                             : `₹${coupon.discountValue}`}
    //                           {coupon.maxDiscountAmount && (
    //                             <span className="text-xs text-gray-500 block">
    //                               Max: ₹{coupon.maxDiscountAmount}
    //                             </span>
    //                           )}
    //                         </p>
    //                       </div>
    //                       <div>
    //                         <span className="font-medium text-gray-500">
    //                           Min Order:
    //                         </span>
    //                         <p>₹{coupon.minimumOrderAmount || 0}</p>
    //                       </div>
    //                       <div>
    //                         <span className="font-medium text-gray-500">
    //                           Usage:
    //                         </span>
    //                         <p>
    //                           {coupon.currentUsageCount || 0}/
    //                           {coupon.totalUsageLimit || "∞"}
    //                         </p>
    //                       </div>
    //                       <div>
    //                         <span className="font-medium text-gray-500">
    //                           Per User:
    //                         </span>
    //                         <p>{coupon.perUserLimit || 1}</p>
    //                       </div>
    //                     </div>
    //                     <div className="text-sm">
    //                       <span className="font-medium text-gray-500">
    //                         Validity:
    //                       </span>
    //                       <p>
    //                         {new Date(coupon.startDate).toLocaleDateString()} -{" "}
    //                         {new Date(coupon.endDate).toLocaleDateString()}
    //                       </p>
    //                     </div>
    //                     <div className="flex gap-2 pt-2 border-t border-gray-200">
    //                       <button
    //                         onClick={() =>
    //                           toggleCouponStatus(coupon._id, coupon.isActive)
    //                         }
    //                         className={`flex-1 px-3 py-2 rounded text-sm ${
    //                           coupon.isActive
    //                             ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
    //                             : "bg-green-100 text-green-700 hover:bg-green-200"
    //                         }`}
    //                       >
    //                         {coupon.isActive ? "Deactivate" : "Activate"}
    //                       </button>
    //                       <button
    //                         onClick={() => handleDeleteCoupon(coupon._id)}
    //                         className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
    //                       >
    //                         Delete
    //                       </button>
    //                     </div>
    //                   </div>
    //                 </div>
    //               ))}
    //             </div>
    //           </div>
    //         </>
    //       )}
    //     </div>
    //   </div>
    // </div>