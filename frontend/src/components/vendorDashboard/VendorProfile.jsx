import React, { useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit,
  FiSave,
  FiShoppingBag,
  FiDollarSign,
  FiStar,
  FiCalendar,
  FiPackage,
  FiTruck,
  FiSettings,
  FiImage,
  FiPlus,
} from "react-icons/fi";

export default function VendorProfile() {
  const [vendorData, setVendorData] = useState({
    name: "EcoFriendly Products",
    email: "contact@ecofriendly.com",
    phone: "+1 (555) 123-4567",
    address: "123 Green Street, Eco City, EC 12345",
    description:
      "We provide sustainable, eco-friendly products for everyday use. Our mission is to reduce plastic waste and promote a greener lifestyle.",
    rating: 4.7,
    totalSales: 1243,
    joinDate: "Jan 15, 2022",
    productsCount: 87,
    deliveryTime: "2-3 business days",
    profileImage:
      "https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...vendorData });

  const handleSave = () => {
    setVendorData(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(vendorData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Sample stats data
  const stats = [
    {
      label: "Total Products",
      value: vendorData.productsCount,
      icon: <FiPackage className="text-blue-500" />,
    },
    {
      label: "Total Sales",
      value: vendorData.totalSales,
      icon: <FiShoppingBag className="text-green-500" />,
    },
    {
      label: "Avg. Rating",
      value: vendorData.rating,
      icon: <FiStar className="text-yellow-500" />,
    },
    {
      label: "Delivery Time",
      value: vendorData.deliveryTime,
      icon: <FiTruck className="text-purple-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cover Photo */}
        <div className="relative h-48 rounded-lg overflow-hidden mb-6 shadow-md">
          <img
            src={vendorData.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <button className="bg-white bg-opacity-90 text-gray-800 px-4 py-2 rounded-lg flex items-center font-medium">
              <FiImage className="mr-2" />
              Change Cover Photo
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="relative mb-4 md:mb-0 md:mr-6">
              <img
                src={vendorData.profileImage}
                alt="Vendor"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
              <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-md">
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editedData.name}
                      onChange={handleChange}
                      className="text-2xl font-bold border-b border-gray-300 focus:border-blue-500 focus:outline-none mb-2"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">
                      {vendorData.name}
                    </h1>
                  )}

                  <div className="flex items-center text-gray-600 mb-2">
                    <FiStar className="text-yellow-500 mr-1" />
                    <span className="font-medium">{vendorData.rating}</span>
                    <span className="mx-2">•</span>
                    <FiCalendar className="mr-1" />
                    <span>Joined {vendorData.joinDate}</span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center font-medium"
                      >
                        <FiSave className="mr-2" />
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center font-medium"
                    >
                      <FiEdit className="mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  name="description"
                  value={editedData.description}
                  onChange={handleChange}
                  className="w-full mt-4 p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  rows="3"
                />
              ) : (
                <p className="mt-4 text-gray-600">{vendorData.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-4 flex items-center"
            >
              <div className="p-3 rounded-full bg-gray-100 mr-4">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiSettings className="mr-2 text-blue-500" />
              Store Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 mr-4">
                  <FiMail className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedData.email}
                      onChange={handleChange}
                      className="border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium">{vendorData.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 mr-4">
                  <FiPhone className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={editedData.phone}
                      onChange={handleChange}
                      className="border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium">{vendorData.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-full bg-purple-100 mr-4 mt-1">
                  <FiMapPin className="text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={editedData.address}
                      onChange={handleChange}
                      className="border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                    />
                  ) : (
                    <p className="font-medium">{vendorData.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiShoppingBag className="mr-2 text-blue-500" />
              Quick Actions
            </h2>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                <span>Add New Product</span>
                <FiPlus />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                <span>View Orders</span>
                <FiShoppingBag />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors">
                <span>Sales Reports</span>
                <FiDollarSign />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
                <span>Store Settings</span>
                <FiSettings />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
