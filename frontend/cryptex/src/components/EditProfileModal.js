import { useState } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import validator from "validator";

const EditProfileModal = ({ handleClose, user, handleProfileUpdated }) => {
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [displayName, setDisplayName] = useState(
    user?.vendor_profile?.display_name || ""
  );
  const [contactEmail, setContactEmail] = useState(
    user?.vendor_profile?.contact_email || ""
  );
  const [description, setDescription] = useState(
    user?.vendor_profile?.description || ""
  );
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
    } else if (!validator.isAlpha(firstName, "en-US", { ignore: " " })) {
      newErrors.firstName = "First name must contain only letters.";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    } else if (!validator.isAlpha(lastName, "en-US", { ignore: " " })) {
      newErrors.lastName = "Last name must contain only letters.";
    }
    if (user?.vendor_profile) {
      if (!displayName.trim()) {
        newErrors.displayName = "Display name is required.";
      }
      if (!contactEmail.trim()) {
        newErrors.contactEmail = "Contact email is required.";
      } else if (!validator.isEmail(contactEmail)) {
        newErrors.contactEmail = "Contact email is not valid.";
      }
      if (!description.trim()) {
        newErrors.description = "Description is required.";
      }
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
      await api.patch(`/users/${user.id}/`, {
        first_name: firstName,
        last_name: lastName,
      });
      if (user.is_vendor) {
        await api.patch(`/vendors/${user.vendor_profile.id}/`, {
          display_name: displayName,
          contact_email: contactEmail,
          description,
        });
      }
      if (handleProfileUpdated) handleProfileUpdated();
      handleClose();
      toast.success("Profile updated successfully!");
    } catch (err) {
      if (err.response && err.response.data) {
        const apiErrors = err.response.data;
        if (apiErrors.detail) toast.error(apiErrors.detail);
      } else {
        toast.error("Failed to update profile, please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-modal-backdrop">
      <div className="edit-profile-modal-content bg-white rounded-3 shadow p-4">
        <h5 className="text-center mb-4 text-primary fw-bold">Edit Profile</h5>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-medium">First Name</label>
            <input
              type="text"
              className={`form-control${errors.firstName ? " is-invalid" : ""}`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            {errors.firstName && (
              <div className="invalid-feedback">{errors.firstName}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium">Last Name</label>
            <input
              type="text"
              className={`form-control${errors.lastName ? " is-invalid" : ""}`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            {errors.lastName && (
              <div className="invalid-feedback">{errors.lastName}</div>
            )}
          </div>
          {user?.vendor_profile && (
            <>
              <div className="mb-3">
                <label className="form-label fw-medium">Display Name</label>
                <input
                  type="text"
                  className={`form-control${
                    errors.displayName ? " is-invalid" : ""
                  }`}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
                {errors.displayName && (
                  <div className="invalid-feedback">{errors.displayName}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label fw-medium">Contact Email</label>
                <input
                  type="email"
                  className={`form-control${
                    errors.contactEmail ? " is-invalid" : ""
                  }`}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
                {errors.contactEmail && (
                  <div className="invalid-feedback">{errors.contactEmail}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label fw-medium">Description</label>
                <textarea
                  className={`form-control${
                    errors.description ? " is-invalid" : ""
                  }`}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>
            </>
          )}
          {errors.form && (
            <div className="alert alert-danger py-1">{errors.form}</div>
          )}
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
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
