import { useState } from "react";
import { Link } from "react-router";
import { Navigate } from "react-router-dom";
import validator from "validator";
import { useAuth } from "../contexts/AuthContext";

const SignIn = () => {
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (validator.isEmpty(form.email || "")) {
      newErrors.email = "Email is required";
    } else if (!validator.isEmail(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (validator.isEmpty(form.password || "")) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
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
          {/* Email */}
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className={`form-control border-start-0 ${
                  errors.email ? "is-invalid" : ""
                }`}
                placeholder="Email Address"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && (
              <div className="invalid-feedback d-block">{errors.email}</div>
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
          <button type="submit" className="btn btn-primary w-100 mb-3">
            Log In
          </button>
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
