import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import LogoutPop from "../components/LogoutPop";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import { useVendorWebSocket } from "../utils/websocket";

const Layout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [tradeNotif, setTradeNotif] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for vendor notifications
  useVendorWebSocket(user?.vendor_profile?.id, (data) => {
    if (data.type === "trade_started") {
      setTradeNotif(data.trade);
      localStorage.setItem("vendorTradeNotif", JSON.stringify(data.trade));
    }
  });

  useEffect(() => {
    const savedNotif = localStorage.getItem("vendorTradeNotif");
    if (location.pathname !== "/trade") {
      setTradeNotif(null);
      localStorage.removeItem("vendorTradeNotif");
      return;
    }
    if (savedNotif) {
      setTradeNotif(JSON.parse(savedNotif));
    } else if (user?.is_vendor && user.vendor_profile?.id) {
      api
        .get(
          `/transactions/?vendor_id=${user.vendor_profile.id}&status=pending`
        )
        .then((res) => {
          if (res.data && res.data.length > 0) {
            const latestTrade = res.data[res.data.length - 1];
            setTradeNotif(latestTrade);
            localStorage.setItem(
              "vendorTradeNotif",
              JSON.stringify(latestTrade)
            );
          }
        });
    }
  }, [user]);

  const handleTrade = () => {
    if (tradeNotif) {
      navigate(`/trade/${tradeNotif.id}`);
      setTradeNotif(null);
      localStorage.removeItem("vendorTradeNotif");
    }
  };

  const handleCancelTrade = async () => {
    if (tradeNotif) {
      await api.patch(`/transactions/${tradeNotif.id}/`, {
        status: "cancelled",
      });
      setTradeNotif(null);
      localStorage.removeItem("vendorTradeNotif");
    }
  };

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
      {tradeNotif && (
        <div className="animate__animated animate__fadeInDown trade-notification">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: "#0d6efd" }}>
              New Trade Request
            </div>
            <div style={{ fontSize: 15, marginTop: 2 }}>
              <b>{tradeNotif.seller?.username || "A user"}</b> wants to trade{" "}
              <b>{tradeNotif.asset?.name || tradeNotif.asset}</b>.<br />
              Amount: $<b>{tradeNotif.amount}</b>
            </div>
            <div className="mt-2 d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={handleCancelTrade}
              >
                Cancel
              </button>
              <button className="btn btn-sm btn-success" onClick={handleTrade}>
                Trade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Layout;
