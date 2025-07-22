import { useState } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/forgot-password/", { email });
      toast.success("Password reset email sent. Check your inbox.");
    } catch (err) {
      toast.error("User not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
      <div className="w-100" style={{ maxWidth: 400 }}>
        <h4 className="fw-bold mb-1" style={{ color: "#377dff" }}>
          Forgot Password
        </h4>
        <div className="mb-4 text-muted" style={{ fontSize: 16 }}>
          Enter your email address so we can send you the verification code
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label
              htmlFor="email"
              className="form-label"
              style={{ color: "#377dff", fontWeight: 500 }}
            >
              Email Address
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-envelope" style={{ color: "#377dff" }}></i>
              </span>
              <input
                id="email"
                type="email"
                className="form-control border-start-0"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" />
                Sending...
              </span>
            ) : (
              "Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
