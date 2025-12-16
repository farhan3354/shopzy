import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiMessageSquare,
  FiUser,
  FiMail,
  FiCalendar,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import useFetchData from "../../hooks/useFetchData";
import { CONTACT_ROUTES } from "../../../utils/apiRoute";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });
  const [selectedMessage, setSelectedMessage] = useState(null);

  const token = useSelector((state) => state.auth.token);
  const { fetchData, deleteData, loading } = useFetchData(token);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    await fetchData(CONTACT_ROUTES.all, (data) => {
      if (data.success) {
        setMessages(data.messages || []);
      }
    });
  };

  const deleteMessage = async (messageId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This message will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteData(
            CONTACT_ROUTES.delete(messageId),
            "Message has been deleted."
          );
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        } catch (error) {
          // Error is handled by the hook
        }
      }
    });
  };

  const filteredMessages = messages.filter((message) => {
    const matchesStatus =
      filters.status === "all" || message.status === filters.status;
    const matchesSearch =
      message.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
      message.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      message.email?.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Contact Messages
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage customer inquiries and support requests
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FiMessageSquare className="mx-auto text-3xl sm:text-4xl text-gray-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No messages found
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                No contact messages match your current filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMessages.map((message) => (
                      <tr key={message._id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <FiUser className="text-indigo-600 text-sm sm:text-base" />
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {message.name}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500">
                                {message.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="max-w-xs truncate text-sm text-gray-600">
                            {message.message}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedMessage(message)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center text-xs sm:text-sm transition-colors"
                            >
                              <FiEye className="inline mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => deleteMessage(message._id)}
                              className="text-red-600 hover:text-red-900 flex items-center text-xs sm:text-sm transition-colors"
                            >
                              <FiTrash2 className="inline mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {filteredMessages.map((message) => (
                    <div
                      key={message._id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <FiUser className="text-indigo-600 text-sm" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {message.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {message.email}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleDateString()} at{" "}
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() => setSelectedMessage(message)}
                            className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <FiEye className="text-sm" />
                            View
                          </button>
                          <button
                            onClick={() => deleteMessage(message._id)}
                            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <FiTrash2 className="text-sm" />
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="bg-white rounded-xl border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <FiMail className="mr-2 text-indigo-600" />
                Message Details
              </h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {/* Modal content remains the same */}
              <div className="flex items-center text-gray-700">
                <FiUser className="mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                  <strong className="text-sm text-gray-500">Name</strong>
                  <p className="text-gray-900">{selectedMessage.name}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <FiMail className="mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                  <strong className="text-sm text-gray-500">Email</strong>
                  <p className="text-gray-900 break-all">
                    {selectedMessage.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <FiCalendar className="mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                  <strong className="text-sm text-gray-500">Date</strong>
                  <p className="text-gray-900">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedMessage.subject && (
                <div>
                  <strong className="text-sm text-gray-500">Subject</strong>
                  <p className="text-gray-900 mt-1">
                    {selectedMessage.subject}
                  </p>
                </div>
              )}

              <div>
                <strong className="text-sm text-gray-500">Message</strong>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 mt-1">
                  <p className="text-gray-800 whitespace-pre-line text-sm sm:text-base">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-full px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    // <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
    //   <div className="max-w-7xl mx-auto">
    //     <div className="mb-6 sm:mb-8">
    //       <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
    //         Contact Messages
    //       </h1>
    //       <p className="text-gray-600 mt-2 text-sm sm:text-base">
    //         Manage customer inquiries and support requests
    //       </p>
    //     </div>
    //     <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
    //       <div className="relative">
    //         <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    //         <input
    //           type="text"
    //           placeholder="Search by name, email, or subject..."
    //           value={filters.search}
    //           onChange={(e) =>
    //             setFilters({ ...filters, search: e.target.value })
    //           }
    //           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
    //         />
    //       </div>
    //     </div>
    //     <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
    //       {filteredMessages.length === 0 ? (
    //         <div className="text-center py-8 sm:py-12">
    //           <FiMessageSquare className="mx-auto text-3xl sm:text-4xl text-gray-400 mb-3 sm:mb-4" />
    //           <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
    //             No messages found
    //           </h3>
    //           <p className="text-gray-500 text-sm sm:text-base">
    //             No contact messages match your current filters.
    //           </p>
    //         </div>
    //       ) : (
    //         <>
    //           <div className="hidden lg:block">
    //             <table className="min-w-full divide-y divide-gray-200">
    //               <thead className="bg-gray-50">
    //                 <tr>
    //                   <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Customer
    //                   </th>
    //                   <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Message
    //                   </th>
    //                   <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Date
    //                   </th>
    //                   <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Actions
    //                   </th>
    //                 </tr>
    //               </thead>
    //               <tbody className="bg-white divide-y divide-gray-200">
    //                 {filteredMessages.map((message) => (
    //                   <tr key={message._id} className="hover:bg-gray-50">
    //                     <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
    //                       <div className="flex items-center">
    //                         <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-indigo-100 rounded-full flex items-center justify-center">
    //                           <FiUser className="text-indigo-600 text-sm sm:text-base" />
    //                         </div>
    //                         <div className="ml-3 sm:ml-4">
    //                           <div className="text-sm font-medium text-gray-900">
    //                             {message.name}
    //                           </div>
    //                           <div className="text-xs sm:text-sm text-gray-500">
    //                             {message.email}
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </td>
    //                     <td className="px-4 sm:px-6 py-4">
    //                       <div className="max-w-xs truncate text-sm">
    //                         {message.message}
    //                       </div>
    //                     </td>
    //                     <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
    //                       <div className="text-sm text-gray-900">
    //                         {new Date(message.createdAt).toLocaleDateString()}
    //                       </div>
    //                       <div className="text-xs text-gray-500">
    //                         {new Date(message.createdAt).toLocaleTimeString()}
    //                       </div>
    //                     </td>
    //                     <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
    //                       <div className="flex space-x-2">
    //                         <button
    //                           onClick={() => setSelectedMessage(message)}
    //                           className="text-indigo-600 hover:text-indigo-900 flex items-center text-xs sm:text-sm"
    //                         >
    //                           <FiEye className="inline mr-1" />
    //                           View
    //                         </button>
    //                         <button
    //                           onClick={() => deleteMessage(message._id)}
    //                           className="text-red-600 hover:text-red-900 flex items-center text-xs sm:text-sm"
    //                         >
    //                           <FiTrash2 className="inline mr-1" />
    //                           Delete
    //                         </button>
    //                       </div>
    //                     </td>
    //                   </tr>
    //                 ))}
    //               </tbody>
    //             </table>
    //           </div>
    //           <div className="lg:hidden">
    //             <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
    //               {filteredMessages.map((message) => (
    //                 <div
    //                   key={message._id}
    //                   className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
    //                 >
    //                   <div className="space-y-3">
    //                     <div className="flex justify-between items-start">
    //                       <div className="flex items-center">
    //                         <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
    //                           <FiUser className="text-indigo-600 text-sm" />
    //                         </div>
    //                         <div className="ml-3">
    //                           <div className="text-sm font-medium text-gray-900">
    //                             {message.name}
    //                           </div>
    //                           <div className="text-xs text-gray-500">
    //                             {message.email}
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>
    //                     <div>
    //                       <p className="text-sm text-gray-700 line-clamp-2">
    //                         {message.message}
    //                       </p>
    //                     </div>
    //                     <div className="text-xs text-gray-500">
    //                       {new Date(message.createdAt).toLocaleDateString()} at{" "}
    //                       {new Date(message.createdAt).toLocaleTimeString()}
    //                     </div>
    //                     <div className="flex gap-2 pt-2 border-t border-gray-200">
    //                       <button
    //                         onClick={() => setSelectedMessage(message)}
    //                         className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1"
    //                       >
    //                         <FiEye className="text-sm" />
    //                         View
    //                       </button>
    //                       <button
    //                         onClick={() => deleteMessage(message._id)}
    //                         className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
    //                       >
    //                         <FiTrash2 className="text-sm" />
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
    //   {selectedMessage && (
    //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
    //       <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
    //         <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
    //           <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
    //             <FiMail className="mr-2 text-indigo-600" />
    //             Message Details
    //           </h2>
    //           <button
    //             onClick={() => setSelectedMessage(null)}
    //             className="text-gray-400 hover:text-gray-600 transition-colors"
    //           >
    //             <FiX className="text-xl" />
    //           </button>
    //         </div>
    //         <div className="p-4 sm:p-6 space-y-4">
    //           <div className="flex items-center text-gray-700">
    //             <FiUser className="mr-3 text-indigo-500 flex-shrink-0" />
    //             <div>
    //               <strong className="text-sm text-gray-500">Name</strong>
    //               <p className="text-gray-900">{selectedMessage.name}</p>
    //             </div>
    //           </div>

    //           <div className="flex items-center text-gray-700">
    //             <FiMail className="mr-3 text-indigo-500 flex-shrink-0" />
    //             <div>
    //               <strong className="text-sm text-gray-500">Email</strong>
    //               <p className="text-gray-900 break-all">
    //                 {selectedMessage.email}
    //               </p>
    //             </div>
    //           </div>

    //           <div className="flex items-center text-gray-700">
    //             <FiCalendar className="mr-3 text-indigo-500 flex-shrink-0" />
    //             <div>
    //               <strong className="text-sm text-gray-500">Date</strong>
    //               <p className="text-gray-900">
    //                 {new Date(selectedMessage.createdAt).toLocaleString()}
    //               </p>
    //             </div>
    //           </div>

    //           {selectedMessage.subject && (
    //             <div>
    //               <strong className="text-sm text-gray-500">Subject</strong>
    //               <p className="text-gray-900 mt-1">
    //                 {selectedMessage.subject}
    //               </p>
    //             </div>
    //           )}

    //           <div>
    //             <strong className="text-sm text-gray-500">Message</strong>
    //             <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border mt-1">
    //               <p className="text-gray-800 whitespace-pre-line text-sm sm:text-base">
    //                 {selectedMessage.message}
    //               </p>
    //             </div>
    //           </div>
    //         </div>
    //         <div className="p-4 sm:p-6 border-t border-gray-200">
    //           <button
    //             onClick={() => setSelectedMessage(null)}
    //             className="w-full px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
    //           >
    //             Close
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </div>
  );
}
