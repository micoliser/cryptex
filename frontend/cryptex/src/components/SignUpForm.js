import { useState } from "react";
import { Link } from "react-router";
import validator from "validator";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";

const initialState = {
  fullName: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  agree: false,
};
const initialErrors = {
  fullName: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  agree: "",
};

const SignUpForm = () => {
  const { login } = useAuth();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState(initialErrors);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    // Full name: must be "First Last" (two words, each at least 2 letters)
    if (validator.isEmpty(form.fullName || "")) {
      newErrors.fullName = "Full name is required";
    } else if (!/^[A-Za-z]{2,}\s[A-Za-z]{2,}$/.test(form.fullName.trim())) {
      newErrors.fullName = "Enter your first and last name (e.g. John Doe)";
    }
    if (validator.isEmpty(form.email || "")) {
      newErrors.email = "Email is required";
    } else if (!validator.isEmail(form.email)) {
      newErrors.email = "Invalid email";
    }
    if (validator.isEmpty(form.username || "")) {
      newErrors.username = "Username is required";
    } else if (!validator.isAlphanumeric(form.username)) {
      newErrors.username = "Username can only contain letters and numbers";
    }
    if (validator.isEmpty(form.password || "")) {
      newErrors.password = "Password is required";
    }
    if (
      !validator.isEmpty(form.password || "") &&
      !validator.isStrongPassword(form.password, {
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
    if (validator.isEmpty(form.confirmPassword || "")) {
      newErrors.confirmPassword = "Confirm your password";
    }
    if (
      !validator.isEmpty(form.password || "") &&
      !validator.isEmpty(form.confirmPassword || "") &&
      !validator.equals(form.password, form.confirmPassword)
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!form.agree) newErrors.agree = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/register/", {
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.fullName.split(" ")[0],
        last_name: form.fullName.split(" ")[1],
      });
      const { user, access, refresh } = res.data;
      login({ ...user, access, refresh });
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    } catch (err) {
      setApiError(
        err.response?.data?.email?.[0] ||
          err.response?.data?.username?.[0] ||
          "Sign up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-4" onSubmit={handleSubmit} noValidate>
      {/* Full Name */}
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-person"></i>
          </span>
          <input
            type="text"
            className={`form-control border-start-0 ${
              errors.fullName ? "is-invalid" : ""
            }`}
            placeholder="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />
        </div>
        {errors.fullName && (
          <div className="invalid-feedback d-block">{errors.fullName}</div>
        )}
      </div>
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
      {/* Username */}
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-person-badge"></i>
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
      <div className="mb-3">
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
            <i className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}></i>
          </button>
        </div>
        {errors.password && (
          <div className="invalid-feedback d-block">{errors.password}</div>
        )}
      </div>
      {/* Confirm Password */}
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-lock"></i>
          </span>
          <input
            type={showPassword ? "text" : "password"}
            className={`form-control border-start-0 ${
              errors.confirmPassword ? "is-invalid" : ""
            }`}
            placeholder="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>
        {errors.confirmPassword && (
          <div className="invalid-feedback d-block">
            {errors.confirmPassword}
          </div>
        )}
      </div>
      {/* Terms */}
      <div className="form-check mb-3">
        <input
          className={`form-check-input ${errors.agree ? "is-invalid" : ""}`}
          type="checkbox"
          name="agree"
          id="agree"
          checked={form.agree}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="agree">
          I agree to the <a href="#">Terms of Service</a> and{" "}
          <a href="#">Privacy Policy</a>
        </label>
        {errors.agree && (
          <div className="invalid-feedback d-block">{errors.agree}</div>
        )}
      </div>
      <button
        type="submit"
        className="btn btn-primary w-100 mb-3"
        disabled={loading}
      >
        {loading ? (
          <span>
            <span className="spinner-border spinner-border-sm me-2" />
            Signing Up...
          </span>
        ) : (
          "Sign Up"
        )}
      </button>
      {apiError && <div className="alert alert-danger">{apiError}</div>}
      <div className="d-flex align-items-center mb-3">
        <hr className="flex-grow-1" />
        <span className="mx-2 text-muted">OR</span>
        <hr className="flex-grow-1" />
      </div>
      <button type="button" className="btn btn-outline-secondary w-100 mb-2">
        <i className="bi bi-google me-2" style={{ color: "#ea4335" }}></i>
        Sign Up with Google
      </button>
      <button type="button" className="btn btn-outline-secondary w-100 mb-2">
        <i className="bi bi-apple me-2" style={{ color: "#000" }}></i>
        Sign Up with Apple
      </button>
      <div className="text-center mt-3">
        <span className="text-muted">Already have an account? </span>
        <Link to="/signin" className="text-primary">
          Log In
        </Link>
      </div>
    </form>
  );
};

export default SignUpForm;
