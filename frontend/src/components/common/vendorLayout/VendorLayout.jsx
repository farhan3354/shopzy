import { Outlet } from "react-router-dom";
import Sidebar from "./VendorSideBar";
import Navbar from "./VendorHeader";
import { ToastContainer } from "react-toastify";

export default function VendorLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 selection:bg-blue-100 selection:text-blue-900">
      {/* Header - Fixed to top */}
      <Navbar />
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar - Sticky/Fixed via its own component styles */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pt-2 pb-12 sm:pb-8">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Outlet />
             </div>
          </div>
        </main>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
