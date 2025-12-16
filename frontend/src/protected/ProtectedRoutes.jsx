import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";

const ProtectRoute = ({ allowedRoles }) => {
  const token = useSelector((state) => state.auth.token);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) {
      setStatus("denied");
      return;
    }

    const verifyUser = async () => {
      try {
        const res = await api.get("/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userRole = res.data.user.role;

        if (allowedRoles && !allowedRoles.includes(userRole)) {
          setStatus("denied");
        } else {
          setStatus("allowed");
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        setStatus("denied");
      }
    };

    verifyUser();
  }, [token, allowedRoles]);

  if (status === "loading") {
    return <div className="text-center">Checking access...</div>;
  }

  if (status === "denied") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectRoute;

// import React from "react";
// import { useSelector } from "react-redux";
// import { Navigate, Outlet } from "react-router-dom";

// const ProtectedRoute = ({ allowedRoles }) => {
//   const { user, token } = useSelector((state) => state.auth);

//   if (!token || !user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/login" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;
