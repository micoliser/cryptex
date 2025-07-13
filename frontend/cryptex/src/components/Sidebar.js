import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({
  className = "d-none d-md-flex flex-column bg-light p-4 rounded h-100",
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

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
            <li className="nav-item mt-4">
              <Link className="nav-link text-dark" to="#">
                <i className="bi bi-box-arrow-left me-2"></i>Log out
              </Link>
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
