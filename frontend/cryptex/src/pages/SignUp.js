import { Navigate } from "react-router-dom";
import SignUpForm from "../components/SignUpForm";
import { useAuth } from "../contexts/AuthContext";

const SignUp = () => {
  const { user, login } = useAuth();

  return user ? (
    <Navigate replace to="/" />
  ) : (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="w-100" style={{ maxWidth: 400 }}>
        <h4 className="fw-bold mb-1">Get Started with Cryptex</h4>
        <div className="mb-3 text-muted" style={{ fontSize: 16 }}>
          Create your account in seconds
        </div>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;
