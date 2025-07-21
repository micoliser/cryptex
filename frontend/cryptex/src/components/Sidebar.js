import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Switch from "react-switch";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";

const Sidebar = ({
  setShowLogout,
  className = "d-none d-md-flex flex-column bg-light p-4 rounded h-100",
}) => {
  const { user, login } = useAuth();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(
    user?.vendor_profile?.is_online || false
  );

  const isActive = (path) => location.pathname === path;

  const handleToggle = async () => {
    const prevIsOnline = isOnline;
    setIsOnline((prev) => !prev);
    try {
      const res = await api.patch(`/vendors/${user.vendor_profile.id}/`, {
        is_online: !prevIsOnline,
      });
      const updatedVendor = { ...res.data };
      delete updatedVendor.user;
      login({ ...user, vendor_profile: updatedVendor });
    } catch (e) {
      toast.error("Failed to update status, please refresh and try again");
      setIsOnline(prevIsOnline);
    }
  };

  return (
    <div className={className} style={{ minWidth: 220 }}>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link
            className={`nav-link rounded ${
              isActive("/") ? "active bg-primary text-white" : "text-dark"
            }`}
            to="/"
          >
            <i className="bi bi-house me-2"></i>Home
          </Link>
        </li>
        {user ? (
          <>
            <li className="nav-item mb-2">
              <Link
                className={`nav-link rounded ${
                  isActive("/profile")
                    ? "active bg-primary text-white"
                    : "text-dark"
                }`}
                to="/profile"
              >
                <i className="bi bi-person me-2"></i>Profile
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link
                className={`nav-link rounded ${
                  isActive("/transactions")
                    ? "active bg-primary text-white"
                    : "text-dark"
                }`}
                to="/transactions"
              >
                <i className="bi bi-graph-up-arrow me-2"></i>Transactions
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link
                className={`nav-link rounded ${
                  isActive("/trades/pending")
                    ? "active bg-primary text-white"
                    : "text-dark"
                }`}
                to="/trades/pending"
              >
                <i className="bi bi-hourglass-split me-2"></i>Pending
              </Link>
            </li>
            {/* Status toggle for vendors */}
            {user.is_vendor && (
              <li className="nav-item mb-2">
                <div className="d-flex align-items-center justify-content-between p-3 rounded">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-bag me-2" style={{ fontSize: 18 }} />
                    <span>Status</span>
                  </div>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="d-flex align-items-center"
                  >
                    <Switch
                      checked={isOnline}
                      onChange={handleToggle}
                      onColor="#0b7417ff"
                      offColor="#ccc"
                      height={15}
                      width={45}
                    />
                    <span className="ms-2">
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </li>
            )}
            <li className="nav-item">
              <button
                className="nav-link text-dark"
                onClick={() => setShowLogout(true)}
              >
                <i className="bi bi-box-arrow-left me-2"></i>Log out
              </button>
            </li>
          </>
        ) : (
          <li className="nav-item mt-4">
            <Link
              className={`nav-link rounded ${
                isActive("/signin")
                  ? "active bg-primary text-white"
                  : "text-dark"
              }`}
              to="/signin"
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>Log in
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
