import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import validator from "validator";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const ts = searchParams.get("ts");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!uid || !token || !ts) {
      toast.error("Invalid reset link.");
      navigate("/signin");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, token, ts]);

  const validate = () => {
    const newErrors = {};
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/reset-password/", { uid, token, ts, password });
      toast.success("Password reset successful. You can now log in.");
      navigate("/signin");
    } catch (err) {
      toast.error("Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <h5 className="fw-bold mb-2" style={{ color: "#377dff" }}>
          Reset Password
        </h5>
        <div className="mb-3" style={{ color: "#222", fontSize: 16 }}>
          Enter your new password to reset your account
        </div>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="password"
            className="form-label"
            style={{ color: "#377dff", fontWeight: 500 }}
          >
            New Password
          </label>
          <div className="input-group mb-2">
            <span
              className="input-group-text bg-white border-end-0"
              style={{ borderColor: "#377dff" }}
            >
              <i className="bi bi-lock" style={{ color: "#377dff" }}></i>
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="form-control border-start-0"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="input-group-text bg-white border-start-0"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              style={{ cursor: "pointer", border: "none" }}
            >
              <i
                className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}
              ></i>
            </button>
          </div>
          {errors.password && (
            <div className="text-danger mb-2" style={{ fontSize: 14 }}>
              {errors.password}
            </div>
          )}
          <label
            htmlFor="confirmPassword"
            className="form-label"
            style={{ color: "#377dff", fontWeight: 500 }}
          >
            Confirm Password
          </label>
          <div className="input-group mb-4">
            <span
              className="input-group-text bg-white border-end-0"
              style={{ borderColor: "#377dff" }}
            >
              <i className="bi bi-lock" style={{ color: "#377dff" }}></i>
            </span>
            <input
              id="confirmPassword"
              type="password"
              className="form-control border-start-0"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {errors.confirmPassword && (
            <div className="text-danger mb-2" style={{ fontSize: 14 }}>
              {errors.confirmPassword}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" />
                Resetting...
              </span>
            ) : (
              "Reset"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
