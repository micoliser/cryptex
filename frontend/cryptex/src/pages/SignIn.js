import { useState } from "react";
import { Link } from "react-router";
import { Navigate, useLocation } from "react-router-dom";
import validator from "validator";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import { googleLogin } from "../utils/utils";

const SignIn = () => {
  const { login, user } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const location = useLocation();
  const verifyMsg = location.state?.verifyMsg;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (validator.isEmpty(form.username || "")) {
      newErrors.username = "Email or username is required";
    }
    if (validator.isEmpty(form.password || "")) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/token/", {
        username: form.username,
        password: form.password,
      });
      const { access, refresh, user: userData } = res.data;
      login({ ...userData, access, refresh });
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    } catch (err) {
      console.error("Login failed:", err);
      setApiError(
        err.response?.data?.detail ||
          (err.response?.data?.error &&
            `${err.response.data.error} Please check your email for verification link`) ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse, login);
      toast.success("Success");
    } catch (err) {
      toast.error(
        "An error occured while trying to sign you in, please try again"
      );
    }
  };

  return user ? (
    <Navigate replace to="/" />
  ) : (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
      <div className="w-100" style={{ maxWidth: 400 }}>
        <h4 className="fw-bold mb-1">Welcome</h4>
        <div className="mb-4 text-muted" style={{ fontSize: 16 }}>
          Log In to your Cryptex account
        </div>
        {verifyMsg && <div className="alert alert-success">{verifyMsg}</div>}
        <form onSubmit={handleSubmit} noValidate>
          {/* username */}
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className={`form-control border-start-0 ${
                  errors.username ? "is-invalid" : ""
                }`}
                placeholder="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
            </div>
            {errors.username && (
              <div className="invalid-feedback d-block">{errors.username}</div>
            )}
          </div>
          {/* Password */}
          <div className="mb-2">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control border-start-0 ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
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
              <div className="invalid-feedback d-block">{errors.password}</div>
            )}
          </div>
          <div className="mb-3 text-end">
            <Link to="/forgot-password" className="text-primary small">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" />
                Logging In...
              </span>
            ) : (
              "Log In"
            )}
          </button>
          {apiError && (
            <div className="alert alert-danger">
              {apiError}
              {apiError.includes("verification") && (
                <button
                  className="btn btn-link p-0 ms-2"
                  type="button"
                  onClick={async () => {
                    try {
                      await api.post("/resend-verification-email/", {
                        username: form.username,
                      });
                      toast.success(
                        "Verification email resent. Please check your inbox."
                      );
                    } catch (err) {
                      toast.error("Failed to resend verification email.");
                    }
                  }}
                >
                  Resend Email
                </button>
              )}
            </div>
          )}
          <div className="d-flex align-items-center mb-3">
            <hr className="flex-grow-1" />
            <span className="mx-2 text-muted">OR</span>
            <hr className="flex-grow-1" />
          </div>
          <GoogleLogin
            className="btn btn-outline-secondary w-100 mb-2"
            buttonText="Sign up with Google"
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("An error occured. Please try again")}
          />
        </form>
        <div className="text-center mt-3">
          <span className="text-muted">Don't have an account? </span>
          <Link to="/signup" className="text-primary">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
