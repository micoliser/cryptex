import { useAuth } from "../contexts/AuthContext";

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <div className="d-flex align-items-center justify-content-between bg-light rounded p-2">
      <div className="d-flex align-items-center">
        <button
          className="btn d-md-none ms-2"
          onClick={onMenuClick}
          aria-label="Open menu"
          style={{ fontSize: 24 }}
        >
          <i className="bi bi-list"></i>
        </button>
        <h3 className="text-primary fw-bold mb-0">Cryptex</h3>
      </div>
      {user && (
        <div className="d-flex align-items-center">
          <img
            src={user?.picture || "https://www.gravatar.com/avatar/?d=mp"}
            alt="avatar"
            className="rounded-circle me-3"
            width={40}
            height={40}
          />
          <div>
            <div className="small text-muted">Welcome back</div>
            <div className="fw-bold">Ifedimeji Omoniyi</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
