import React from "react";
import Bannerlogin from "../components/Login/BannerLogin";
import LoginForm from "../components/Login/LoginForm";

export default function Login() {
  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen">
        <Bannerlogin />
        <LoginForm />
      </div>
    </>
  );
}
