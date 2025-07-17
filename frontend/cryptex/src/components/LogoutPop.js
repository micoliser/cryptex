import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const LogoutPop = ({ setShowLogout }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/signin");
    setShowLogout(false);
  };

  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal">
        <div
          className="fw-bold text-center"
          style={{ fontSize: 18, marginTop: 12 }}
        >
          Log Out
        </div>
        <div
          className="text-center text-muted"
          style={{ fontSize: 14, marginBottom: 12 }}
        >
          You will be signed out of this device
        </div>
        <button
          className="btn w-100 py-2 text-danger"
          style={{
            fontWeight: 500,
          }}
          onClick={handleLogout}
        >
          Yes, Log Out
        </button>
        <button
          className="btn w-100 py-2"
          style={{
            color: "#007aff",
            fontWeight: 500,
          }}
          onClick={() => setShowLogout(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LogoutPop;
