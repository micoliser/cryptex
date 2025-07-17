import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import LogoutPop from "../components/LogoutPop";

const Layout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  return (
    <>
      <Header onMenuClick={() => setShowSidebar(true)} />
      <div
        className={`offcanvas offcanvas-start d-md-none ${
          showSidebar ? "show" : ""
        }`}
        tabIndex="-1"
        style={{ visibility: showSidebar ? "visible" : "hidden" }}
        onClick={() => setShowSidebar(false)}
      >
        <div className="offcanvas-header bg-light">
          <h5 className="text-primary fw-bold mb-0">Cryptex</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowSidebar(false)}
          ></button>
        </div>
        <div className="offcanvas-body p-0">
          <Sidebar
            setShowLogout={setShowLogout}
            className="flex-column bg-light p-4 h-100"
          />
        </div>
      </div>
      <div className="container-fluid min-vh-100 bg-light">
        <div className="row h-100">
          <div className="col-md-2 p-0 d-none d-md-block">
            <Sidebar setShowLogout={setShowLogout} />
          </div>
          <div className="col-md-10 p-4">
            <Outlet />
          </div>
        </div>
      </div>
      {showLogout && <LogoutPop setShowLogout={setShowLogout} />}
    </>
  );
};

export default Layout;
