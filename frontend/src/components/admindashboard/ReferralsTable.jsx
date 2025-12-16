import React from "react";
import { FiCheck, FiX, FiCreditCard, FiUser } from "react-icons/fi";

const ReferralsTable = ({
  referrals,
  getReferralStatusColor,
  handleApproveReferral,
  handleCreditReferral,
  handleRejectReferral,
  actionLoading,
}) => (
  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Referrer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Referral Code & Stats
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Referred Orders
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Earnings
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {referrals.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                No referrals found
              </td>
            </tr>
          ) : (
            referrals.map((referral) => (
              <tr key={referral._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FiUser className="text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {referral.userId?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referral.userId?.email || "N/A"}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    Code: {referral.referralCode}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total Orders: {referral.totalReferralOrders}
                  </div>
                  <div className="text-xs text-gray-400">
                    Active: {referral.isActive ? "Yes" : "No"}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {referral.referredOrders.length === 0 ? (
                      <div className="text-sm text-gray-500">
                        No referred orders
                      </div>
                    ) : (
                      referral.referredOrders.map((order, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-gray-200 pl-3 py-1"
                        >
                          <div className="text-sm">
                            Order: {order.orderId?.orderNumber || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Amount: ₹{order.orderAmount} | Reward: ₹
                            {order.rewardAmount}
                          </div>
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getReferralStatusColor(
                              order.rewardStatus
                            )}`}
                          >
                            {order.rewardStatus}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <span className="font-semibold">
                      ₹{referral.totalEarnings}
                    </span>{" "}
                    Total
                  </div>
                  <div className="text-sm text-yellow-600">
                    <span className="font-semibold">
                      ₹{referral.pendingEarnings}
                    </span>{" "}
                    Pending
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="space-y-2">
                    {referral.referredOrders.map((order, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-1 border-b pb-2 last:border-b-0"
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          Order: {order.orderId?.orderNumber || `#${index + 1}`}
                        </div>
                        {order.rewardStatus === "pending" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                handleApproveReferral(referral._id, index)
                              }
                              disabled={
                                actionLoading ===
                                `referral-${referral._id}-${index}`
                              }
                              className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
                            >
                              <FiCheck size={10} />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt(
                                  "Enter rejection reason:"
                                );
                                if (reason)
                                  handleRejectReferral(
                                    referral._id,
                                    index,
                                    reason
                                  );
                              }}
                              disabled={
                                actionLoading ===
                                `referral-${referral._id}-${index}`
                              }
                              className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:bg-gray-400"
                            >
                              <FiX size={10} />
                            </button>
                          </div>
                        )}
                        {order.rewardStatus === "approved" && (
                          <button
                            onClick={() =>
                              handleCreditReferral(referral._id, index)
                            }
                            disabled={
                              actionLoading ===
                              `referral-credit-${referral._id}-${index}`
                            }
                            className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400"
                          >
                            <FiCreditCard size={10} />
                          </button>
                        )}
                        {(order.rewardStatus === "paid" ||
                          order.rewardStatus === "rejected") && (
                          <span className="text-gray-400 text-xs">
                            Completed
                          </span>
                        )}
                      </div>
                    ))}
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

export default ReferralsTable;
