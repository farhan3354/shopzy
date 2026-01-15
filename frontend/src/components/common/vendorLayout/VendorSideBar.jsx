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
  };

  return (
    <>
      {/* Mobile Menu Toggle - Only visible on small screens when sidebar is hidden */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-blue-600 shadow-2xl text-white hover:bg-blue-700 focus:outline-none transition-all duration-300 transform hover:scale-110 active:scale-95"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <RxCross2 className="h-7 w-7" />
          ) : (
            <CgMenu className="h-7 w-7" />
          )}
        </button>
      </div>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-100 shadow-xl lg:shadow-none text-gray-600 transition-all duration-300 ease-in-out z-50 overflow-hidden
        ${isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full"} 
        lg:translate-x-0 lg:w-72 lg:sticky lg:top-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header/Logo Section inside Sidebar for Mobile */}
          <div className="p-6 lg:hidden border-b border-gray-50 mb-4">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold italic shadow-lg shadow-blue-200">S</div>
                <span className="text-xl font-bold text-gray-900">Shopzy Admin</span>
             </div>
          </div>

          <div className="flex-1 px-4 py-6 overflow-y-auto no-scrollbar">
            <div className="mb-8 px-2">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px] mb-4">Main Navigation</h3>
              <nav className="space-y-1.5">
                {venorsidebarmenu.map((item, index) => {
                  const IconComp = iconsComponent[item.icon];
                  return (
                    <NavLink
                      key={index}
                      to={item.to}
                      end={item.to === "/vendor"}
                      className={({ isActive }) => 
                        `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group
                        ${isActive 
                          ? "bg-blue-50 text-blue-600 shadow-sm" 
                          : "hover:bg-gray-50 hover:text-gray-900 text-gray-500"}`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                            {IconComp && <IconComp size={20} />}
                          </div>
                          <span className={`text-sm font-semibold tracking-wide ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
                            {item.title}
                          </span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Secondary Section */}
            <div className="px-2 pt-4 border-t border-gray-50">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px] mb-4">Support & Tools</h3>
              <nav className="space-y-1.5">
                <Link to="/vendor/settings" className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group">
                  <MdSettings size={20} className="text-gray-400 group-hover:text-gray-600" />
                  <span className="text-sm font-semibold opacity-80 group-hover:opacity-100 uppercase tracking-wide">Settings</span>
                </Link>
                <Link to="/vendor/help" className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group">
                  <MdHelpOutline size={20} className="text-gray-400 group-hover:text-gray-600" />
                  <span className="text-sm font-semibold opacity-80 group-hover:opacity-100 uppercase tracking-wide">Help Center</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* User Profile Section at Bottom */}
          <div className="p-4 bg-gray-50/50 mt-auto border-t border-gray-100">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 group transition-all hover:border-blue-200">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                {user?.image ? (
                   <img src={user.image} alt="Profile" className="h-full w-full object-cover rounded-xl" />
                ) : (
                   <span className="text-sm font-bold">{user?.name?.charAt(0) || "V"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || "Vendor Name"}</p>
                <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-tighter">Verified Seller</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
          </div>
        </div>
      </aside>
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
