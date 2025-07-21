import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import LogoutPop from "../components/LogoutPop";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePassword";
import AssetsModal from "../components/AssetsModal";
import { api } from "../utils/api";
import "../styles/profile.css";

const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [currency, setCurrency] = useState(
    localStorage.getItem("preferredCurrency") || "USD"
  );

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
    localStorage.setItem("preferredCurrency", e.target.value);
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAssetsModal, setShowAssetsModal] = useState(false);

  const handleProfileUpdated = async () => {
    try {
      const res = await api.get(`/users/${user.id}/`);
      const updatedUser = res.data;
      login({ ...user, ...updatedUser });
    } catch (err) {
      toast.error(
        "There was an error while trying to get your updated profile, you may need to log out and log back in."
      );
    }
  };

  return (
    <div className="bg-light min-vh-100 profile-root position-relative">
      <div className="d-flex align-items-center px-2 py-2 border-bottom profile-header">
        <button
          className="btn btn-link text-dark p-0 me-2"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <i className="bi bi-arrow-left" style={{ fontSize: 22 }} />
        </button>
        <h5 className="mb-0 mx-auto text-primary fw-bold">Profile</h5>
      </div>
      <div className="d-flex flex-column align-items-center mt-4">
        <div className="profile-avatar">
          <img
            src={user?.picture || "https://www.gravatar.com/avatar/?d=mp"}
            className="rounded-circle"
            alt="avatar"
          />
          <span
            className="profile-status-dot"
            style={{ background: "#2ecc40" }}
          />
        </div>
        <div className="fw-bold profile-username">{user?.username}</div>
        <div className="text-muted profile-email">{user?.email}</div>
        {user?.vendor_profile?.description && (
          <div className="profile-vendor-desc-card">
            <i className="bi bi-info-circle profile-vendor-desc-icon" />
            <div>
              <div className="profile-vendor-desc-title">
                Vendor Description
              </div>
              <div className="profile-vendor-desc-text">
                {user.vendor_profile.description}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="list-group list-group-flush">
          <button
            className="list-group-item d-flex align-items-center border-0 profile-list-btn"
            onClick={() => setShowEditModal(true)}
          >
            <i className="bi bi-person me-3" style={{ fontSize: 20 }} />
            <span className="flex-grow-1 text-start">Edit profile</span>
            <i className="bi bi-chevron-right" />
          </button>
          {showEditModal && (
            <EditProfileModal
              handleClose={() => setShowEditModal(false)}
              user={user}
              handleProfileUpdated={handleProfileUpdated}
            />
          )}
          <button
            className="list-group-item d-flex align-items-center border-0 profile-list-btn"
            onClick={() => setShowChangePassword(true)}
          >
            <i className="bi bi-lock me-3" style={{ fontSize: 20 }} />
            <span className="flex-grow-1 text-start">Change password</span>
            <i className="bi bi-chevron-right" />
          </button>
          {showChangePassword && (
            <ChangePasswordModal
              handleClose={() => setShowChangePassword(false)}
              user={user}
            />
          )}
          <div className="list-group-item d-flex align-items-center border-0 profile-list-btn">
            <i
              className="bi bi-currency-dollar me-3"
              style={{ fontSize: 20 }}
            />
            <span className="flex-grow-1 text-start bg-none">
              Preferred currency
            </span>
            <select
              className="form-select form-select-sm w-auto ms-auto"
              value={currency}
              onChange={handleCurrencyChange}
              style={{ minWidth: 70 }}
            >
              <option value="USD">USD</option>
              <option value="NGN">NGN</option>
            </select>
          </div>
        </div>
      </div>
      {user?.vendor_profile && (
        <div className="mt-3 w-100" style={{ maxWidth: 350 }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold text-primary" style={{ fontSize: 16 }}>
              Supported Assets
            </span>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowAssetsModal(true)}
            >
              Manage Assets
            </button>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {user.vendor_profile.supported_assets.length === 0 && (
              <span className="text-muted">No assets added yet.</span>
            )}
            {user.vendor_profile.supported_assets.map((asset) => (
              <span
                key={asset.id}
                className="badge bg-primary text-light px-3 py-2"
              >
                {asset.symbol || asset.name}
              </span>
            ))}
          </div>
        </div>
      )}
      {showAssetsModal && (
        <AssetsModal
          showAssetsModal={showAssetsModal}
          setShowAssetsModal={setShowAssetsModal}
          handleProfileUpdated={handleProfileUpdated}
          supportedAssets={user.vendor_profile.supported_assets}
          user={user}
        />
      )}
      <div className="profile-logout">
        <button
          className="btn btn-link text-dark d-flex align-items-center p-0"
          onClick={() => setShowLogout(true)}
        >
          <i className="bi bi-box-arrow-right me-2" style={{ fontSize: 20 }} />
          <span className="fw-medium">Logout</span>
        </button>
      </div>
      {showLogout && <LogoutPop setShowLogout={setShowLogout} />}
    </div>
  );
};

export default Profile;
