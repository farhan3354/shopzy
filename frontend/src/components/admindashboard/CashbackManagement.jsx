import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import { useSelector } from "react-redux";
import {
  FiDollarSign,
  FiCheck,
  FiX,
  FiCreditCard,
  FiUser,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiUsers,
  FiGift,
} from "react-icons/fi";
import CashbacksTable from "./CashbacksTable";
import ReferralsTable from "./ReferralsTable";
import RejectModal from "./RejectModal";
import { COUPON_ROUTES } from "../../../utils/apiRoute";
import useFetchData from "../../hooks/useFetchData";

const CashbackManagement = () => {
  const [cashbacks, setCashbacks] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [activeTab, setActiveTab] = useState("cashbacks");

  const token = useSelector((state) => state.auth.token);
  const { fetchData, updateData, loading } = useFetchData(token);

  useEffect(() => {
    if (activeTab === "cashbacks") {
      fetchCashbacks();
    } else {
      fetchReferrals();
    }
  }, [filter, activeTab]);

  const fetchCashbacks = async () => {
    await fetchData(COUPON_ROUTES.cashbacks, (data) => {
      setCashbacks(data.cashbacks || []);
    });
  };

  const fetchReferrals = async () => {
    await fetchData(COUPON_ROUTES.referrals, (data) => {
      setReferrals(data.referrals || []);
    });
  };

  const handleApprove = async (cashbackId) => {
    try {
      setActionLoading(cashbackId);
      await updateData(
        COUPON_ROUTES.approveCashback(cashbackId),
        {},
        "Cashback approved successfully!"
      );
      fetchCashbacks();
    } catch (error) {
      console.error("Error approving cashback:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreditToWallet = async (cashbackId) => {
    try {
      setActionLoading(cashbackId);
      const result = await updateData(
        COUPON_ROUTES.creditCashback(cashbackId),
        {},
        `Cashback credited successfully! New wallet balance: ₹${
          result?.walletUpdate?.newBalance || "N/A"
        }`
      );
      fetchCashbacks();
    } catch (error) {
      console.error("Error crediting cashback:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (cashbackId) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(cashbackId);
      await updateData(
        COUPON_ROUTES.rejectCashback(cashbackId),
        { rejectionReason },
        "Cashback rejected successfully!"
      );
      setShowRejectModal(null);
      setRejectionReason("");
      fetchCashbacks();
    } catch (error) {
      console.error("Error rejecting cashback:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveReferral = async (referralId, orderIndex) => {
    try {
      setActionLoading(`referral-${referralId}-${orderIndex}`);
      await updateData(
        COUPON_ROUTES.approveReferral(referralId, orderIndex),
        {},
        "Referral reward approved successfully!"
      );
      fetchReferrals();
    } catch (error) {
      console.error("Error approving referral:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreditReferral = async (referralId, orderIndex) => {
    try {
      setActionLoading(`referral-credit-${referralId}-${orderIndex}`);
      await updateData(
        COUPON_ROUTES.creditReferral(referralId, orderIndex),
        {},
        "Referral reward credited successfully!"
      );
      fetchReferrals();
    } catch (error) {
      console.error("Error crediting referral:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectReferral = async (referralId, orderIndex, reason) => {
    if (!reason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(`referral-reject-${referralId}-${orderIndex}`);
      await updateData(
        COUPON_ROUTES.rejectReferral(referralId, orderIndex),
        { rejectionReason: reason },
        "Referral reward rejected successfully!"
      );
      fetchReferrals();
    } catch (error) {
      console.error("Error rejecting referral:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "credited":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReferralStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCashbacks = cashbacks.filter((cashback) => {
    const matchesFilter = filter === "all" || cashback.status === filter;
    const matchesSearch =
      cashback.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cashback.userId?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cashback.orderId?.orderNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cashback.couponCode?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      referral.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.userId?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      referral.referralCode?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const stats = {
    total: cashbacks.length,
    pending: cashbacks.filter((c) => c.status === "pending").length,
    approved: cashbacks.filter((c) => c.status === "approved").length,
    credited: cashbacks.filter((c) => c.status === "credited").length,
    rejected: cashbacks.filter((c) => c.status === "rejected").length,
  };

  const referralStats = {
    totalUsers: referrals.length,
    totalEarnings: referrals.reduce(
      (sum, ref) => sum + (ref.totalEarnings || 0),
      0
    ),
    pendingEarnings: referrals.reduce(
      (sum, ref) => sum + (ref.pendingEarnings || 0),
      0
    ),
    totalOrders: referrals.reduce(
      (sum, ref) => sum + (ref.totalReferralOrders || 0),
      0
    ),
    pendingOrders: referrals.reduce(
      (sum, ref) =>
        sum +
        (ref.referredOrders?.filter((order) => order.rewardStatus === "pending")
          .length || 0),
      0
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="animate-spin text-indigo-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">
            Loading {activeTab === "cashbacks" ? "cashbacks" : "referrals"}...
          </h2>
        </div>
      </div>
    );
  }

  return (
 <>
 <div className="min-h-screen bg-gray-50 p-6">
  <div className="max-w-7xl mx-auto">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {activeTab === "cashbacks"
          ? "Cashback Management"
          : "Referral Management"}
      </h1>
      <p className="text-gray-600">
        {activeTab === "cashbacks"
          ? "Manage and process customer cashback requests"
          : "Manage referral rewards and track referral performance"}
      </p>
    </div>
    
    {/* Tab Navigation */}
    <div className="flex border-b border-gray-200 mb-6">
      <button
        className={`flex items-center px-4 py-2 font-medium ${
          activeTab === "cashbacks"
            ? "border-b-2 border-indigo-600 text-indigo-600"
            : "text-gray-600 hover:text-gray-900"
        }`}
        onClick={() => setActiveTab("cashbacks")}
      >
        <FiDollarSign className="mr-2" />
        Cashbacks
      </button>
      <button
        className={`flex items-center px-4 py-2 font-medium ${
          activeTab === "referrals"
            ? "border-b-2 border-indigo-600 text-indigo-600"
            : "text-gray-600 hover:text-gray-900"
        }`}
        onClick={() => setActiveTab("referrals")}
      >
        <FiUsers className="mr-2" />
        Referrals
      </button>
    </div>

    {/* Stats Cards */}
    {activeTab === "cashbacks" ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, icon: FiDollarSign, bg: "bg-gray-100", text: "text-gray-600" },
          { label: "Pending", value: stats.pending, icon: FiRefreshCw, bg: "bg-yellow-100", text: "text-yellow-600" },
          { label: "Approved", value: stats.approved, icon: FiCheck, bg: "bg-blue-100", text: "text-blue-600" },
          { label: "Credited", value: stats.credited, icon: FiCreditCard, bg: "bg-green-100", text: "text-green-600" },
          { label: "Rejected", value: stats.rejected, icon: FiX, bg: "bg-red-100", text: "text-red-600" }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <div className={`p-2 ${stat.bg} rounded-lg`}>
                <stat.icon className={`${stat.text} text-xl`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.text}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Referrers", value: referralStats.totalUsers, icon: FiUsers, bg: "bg-gray-100", text: "text-gray-600" },
          { label: "Total Earnings", value: `₹${referralStats.totalEarnings}`, icon: FiDollarSign, bg: "bg-green-100", text: "text-green-600" },
          { label: "Pending Earnings", value: `₹${referralStats.pendingEarnings}`, icon: FiRefreshCw, bg: "bg-yellow-100", text: "text-yellow-600" },
          { label: "Total Orders", value: referralStats.totalOrders, icon: FiGift, bg: "bg-blue-100", text: "text-blue-600" },
          { label: "Pending Orders", value: referralStats.pendingOrders, icon: FiCalendar, bg: "bg-orange-100", text: "text-orange-600" }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <div className={`p-2 ${stat.bg} rounded-lg`}>
                <stat.icon className={`${stat.text} text-xl`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.text}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Search and Filter Section */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === "cashbacks"
                  ? "Search by user, order, or coupon..."
                  : "Search by referrer or referral code..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {activeTab === "cashbacks" && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="credited">Credited</option>
              <option value="rejected">Rejected</option>
            </select>
          )}

          <button
            onClick={
              activeTab === "cashbacks" ? fetchCashbacks : fetchReferrals
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
        </div>
      </div>
    </div>

    {/* Table Section */}
    {activeTab === "cashbacks" ? (
      <CashbacksTable
        cashbacks={filteredCashbacks}
        getStatusColor={getStatusColor}
        handleApprove={handleApprove}
        handleCreditToWallet={handleCreditToWallet}
        setShowRejectModal={setShowRejectModal}
        actionLoading={actionLoading}
      />
    ) : (
      <ReferralsTable
        referrals={filteredReferrals}
        getReferralStatusColor={getReferralStatusColor}
        handleApproveReferral={handleApproveReferral}
        handleCreditReferral={handleCreditReferral}
        handleRejectReferral={handleRejectReferral}
        actionLoading={actionLoading}
      />
    )}
  </div>

  {showRejectModal && (
    <RejectModal
      showRejectModal={showRejectModal}
      rejectionReason={rejectionReason}
      setRejectionReason={setRejectionReason}
      setShowRejectModal={setShowRejectModal}
      handleReject={handleReject}
      actionLoading={actionLoading}
    />
  )}
</div>
     
 </>
  );
};

export default CashbackManagement;

// import React, { useState, useEffect } from "react";
// import api from "../../../utils/api";
// import { useSelector } from "react-redux";
// import {
//   FiDollarSign,
//   FiCheck,
//   FiX,
//   FiCreditCard,
//   FiUser,
//   FiCalendar,
//   FiSearch,
//   FiFilter,
//   FiRefreshCw,
//   FiUsers,
//   FiGift,
// } from "react-icons/fi";
// import CashbacksTable from "./CashbacksTable";
// import ReferralsTable from "./ReferralsTable";
// import RejectModal from "./RejectModal";
// import { COUPON_ROUTES } from "../../../utils/apiRoute";

// const CashbackManagement = () => {
//   const [cashbacks, setCashbacks] = useState([]);
//   const [referrals, setReferrals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [actionLoading, setActionLoading] = useState(null);
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [showRejectModal, setShowRejectModal] = useState(null);
//   const [activeTab, setActiveTab] = useState("cashbacks");

//   const token = useSelector((state) => state.auth.token);

//   useEffect(() => {
//     if (activeTab === "cashbacks") {
//       fetchCashbacks();
//     } else {
//       fetchReferrals();
//     }
//   }, [filter, activeTab]);

//   const fetchCashbacks = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get(COUPON_ROUTES.cashbacks, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data.success) {
//         setCashbacks(response.data.cashbacks);
//       }
//     } catch (error) {
//       console.error("Error fetching cashbacks:", error);
//       alert("Failed to fetch cashbacks");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchReferrals = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/coupons/admin", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data.success) {
//         setReferrals(response.data.referrals);
//       }
//     } catch (error) {
//       console.error("Error fetching referrals:", error);
//       alert("Failed to fetch referrals");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApprove = async (cashbackId) => {
//     try {
//       setActionLoading(cashbackId);
//       const response = await api.put(
//         `/coupons/cashbacks/${cashbackId}/approve`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         alert("Cashback approved successfully!");
//         fetchCashbacks();
//       }
//     } catch (error) {
//       console.error("Error approving cashback:", error);
//       alert(error.response?.data?.message || "Failed to approve cashback");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleCreditToWallet = async (cashbackId) => {
//     try {
//       setActionLoading(cashbackId);
//       const response = await api.put(
//         `/coupons/cashbacks/${cashbackId}/credit`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         alert(
//           `Cashback credited successfully! New wallet balance: ₹${response.data.newWalletBalance}`
//         );
//         fetchCashbacks();
//       }
//     } catch (error) {
//       console.error("Error crediting cashback:", error);
//       alert(error.response?.data?.message || "Failed to credit cashback");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleReject = async (cashbackId) => {
//     if (!rejectionReason.trim()) {
//       alert("Please provide a rejection reason");
//       return;
//     }

//     try {
//       setActionLoading(cashbackId);
//       const response = await api.put(
//         `/coupons/cashbacks/${cashbackId}/reject`,
//         { rejectionReason },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         alert("Cashback rejected successfully!");
//         setShowRejectModal(null);
//         setRejectionReason("");
//         fetchCashbacks();
//       }
//     } catch (error) {
//       console.error("Error rejecting cashback:", error);
//       alert(error.response?.data?.message || "Failed to reject cashback");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleApproveReferral = async (referralId, orderIndex) => {
//     try {
//       setActionLoading(`referral-${referralId}-${orderIndex}`);
//       const response = await api.put(
//         `/coupons/${referralId}/orders/${orderIndex}/approve`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         alert("Referral reward approved successfully!");
//         fetchReferrals();
//       }
//     } catch (error) {
//       console.error("Error approving referral:", error);
//       alert(error.response?.data?.message || "Failed to approve referral");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleCreditReferral = async (referralId, orderIndex) => {
//     try {
//       setActionLoading(`referral-credit-${referralId}-${orderIndex}`);
//       const response = await api.put(
//         `/coupons/${referralId}/orders/${orderIndex}/credit`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         alert("Referral reward credited successfully!");
//         fetchReferrals();
//       }
//     } catch (error) {
//       console.error("Error crediting referral:", error);
//       alert(error.response?.data?.message || "Failed to credit referral");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleRejectReferral = async (referralId, orderIndex, reason) => {
//     if (!reason.trim()) {
//       alert("Please provide a rejection reason");
//       return;
//     }

//     try {
//       setActionLoading(`referral-reject-${referralId}-${orderIndex}`);
//       const response = await api.put(
//         `/coupons/${referralId}/orders/${orderIndex}/reject`,
//         { rejectionReason: reason },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         alert("Referral reward rejected successfully!");
//         fetchReferrals();
//       }
//     } catch (error) {
//       console.error("Error rejecting referral:", error);
//       alert(error.response?.data?.message || "Failed to reject referral");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "approved":
//         return "bg-blue-100 text-blue-800";
//       case "credited":
//         return "bg-green-100 text-green-800";
//       case "rejected":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getReferralStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "approved":
//         return "bg-blue-100 text-blue-800";
//       case "paid":
//         return "bg-green-100 text-green-800";
//       case "rejected":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const filteredCashbacks = cashbacks.filter((cashback) => {
//     const matchesFilter = filter === "all" || cashback.status === filter;
//     const matchesSearch =
//       cashback.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       cashback.userId?.email
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       cashback.orderId?.orderNumber
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       cashback.couponCode?.toLowerCase().includes(searchTerm.toLowerCase());

//     return matchesFilter && matchesSearch;
//   });

//   const filteredReferrals = referrals.filter((referral) => {
//     const matchesSearch =
//       referral.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       referral.userId?.email
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       referral.referralCode?.toLowerCase().includes(searchTerm.toLowerCase());

//     return matchesSearch;
//   });

//   const stats = {
//     total: cashbacks.length,
//     pending: cashbacks.filter((c) => c.status === "pending").length,
//     approved: cashbacks.filter((c) => c.status === "approved").length,
//     credited: cashbacks.filter((c) => c.status === "credited").length,
//     rejected: cashbacks.filter((c) => c.status === "rejected").length,
//   };

//   const referralStats = {
//     totalUsers: referrals.length,
//     totalEarnings: referrals.reduce((sum, ref) => sum + ref.totalEarnings, 0),
//     pendingEarnings: referrals.reduce(
//       (sum, ref) => sum + ref.pendingEarnings,
//       0
//     ),
//     totalOrders: referrals.reduce(
//       (sum, ref) => sum + ref.totalReferralOrders,
//       0
//     ),
//     pendingOrders: referrals.reduce(
//       (sum, ref) =>
//         sum +
//         ref.referredOrders.filter((order) => order.rewardStatus === "pending")
//           .length,
//       0
//     ),
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <FiRefreshCw className="animate-spin text-indigo-600 text-4xl mx-auto mb-4" />
//           <h2 className="text-xl font-bold text-gray-700">
//             Loading {activeTab === "cashbacks" ? "cashbacks" : "referrals"}...
//           </h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             {activeTab === "cashbacks"
//               ? "Cashback Management"
//               : "Referral Management"}
//           </h1>
//           <p className="text-gray-600">
//             {activeTab === "cashbacks"
//               ? "Manage and process customer cashback requests"
//               : "Manage referral rewards and track referral performance"}
//           </p>
//         </div>
//         <div className="flex border-b mb-6">
//           <button
//             className={`flex items-center px-4 py-2 font-medium ${
//               activeTab === "cashbacks"
//                 ? "border-b-2 border-indigo-600 text-indigo-600"
//                 : "text-gray-600"
//             }`}
//             onClick={() => setActiveTab("cashbacks")}
//           >
//             <FiDollarSign className="mr-2" />
//             Cashbacks
//           </button>
//           <button
//             className={`flex items-center px-4 py-2 font-medium ${
//               activeTab === "referrals"
//                 ? "border-b-2 border-indigo-600 text-indigo-600"
//                 : "text-gray-600"
//             }`}
//             onClick={() => setActiveTab("referrals")}
//           >
//             <FiUsers className="mr-2" />
//             Referrals
//           </button>
//         </div>
//         {activeTab === "cashbacks" ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//             <div className="bg-white rounded-lg shadow-sm border p-4">
//               <div className="flex items-center">
//                 <div className="p-2 bg-gray-100 rounded-lg">
//                   <FiDollarSign className="text-gray-600 text-xl" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-600">Total</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {stats.total}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm border p-4">
//               <div className="flex items-center">
//                 <div className="p-2 bg-yellow-100 rounded-lg">
//                   <FiRefreshCw className="text-yellow-600 text-xl" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-600">Pending</p>
//                   <p className="text-2xl font-bold text-yellow-600">
//                     {stats.pending}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm border p-4">
//               <div className="flex items-center">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <FiCheck className="text-blue-600 text-xl" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-600">Approved</p>
//                   <p className="text-2xl font-bold text-blue-600">
//                     {stats.approved}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm border p-4">
//               <div className="flex items-center">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <FiCreditCard className="text-green-600 text-xl" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-600">Credited</p>
//                   <p className="text-2xl font-bold text-green-600">
//                     {stats.credited}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm border p-4">
//               <div className="flex items-center">
//                 <div className="p-2 bg-red-100 rounded-lg">
//                   <FiX className="text-red-600 text-xl" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-600">Rejected</p>
//                   <p className="text-2xl font-bold text-red-600">
//                     {stats.rejected}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//             <div className="bg-white rounded-lg shadow-sm border p-4">
//               <div className="flex items-center">
//                 <div className="p-2 bg-gray-100 rounded-lg">
//                   <FiUsers className="text-gray-600 text-xl" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-600">Referrers</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {referralStats.totalUsers}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm border p-4">
//               <div className="flex items-center">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <FiDollarSign className="text-green-600 text-xl" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-600">
//                     Total Earnings
//                   </p>
//                   <p className="text-2xl font-bold text-green-600">
//                     ₹{referralStats.totalEarnings}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm border p-4">
//               <div className="flex items-center">
//                 <div className="p-2 bg-yellow-100 rounded-lg">
//                   <FiRefreshCw className="text-yellow-600 text-xl" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-600">
//                     Pending Earnings
//                   </p>
//                   <p className="text-2xl font-bold text-yellow-600">
//                     ₹{referralStats.pendingEarnings}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm border p-4">
//               <div className="flex items-center">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <FiGift className="text-blue-600 text-xl" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-600">
//                     Total Orders
//                   </p>
//                   <p className="text-2xl font-bold text-blue-600">
//                     {referralStats.totalOrders}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm border p-4">
//               <div className="flex items-center">
//                 <div className="p-2 bg-orange-100 rounded-lg">
//                   <FiCalendar className="text-orange-600 text-xl" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-600">
//                     Pending Orders
//                   </p>
//                   <p className="text-2xl font-bold text-orange-600">
//                     {referralStats.pendingOrders}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//         <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1">
//               <div className="relative">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder={
//                     activeTab === "cashbacks"
//                       ? "Search by user, order, or coupon..."
//                       : "Search by referrer or referral code..."
//                   }
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//             </div>

//             <div className="flex gap-2">
//               {activeTab === "cashbacks" && (
//                 <select
//                   value={filter}
//                   onChange={(e) => setFilter(e.target.value)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="pending">Pending</option>
//                   <option value="approved">Approved</option>
//                   <option value="credited">Credited</option>
//                   <option value="rejected">Rejected</option>
//                 </select>
//               )}

//               <button
//                 onClick={
//                   activeTab === "cashbacks" ? fetchCashbacks : fetchReferrals
//                 }
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
//               >
//                 <FiRefreshCw className="mr-2" />
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>
//         {activeTab === "cashbacks" ? (
//           <CashbacksTable
//             cashbacks={filteredCashbacks}
//             getStatusColor={getStatusColor}
//             handleApprove={handleApprove}
//             handleCreditToWallet={handleCreditToWallet}
//             setShowRejectModal={setShowRejectModal}
//             actionLoading={actionLoading}
//           />
//         ) : (
//           <ReferralsTable
//             referrals={filteredReferrals}
//             getReferralStatusColor={getReferralStatusColor}
//             handleApproveReferral={handleApproveReferral}
//             handleCreditReferral={handleCreditReferral}
//             handleRejectReferral={handleRejectReferral}
//             actionLoading={actionLoading}
//           />
//         )}
//       </div>
//       {showRejectModal && (
//         <RejectModal
//           showRejectModal={showRejectModal}
//           rejectionReason={rejectionReason}
//           setRejectionReason={setRejectionReason}
//           setShowRejectModal={setShowRejectModal}
//           handleReject={handleReject}
//           actionLoading={actionLoading}
//         />
//       )}
//     </div>
//   );
// };

// export default CashbackManagement;
