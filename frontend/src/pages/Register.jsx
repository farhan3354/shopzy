import React from "react";
import { useLocation } from "react-router-dom";
import Bannerlogin from "../components/Login/BannerLogin";
import RegisterForm from "../components/Login/RegisterForm";

export default function Register1() {
  const location = useLocation();

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen">
        {location.pathname === "/register/customer" && (
          <>
            <Bannerlogin />
            <RegisterForm />
          </>
        )}
        {location.pathname === "/register/vendor" && (
          <>
            <RegisterForm />
            <Bannerlogin />
          </>
        )}
      </div>
    </>
  );
}
