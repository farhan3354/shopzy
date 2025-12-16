import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiHelpCircle, FiShoppingBag } from "react-icons/fi";

const BottomNavigation = () => {
  const menuItems = [
    {
      id: "home",
      label: "Home",
      path: "/",
      icon: FiHome,
      activeColor: "#68002a",
      inactiveColor: "#333231",
    },
    {
      id: "help",
      label: "Help",
      path: "/contact-us",
      icon: FiHelpCircle,
      activeColor: "#68002a",
      inactiveColor: "#333231",
    },
    {
      id: "orders",
      label: "My Orders",
      path: "/orders",
      icon: FiShoppingBag,
      activeColor: "#68002a",
      inactiveColor: "#333231",
    },
  ];

  const isActive = (menuPath) => {
    return location.pathname === menuPath;
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div
          className="bg-white"
          style={{
            boxShadow: "rgba(0, 0, 0, 0.3) 0px -1px 5px",
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
          }}
        >
          <div className="flex justify-around items-center">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-3 px-4 flex-1 transition-all duration-200 ${
                    active
                      ? "kalira-bottom-menu active-menu"
                      : "kalira-bottom-menu"
                  }`}
                  onClick={
                    item.id === "orders"
                  }
                >
                  <span
                    className="w-6 h-6 mb-1"
                    style={{
                      color: active ? item.activeColor : item.inactiveColor,
                      backgroundColor: "inherit",
                      cursor: "inherit",
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </span>
                  <span
                    className={`text-xs font-medium transition-colors duration-200 ${
                      active ? "text-[#68002a]" : "text-[#333231]"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;

// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";

// const BottomNavigation = () => {
//   const location = useLocation();
//   const [activeMenu, setActiveMenu] = useState("home");

//   const menuItems = [
//     {
//       id: "home",
//       label: "Home",
//       path: "/",
//       icon: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           fill="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path d="M19 21H5a1 1 0 0 1-1-1v-9H1l10.327-9.388a1 1 0 0 1 1.346 0L23 11h-3v9a1 1 0 0 1-1 1M6 19h12V9.158l-6-5.455-6 5.455zm2-4h8v2H8z"></path>
//         </svg>
//       ),
//       activeColor: "#68002a",
//       inactiveColor: "#333231",
//     },
//     {
//       id: "help",
//       label: "Help",
//       path: "/contact-us",
//       icon: (
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//           <path d="M22 17.002a6 6 0 0 1-4.713 5.86l-.638-1.914A4 4 0 0 0 19.465 19H17a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.938a8.001 8.001 0 0 0-15.876 0H7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5C2 6.477 6.477 2 12 2s10 4.477 10 10v5zM20 17v-4h-3v4zM4 13v4h3v-4z"></path>
//         </svg>
//       ),
//       activeColor: "#68002a",
//       inactiveColor: "#333231",
//     },
//     {
//       id: "orders",
//       label: "My Orders",
//       path: "/orders",
//       icon: (
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//           <path d="M4 22a8 8 0 1 1 16 0h-2a6 6 0 0 0-12 0zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6m0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4"></path>
//         </svg>
//       ),
//       activeColor: "#68002a",
//       inactiveColor: "#333231",
//     },
//   ];

//   const isActive = (menuPath) => {
//     return location.pathname === menuPath;
//   };

//   return (
//     <>
//       <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
//         <div
//           className="bg-white"
//           style={{
//             boxShadow: "rgba(0, 0, 0, 0.3) 0px -1px 5px",
//             borderBottomLeftRadius: "8px",
//             borderBottomRightRadius: "8px",
//           }}
//         >
//           <div className="flex justify-around items-center">
//             {menuItems.map((item) => {
//               const active = isActive(item.path);

//               return (
//                 <Link
//                   key={item.id}
//                   to={item.path}
//                   className={`flex flex-col items-center justify-center py-3 px-4 flex-1 transition-all duration-200 ${
//                     active
//                       ? "kalira-bottom-menu active-menu"
//                       : "kalira-bottom-menu"
//                   }`}
//                   onClick={() => setActiveMenu(item.id)}
//                 >
//                   <span
//                     className="w-6 h-6 mb-1"
//                     style={{
//                       fill: active ? item.activeColor : item.inactiveColor,
//                       color: active ? item.activeColor : item.inactiveColor,
//                       backgroundColor: "inherit",
//                       cursor: "inherit",
//                     }}
//                   >
//                     {item.icon}
//                   </span>
//                   <span
//                     className={`text-xs font-medium transition-colors duration-200 ${
//                       active ? "text-[#68002a]" : "text-[#333231]"
//                     }`}
//                   >
//                     {item.label}
//                   </span>
//                 </Link>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default BottomNavigation;
