import React, { useState } from "react";
import { 
  MdDashboard, 
  MdAddBox, 
  MdInventory, 
  MdListAlt,
  MdSettings,
  MdHelpOutline
} from "react-icons/md";
import { FaUserFriends, FaStore } from "react-icons/fa";
import { CgMenu } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
import { NavLink, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { venorsidebarmenu } from "./../../../data/data";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const iconsComponent = {
    MdDashboard: MdDashboard,
    FaStore: FaStore,
    FaUserFriends: FaUserFriends,
    MdInventory: MdInventory,
    MdAddBox: MdAddBox,
    MdListAlt: MdListAlt,
    MdSettings: MdSettings,
    MdHelpOutline: MdHelpOutline,
  };

  // Helper to fallback if icon not found
  const getIcon = (iconName) => {
    const Icon = iconsComponent[iconName] || MdListAlt;
    return <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />;
  };

  return (
    <>
      {/* Mobile Toggle Button (Visible only on mobile) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#4A90E2] shadow-2xl text-white hover:bg-[#357ABD] focus:outline-none transition-all active:scale-95"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <RxCross2 className="h-6 w-6" />
          ) : (
            <CgMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 shadow-xl lg:shadow-none text-gray-800 transition-all duration-300 ease-in-out z-[58]
        ${isMobileMenuOpen ? "translate-x-0 w-[280px]" : "-translate-x-full"} 
        lg:translate-x-0 lg:w-[280px] lg:relative lg:block`}
      >
        <div className="flex flex-col h-full bg-white">
          {/* Sidebar Header / Branding */}
          <div className="px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl italic">M</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
                  Marotix
                </h2>
                <p className="text-[10px] font-bold text-[#4A90E2] uppercase tracking-[0.2em] mt-1">
                  Vendor Panel
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-1 custom-scrollbar">
            <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 mt-2">
              Main Menu
            </p>
            
            <nav className="space-y-1.5">
              {venorsidebarmenu.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.to}
                  end={item.to === "/vendor"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    group flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-[#4A90E2]/10 text-[#4A90E2] font-bold shadow-sm shadow-[#4A90E2]/5" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-semibold"
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`
                        transition-colors duration-200
                        ${isActive ? "text-[#4A90E2]" : "text-gray-400 group-hover:text-gray-600"}
                      `}>
                        {getIcon(item.icon)}
                      </div>
                      <span className="text-sm tracking-tight">{item.title}</span>
                      
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4A90E2]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Secondary Section */}
            <div className="pt-8 px-4 mt-4 border-t border-gray-50">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Support & Tools
              </p>
              <nav className="space-y-1.5">
                <Link to="/vendor/settings" className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group font-semibold">
                  <MdSettings className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  <span className="text-sm tracking-tight">Settings</span>
                </Link>
                <Link to="/vendor/help" className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group font-semibold">
                  <MdHelpOutline className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  <span className="text-sm tracking-tight">Help Center</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="p-6 border-t border-gray-50">
            <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <FaStore className="text-gray-400 w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Partner Hub
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Custom styles for the sidebar scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </>
  );
}

// import React, { useState } from "react";
// import { MdDashboard, MdAddBox, MdInventory } from "react-icons/md";
// import { FaUserFriends, FaStore } from "react-icons/fa";
// import { CgMenu } from "react-icons/cg";
// import { RxCross2 } from "react-icons/rx";
// import { Link } from "react-router-dom";
// import { adminsidebarmenu } from "./../../../data/data";

// export default function AdminSidebar() {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const iconsComponent = {
//     MdDashboard: MdDashboard,
//     FaStore: FaStore,
//     FaUserFriends: FaUserFriends,
//     MdInventory: MdInventory,
//     MdAddBox: MdAddBox,
//   };

//   return (
//     <>
//       <div className="lg:hidden">
//         <button
//           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           className="inline-flex items-center justify-center p-2 rounded-md bg-white shadow-md text-gray-700 hover:text-purple-600 focus:outline-none"
//           aria-label="Toggle menu"
//         >
//           {isMobileMenuOpen ? (
//             <RxCross2 className="h-6 w-6" />
//           ) : (
//             <CgMenu className="h-6 w-6" />
//           )}
//         </button>
//       </div>

//       {/* Mobile Menu Overlay */}
//       {isMobileMenuOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
//           onClick={() => setIsMobileMenuOpen(false)}
//         ></div>
//       )}

//       {/* Sidebar - Mobile & Desktop */}
//       <div
//         className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg text-gray-800 transition-all duration-300 ease-in-out z-50
//           ${isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full"}
//           lg:translate-x-0 lg:w-64 lg:relative lg:shadow-none`}
//       >
//         <div className="p-6 h-full overflow-y-auto">
//           <nav className="flex flex-col space-y-4">
//             <div>
//               <h2 className="text-2xl font-semibold text-gray-900 mb-8 tracking-tight">
//                 Dashboard
//               </h2>

//               {adminsidebarmenu.map((item, index) => {
//                 const IconsComponent = iconsComponent[item.icon];
//                 return (
//                   <div key={index}>
//                     <Link
//                       to={item.to}
//                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
//                       onClick={() => setIsMobileMenuOpen(false)}
//                     >
//                       {IconsComponent ? <IconsComponent /> : null}
//                       {/* <IoHome className="text-gray-800 text-2xl" /> */}
//                       <span className="text-sm font-medium">{item.title}</span>
//                     </Link>
//                   </div>
//                 );
//               })}
//             </div>
//           </nav>
//         </div>
//       </div>
//     </>
//   );
// }
