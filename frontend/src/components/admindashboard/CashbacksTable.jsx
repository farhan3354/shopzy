import React from "react";
import { FiCheck, FiX, FiCreditCard, FiUser, FiCalendar } from "react-icons/fi";

const CashbacksTable = ({
  cashbacks,
  getStatusColor,
  handleApprove,
  handleCreditToWallet,
  setShowRejectModal,
  actionLoading,
}) => (
  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User & Order
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cashback Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dates
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cashbacks.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                No cashbacks found
              </td>
            </tr>
          ) : (
            cashbacks.map((cashback) => (
              <tr key={cashback._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiUser className="text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {cashback.userId?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cashback.userId?.email || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Order: {cashback.orderId?.orderNumber || "N/A"}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <span className="font-semibold">
                      ₹{cashback.cashbackAmount}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Coupon: {cashback.couponCode}
                  </div>
                  <div className="text-xs text-gray-400">
                    Order Amount: ₹{cashback.originalOrderAmount}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      cashback.status
                    )}`}
                  >
                    {cashback.status.charAt(0).toUpperCase() +
                      cashback.status.slice(1)}
                  </span>
                  {cashback.rejectionReason && (
                    <div className="text-xs text-red-600 mt-1">
                      Reason: {cashback.rejectionReason}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <FiCalendar className="inline mr-1" size={14} />
                    Created: {new Date(cashback.createdAt).toLocaleDateString()}
                  </div>
                  {cashback.approvedAt && (
                    <div className="text-xs mt-1">
                      Approved:{" "}
                      {new Date(cashback.approvedAt).toLocaleDateString()}
                    </div>
                  )}
                  {cashback.creditedAt && (
                    <div className="text-xs mt-1">
                      Credited:{" "}
                      {new Date(cashback.creditedAt).toLocaleDateString()}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col gap-2">
                    {cashback.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(cashback._id)}
                          disabled={actionLoading === cashback._id}
                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
                        >
                          <FiCheck className="mr-1" size={12} />
                          {actionLoading === cashback._id
                            ? "Approving..."
                            : "Approve"}
                        </button>
                        <button
                          onClick={() => setShowRejectModal(cashback._id)}
                          disabled={actionLoading === cashback._id}
                          className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:bg-gray-400"
                        >
                          <FiX className="mr-1" size={12} />
                          Reject
                        </button>
                      </>
                    )}

                    {cashback.status === "approved" && (
                      <button
                        onClick={() => handleCreditToWallet(cashback._id)}
                        disabled={actionLoading === cashback._id}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        <FiCreditCard className="mr-1" size={12} />
                        {actionLoading === cashback._id
                          ? "Crediting..."
                          : "Credit to Wallet"}
                      </button>
                    )}

                    {(cashback.status === "credited" ||
                      cashback.status === "rejected") && (
                      <span className="text-gray-400 text-xs">
                        No actions available
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default CashbacksTable;
