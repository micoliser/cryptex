import { Link } from "react-router-dom";

const NotFound = () => (
  <div
    className="d-flex flex-column justify-content-center align-items-center"
    style={{
      minHeight: "100vh",
      background: "#f8f9fa",
      textAlign: "center",
    }}
  >
    <div style={{ maxWidth: 400 }}>
      <img
        src="/logo192.png"
        alt="Cryptex Logo"
        style={{ width: 80, marginBottom: 24 }}
      />
      <h1
        style={{
          fontSize: "5rem",
          fontWeight: 700,
          color: "#377dff",
          marginBottom: 0,
        }}
      >
        404
      </h1>
      <h4 className="fw-bold mb-2" style={{ color: "#222" }}>
        Page Not Found
      </h4>
      <div className="mb-4 text-muted" style={{ fontSize: 16 }}>
        Sorry, the page you’re looking for doesn’t exist or has been moved.
      </div>
      <Link
        to="/"
        className="btn btn-primary w-100"
        style={{
          fontWeight: 500,
          fontSize: "16px",
          borderRadius: "12px",
        }}
      >
        Go Home
      </Link>
    </div>
  </div>
);

export default NotFound;
