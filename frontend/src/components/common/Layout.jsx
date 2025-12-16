import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNavigation from "./BottomNavigation";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer className="mb-20 lg:mb-0" /> 
      <BottomNavigation />
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
    </>
  );
}

// import { ToastContainer } from "react-toastify";
// import Footer from "./Footer";
// import Navbar from "./Navbar";
// import { Outlet } from "react-router-dom";
// import BottomNavigation from "./BottomNavigation";

// export default function Layout() {
//   return (
//     <>
//       <Navbar />
//       <main>
//         <Outlet />
//       </main>
//       <Footer />
//       <BottomNavigation />
//       <ToastContainer
//         position="bottom-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />

//     </>
//   );
// }
