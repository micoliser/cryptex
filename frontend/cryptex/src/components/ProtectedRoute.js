// ProtectedRoute.js
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    toast.error("You must be logged in to access this page.");
    return <Navigate to="/signin" replace />;
  }
  return children;
};

export default ProtectedRoute;
