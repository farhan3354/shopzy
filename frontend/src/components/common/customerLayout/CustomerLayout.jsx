import Navbar from "./NavBar";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import CustomerSidebar from "./CustomerSidebar";

export default function CustomerLayout() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1">
          <CustomerSidebar />
          <main className="flex-1 p-6 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        newestOnTop={false}
        closeOnClick={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
