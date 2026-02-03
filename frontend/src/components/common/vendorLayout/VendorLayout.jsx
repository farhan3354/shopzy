import { Outlet } from "react-router-dom";
import Sidebar from "./VendorSideBar";
import Navbar from "./VendorHeader";
import { ToastContainer } from "react-toastify";

export default function VendorLayout() {
  return (
    <div className="min-h-screen bg-gray-50/50 selection:bg-blue-100 selection:text-blue-900">
      <div className="hidden lg:flex">
        <div className="w-[280px] fixed left-0 top-0 h-screen z-50">
          <Sidebar />
        </div>
        
        <div className="flex-1 ml-[280px]">
          <div className="flex flex-col min-h-screen">
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
              <Navbar />
            </div>
            
            <main className="flex-1 overflow-y-auto pt-2 pb-12 sm:pb-8">
              <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      
      {/* <div className="lg:hidden flex flex-col min-h-screen">
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>
        <div className="relative z-40">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto pt-2 pb-12 sm:pb-8">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Outlet />
            </div>
          </div>
        </main>
      </div> */}
      <Navbar />
      
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar />
        
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

// import { Outlet } from "react-router-dom";
// import Sidebar from "./VendorSideBar";
// import Navbar from "./VendorHeader";
// import { ToastContainer } from "react-toastify";

// export default function VendorLayout() {
//   return (
    // <div className="flex flex-col min-h-screen bg-gray-50/50 selection:bg-blue-100 selection:text-blue-900">
    //   <Navbar />
      
    //   <div className="flex flex-1 relative overflow-hidden">
    //     <Sidebar />
        
    //     <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pt-2 pb-12 sm:pb-8">
    //       <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
    //          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
    //             <Outlet />
    //          </div>
    //       </div>
    //     </main>
    //   </div>

    //   <ToastContainer
    //     position="bottom-right"
    //     autoClose={3000}
    //     hideProgressBar={false}
    //     newestOnTop={false}
    //     closeOnClick
    //     rtl={false}
    //     pauseOnFocusLoss
    //     draggable
    //     pauseOnHover
    //     theme="light"
    //   />
    // </div>
//   );
// }
