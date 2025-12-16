import React from "react";

const RejectModal = ({
  showRejectModal,
  rejectionReason,
  setRejectionReason,
  setShowRejectModal,
  handleReject,
  actionLoading,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">Reject Cashback</h3>
      <p className="text-gray-600 mb-4">
        Please provide a reason for rejecting this cashback:
      </p>

      <textarea
        value={rejectionReason}
        onChange={(e) => setRejectionReason(e.target.value)}
        placeholder="Enter rejection reason..."
        rows="4"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setShowRejectModal(null);
            setRejectionReason("");
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={() => handleReject(showRejectModal)}
          disabled={actionLoading === showRejectModal}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          {actionLoading === showRejectModal
            ? "Rejecting..."
            : "Confirm Reject"}
        </button>
      </div>
    </div>
  </div>
);

export default RejectModal;
