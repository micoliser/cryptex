import { useState } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import validator from "validator";

const ChangePasswordModal = ({ handleClose, user }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required.";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (newPassword === currentPassword) {
      newErrors.newPassword =
        "New password must be different from current password.";
    } else if (
      !validator.isStrongPassword(newPassword, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      newErrors.newPassword =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Both passwords must match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await api.post(`/users/${user.id}/change_password/`, {
        old_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully!");
      handleClose();
    } catch (err) {
      if (err.response && err.response.data) {
        const apiErrors = err.response.data;
        setErrors(apiErrors);
        if (apiErrors.detail) toast.error(apiErrors.detail);
      } else {
        toast.error("Failed to change password, please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-modal-backdrop">
      <div className="edit-profile-modal-content bg-white rounded-3 shadow p-4">
        <h5 className="text-center mb-4 text-primary fw-bold">
          Change Password
        </h5>
        <div className="fw-semibold mb-3" style={{ fontSize: 18 }}>
          Create new password
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-medium">Current Password</label>
            <input
              type="password"
              className={`form-control${
                errors.currentPassword ? " is-invalid" : ""
              }`}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <div className="form-text">
              Password must be at least 8 characters
            </div>
            {errors.currentPassword && (
              <div className="invalid-feedback">{errors.currentPassword}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium">New Password</label>
            <input
              type="password"
              className={`form-control${
                errors.newPassword ? " is-invalid" : ""
              }`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <div className="form-text">Both passwords must match</div>
            {errors.newPassword && (
              <div className="invalid-feedback">{errors.newPassword}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium">Confirm New Password</label>
            <input
              type="password"
              className={`form-control${
                errors.confirmPassword ? " is-invalid" : ""
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback">{errors.confirmPassword}</div>
            )}
          </div>
          <div className="d-flex gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary flex-grow-1"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-grow-1"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
      <style>
        {`
        .edit-profile-modal-backdrop {
          position: fixed;
          z-index: 1050;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .edit-profile-modal-content {
          width: 100%;
          max-width: 370px;
          border: 1px solid #e5e7eb;
          animation: modalIn 0.2s;
        }
        @keyframes modalIn {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        `}
      </style>
    </div>
  );
};

export default ChangePasswordModal;
