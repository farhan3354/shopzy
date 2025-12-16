import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import useFetchData from "../../hooks/useFetchData";
import { FOOTER_ROUTES } from "../../../utils/apiRoute";

const FooterManagement = () => {
  const [footerData, setFooterData] = useState(null);
  const [message, setMessage] = useState("");
  const token = useSelector((state) => state.auth.token);

  const { fetchData, postData, loading } = useFetchData(token);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    await fetchData(FOOTER_ROUTES.get, (data) => {
      if (data.success) {
        setFooterData(data.footer || data.data);
      }
    });
  };

  const handleInputChange = (section, field, value, subField = null) => {
    setFooterData((prev) => {
      if (!prev) return prev;

      if (subField) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...prev[section]?.[field],
              [subField]: value,
            },
          },
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };

  const handleMoreInfoLinkChange = (columnIndex, linkIndex, field, value) => {
    setFooterData((prev) => {
      if (!prev?.moreInfo?.links) return prev;

      const newMoreInfo = { ...prev.moreInfo };
      const newLinks = [...newMoreInfo.links];

      if (!newLinks[columnIndex]?.column1) return prev;

      const newColumn1 = [...newLinks[columnIndex].column1];

      newColumn1[linkIndex] = {
        ...newColumn1[linkIndex],
        [field]: value,
      };

      newLinks[columnIndex] = {
        ...newLinks[columnIndex],
        column1: newColumn1,
      };

      return {
        ...prev,
        moreInfo: {
          ...newMoreInfo,
          links: newLinks,
        },
      };
    });
  };

  const handleSocialPlatformChange = (index, field, value) => {
    setFooterData((prev) => {
      if (!prev?.social?.platforms) return prev;

      const newSocial = { ...prev.social };
      const newPlatforms = [...newSocial.platforms];

      newPlatforms[index] = {
        ...newPlatforms[index],
        [field]: value,
      };

      return {
        ...prev,
        social: {
          ...newSocial,
          platforms: newPlatforms,
        },
      };
    });
  };

  const addMoreInfoLink = () => {
    setFooterData((prev) => {
      if (!prev?.moreInfo?.links) return prev;

      const newMoreInfo = { ...prev.moreInfo };
      const newLinks = [...newMoreInfo.links];

      if (newLinks[0]?.column1) {
        newLinks[0] = {
          ...newLinks[0],
          column1: [...newLinks[0].column1, { text: "", href: "" }],
        };
      }

      return {
        ...prev,
        moreInfo: {
          ...newMoreInfo,
          links: newLinks,
        },
      };
    });
  };

  const removeMoreInfoLink = (linkIndex) => {
    setFooterData((prev) => {
      if (!prev?.moreInfo?.links?.[0]?.column1) return prev;

      const newMoreInfo = { ...prev.moreInfo };
      const newLinks = [...newMoreInfo.links];

      if (newLinks[0]?.column1) {
        newLinks[0] = {
          ...newLinks[0],
          column1: newLinks[0].column1.filter(
            (_, index) => index !== linkIndex
          ),
        };
      }

      return {
        ...prev,
        moreInfo: {
          ...newMoreInfo,
          links: newLinks,
        },
      };
    });
  };

  const addSocialPlatform = () => {
    setFooterData((prev) => {
      const newSocial = prev?.social
        ? { ...prev.social }
        : { title: "", platforms: [] };
      const newPlatforms = newSocial.platforms ? [...newSocial.platforms] : [];

      newPlatforms.push({ name: "", icon: "", href: "" });

      return {
        ...prev,
        social: {
          ...newSocial,
          platforms: newPlatforms,
        },
      };
    });
  };

  const removeSocialPlatform = (index) => {
    setFooterData((prev) => {
      if (!prev?.social?.platforms) return prev;

      const newSocial = { ...prev.social };
      const newPlatforms = newSocial.platforms.filter((_, i) => i !== index);

      return {
        ...prev,
        social: {
          ...newSocial,
          platforms: newPlatforms,
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      setMessage("");

      await postData(
        FOOTER_ROUTES.create,
        footerData,
        "Footer updated successfully!"
      );

      fetchFooterData();
    } catch (error) {
      console.error("Error updating footer:", error);
    }
  };

  if (loading && !footerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading footer data...</p>
        </div>
      </div>
    );
  }

  if (!footerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No footer data available</p>
          <button
            onClick={fetchFooterData}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">
                Footer Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your website footer content
              </p>
            </div>
            <div className="p-6 space-y-6">
              {message && (
                <div
                  className={`p-4 rounded-lg border ${
                    message.includes("success")
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {message}
                </div>
              )}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  About Section
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={footerData.about?.title || ""}
                      onChange={(e) =>
                        handleInputChange("about", "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="About Us"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={footerData.about?.content || ""}
                      onChange={(e) =>
                        handleInputChange("about", "content", e.target.value)
                      }
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Write about your company..."
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  More Info Links
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={footerData.moreInfo?.title || ""}
                      onChange={(e) =>
                        handleInputChange("moreInfo", "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="More Information"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Links
                      </label>
                      <button
                        type="button"
                        onClick={addMoreInfoLink}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 border border-green-700"
                      >
                        + Add Link
                      </button>
                    </div>
                    {footerData.moreInfo?.links?.[0]?.column1?.map(
                      (link, index) => (
                        <div key={index} className="flex gap-4 mb-3 items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Link Text
                            </label>
                            <input
                              type="text"
                              value={link.text || ""}
                              onChange={(e) =>
                                handleMoreInfoLinkChange(
                                  0,
                                  index,
                                  "text",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="About Us"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Link URL
                            </label>
                            <input
                              type="text"
                              value={link.href || ""}
                              onChange={(e) =>
                                handleMoreInfoLinkChange(
                                  0,
                                  index,
                                  "href",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="/about"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMoreInfoLink(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mb-1 border border-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  Contact Section
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={footerData.contact?.title || ""}
                      onChange={(e) =>
                        handleInputChange("contact", "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Contact Us"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Help Text
                    </label>
                    <input
                      type="text"
                      value={footerData.contact?.content?.help?.text || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "contact",
                          "content",
                          {
                            ...footerData.contact?.content?.help,
                            text: e.target.value,
                          },
                          "help"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Need Help?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Help Link
                    </label>
                    <input
                      type="text"
                      value={footerData.contact?.content?.help?.href || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "contact",
                          "content",
                          {
                            ...footerData.contact?.content?.help,
                            href: e.target.value,
                          },
                          "help"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="/help"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Text
                    </label>
                    <input
                      type="text"
                      value={footerData.contact?.content?.company || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "contact",
                          "content",
                          e.target.value,
                          "company"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={footerData.contact?.content?.address || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "contact",
                          "content",
                          e.target.value,
                          "address"
                        )
                      }
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Your company address..."
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  Social Media
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={footerData.social?.title || ""}
                      onChange={(e) =>
                        handleInputChange("social", "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Follow Us"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">
                        Social Platforms
                      </label>
                      <button
                        type="button"
                        onClick={addSocialPlatform}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 border border-green-700"
                      >
                        + Add Platform
                      </button>
                    </div>

                    {footerData.social?.platforms?.map((platform, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-white"
                      >
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Platform Name
                          </label>
                          <input
                            type="text"
                            value={platform.name || ""}
                            onChange={(e) =>
                              handleSocialPlatformChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Facebook"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Icon Name
                          </label>
                          <input
                            type="text"
                            value={platform.icon || ""}
                            onChange={(e) =>
                              handleSocialPlatformChange(
                                index,
                                "icon",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="facebook"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profile URL
                          </label>
                          <input
                            type="text"
                            value={platform.href || ""}
                            onChange={(e) =>
                              handleSocialPlatformChange(
                                index,
                                "href",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="https://facebook.com/yourpage"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSocialPlatform(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 self-end border border-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  Decorative Image
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={footerData.decorative?.image || ""}
                      onChange={(e) =>
                        handleInputChange("decorative", "image", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="https://example.com/image.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={footerData.decorative?.alt || ""}
                      onChange={(e) =>
                        handleInputChange("decorative", "alt", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Decorative footer image"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors border border-indigo-700"
                >
                  {loading ? "Saving..." : "Save Footer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FooterManagement;

// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import api from "../../../utils/api";

// const FooterManagement = () => {
//   const [footerData, setFooterData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");
//   const token = useSelector((state) => state.auth.token);

//   useEffect(() => {
//     fetchFooterData();
//   }, []);

//   const fetchFooterData = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/footer/get");
//       if (response.data.success) {
//         setFooterData(response.data.footer);
//       }
//     } catch (error) {
//       console.error("Error fetching footer:", error);
//       setMessage("Failed to load footer data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (section, field, value, subField = null) => {
//     setFooterData((prev) => {
//       if (subField) {
//         return {
//           ...prev,
//           [section]: {
//             ...prev[section],
//             [field]: {
//               ...prev[section][field],
//               [subField]: value,
//             },
//           },
//         };
//       }
//       return {
//         ...prev,
//         [section]: {
//           ...prev[section],
//           [field]: value,
//         },
//       };
//     });
//   };

//   const handleMoreInfoLinkChange = (columnIndex, linkIndex, field, value) => {
//     setFooterData((prev) => {
//       const newMoreInfo = { ...prev.moreInfo };
//       const newLinks = [...newMoreInfo.links];
//       const newColumn1 = [...newLinks[columnIndex].column1];

//       newColumn1[linkIndex] = {
//         ...newColumn1[linkIndex],
//         [field]: value,
//       };

//       newLinks[columnIndex] = {
//         ...newLinks[columnIndex],
//         column1: newColumn1,
//       };

//       return {
//         ...prev,
//         moreInfo: {
//           ...newMoreInfo,
//           links: newLinks,
//         },
//       };
//     });
//   };

//   const handleSocialPlatformChange = (index, field, value) => {
//     setFooterData((prev) => {
//       const newSocial = { ...prev.social };
//       const newPlatforms = [...newSocial.platforms];

//       newPlatforms[index] = {
//         ...newPlatforms[index],
//         [field]: value,
//       };

//       return {
//         ...prev,
//         social: {
//           ...newSocial,
//           platforms: newPlatforms,
//         },
//       };
//     });
//   };

//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       setMessage("");

//       const response = await api.post("/footer/post", footerData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data.success) {
//         setMessage("Footer updated successfully!");
//       }
//     } catch (error) {
//       console.error("Error updating footer:", error);
//       setMessage("Failed to update footer");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return <div className="p-6">Loading footer data...</div>;
//   }

//   if (!footerData) {
//     return <div className="p-6">No footer data available</div>;
//   }

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">Footer Management</h1>

//       {message && (
//         <div
//           className={`p-4 mb-4 rounded ${
//             message.includes("success")
//               ? "bg-green-100 text-green-800"
//               : "bg-red-100 text-red-800"
//           }`}
//         >
//           {message}
//         </div>
//       )}

//       <div className="space-y-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h2 className="text-lg font-semibold mb-4">About Section</h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Title</label>
//               <input
//                 type="text"
//                 value={footerData.about?.title || ""}
//                 onChange={(e) =>
//                   handleInputChange("about", "title", e.target.value)
//                 }
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">Content</label>
//               <textarea
//                 value={footerData.about?.content || ""}
//                 onChange={(e) =>
//                   handleInputChange("about", "content", e.target.value)
//                 }
//                 rows="4"
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h2 className="text-lg font-semibold mb-4">More Info Links</h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Section Title
//               </label>
//               <input
//                 type="text"
//                 value={footerData.moreInfo?.title || ""}
//                 onChange={(e) =>
//                   handleInputChange("moreInfo", "title", e.target.value)
//                 }
//                 className="w-full p-2 border rounded"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Links</label>
//               {footerData.moreInfo?.links?.[0]?.column1?.map((link, index) => (
//                 <div key={index} className="flex gap-4 mb-3">
//                   <div className="flex-1">
//                     <label className="block text-sm font-medium mb-1">
//                       Link Text
//                     </label>
//                     <input
//                       type="text"
//                       value={link.text || ""}
//                       onChange={(e) =>
//                         handleMoreInfoLinkChange(
//                           0,
//                           index,
//                           "text",
//                           e.target.value
//                         )
//                       }
//                       className="w-full p-2 border rounded"
//                       placeholder="Link text"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-sm font-medium mb-1">
//                       Link URL
//                     </label>
//                     <input
//                       type="text"
//                       value={link.href || ""}
//                       onChange={(e) =>
//                         handleMoreInfoLinkChange(
//                           0,
//                           index,
//                           "href",
//                           e.target.value
//                         )
//                       }
//                       className="w-full p-2 border rounded"
//                       placeholder="/page-url"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h2 className="text-lg font-semibold mb-4">Contact Section</h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Section Title
//               </label>
//               <input
//                 type="text"
//                 value={footerData.contact?.title || ""}
//                 onChange={(e) =>
//                   handleInputChange("contact", "title", e.target.value)
//                 }
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Help Text
//               </label>
//               <input
//                 type="text"
//                 value={footerData.contact?.content?.help?.text || ""}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "contact",
//                     "content",
//                     e.target.value,
//                     "help"
//                   )
//                 }
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Help Link
//               </label>
//               <input
//                 type="text"
//                 value={footerData.contact?.content?.help?.href || ""}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "contact",
//                     "content",
//                     e.target.value,
//                     "help"
//                   )
//                 }
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Company Text
//               </label>
//               <input
//                 type="text"
//                 value={footerData.contact?.content?.company || ""}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "contact",
//                     "content",
//                     e.target.value,
//                     "company"
//                   )
//                 }
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">Address</label>
//               <textarea
//                 value={footerData.contact?.content?.address || ""}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "contact",
//                     "content",
//                     e.target.value,
//                     "address"
//                   )
//                 }
//                 rows="3"
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h2 className="text-lg font-semibold mb-4">Social Media</h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Section Title
//               </label>
//               <input
//                 type="text"
//                 value={footerData.social?.title || ""}
//                 onChange={(e) =>
//                   handleInputChange("social", "title", e.target.value)
//                 }
//                 className="w-full p-2 border rounded"
//               />
//             </div>

//             <div className="space-y-3">
//               <label className="block text-sm font-medium mb-2">
//                 Social Platforms
//               </label>
//               {footerData.social?.platforms?.map((platform, index) => (
//                 <div key={index} className="flex gap-4 p-3 border rounded">
//                   <div className="flex-1">
//                     <label className="block text-sm font-medium mb-1">
//                       Platform Name
//                     </label>
//                     <input
//                       type="text"
//                       value={platform.name || ""}
//                       onChange={(e) =>
//                         handleSocialPlatformChange(
//                           index,
//                           "name",
//                           e.target.value
//                         )
//                       }
//                       className="w-full p-2 border rounded"
//                       placeholder="Facebook, Instagram, etc."
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-sm font-medium mb-1">
//                       Icon Name
//                     </label>
//                     <input
//                       type="text"
//                       value={platform.icon || ""}
//                       onChange={(e) =>
//                         handleSocialPlatformChange(
//                           index,
//                           "icon",
//                           e.target.value
//                         )
//                       }
//                       className="w-full p-2 border rounded"
//                       placeholder="facebook, instagram, etc."
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-sm font-medium mb-1">
//                       Profile URL
//                     </label>
//                     <input
//                       type="text"
//                       value={platform.href || ""}
//                       onChange={(e) =>
//                         handleSocialPlatformChange(
//                           index,
//                           "href",
//                           e.target.value
//                         )
//                       }
//                       className="w-full p-2 border rounded"
//                       placeholder="https://..."
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h2 className="text-lg font-semibold mb-4">Decorative Image</h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Image URL
//               </label>
//               <input
//                 type="text"
//                 value={footerData.decorative?.image || ""}
//                 onChange={(e) =>
//                   handleInputChange("decorative", "image", e.target.value)
//                 }
//                 className="w-full p-2 border rounded"
//                 placeholder="https://example.com/image.png"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">Alt Text</label>
//               <input
//                 type="text"
//                 value={footerData.decorative?.alt || ""}
//                 onChange={(e) =>
//                   handleInputChange("decorative", "alt", e.target.value)
//                 }
//                 className="w-full p-2 border rounded"
//                 placeholder="Description of image"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end">
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//           >
//             {saving ? "Saving..." : "Save Footer"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FooterManagement;
