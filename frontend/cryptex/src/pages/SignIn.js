import { useState } from "react";
import { Link } from "react-router";
import { Navigate } from "react-router-dom";
import validator from "validator";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";

const SignIn = () => {
  const { login, user } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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
      setApiError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
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
                placeholder="Email Address or Username"
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
            <a href="#" className="text-primary small">
              Forgot Password?
            </a>
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
          {apiError && <div className="alert alert-danger">{apiError}</div>}
          <div className="d-flex align-items-center mb-3">
            <hr className="flex-grow-1" />
            <span className="mx-2 text-muted">OR</span>
            <hr className="flex-grow-1" />
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary w-100 mb-4"
          >
            <i className="bi bi-google me-2" style={{ color: "#ea4335" }}></i>
            Sign In with Google
          </button>
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
