import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../utils/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");
    const ts = searchParams.get("ts");
    if (!uid || !token || !ts) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }
    api
      .get(`/verify-email/?uid=${uid}&token=${token}&ts=${ts}`)
      .then((res) => {
        setStatus("success");
        setMessage("Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.error ||
            "Verification failed. The link may be invalid or expired."
        );
      });
  }, [searchParams]);

  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
      if (seconds <= 1) {
        navigate("/signin");
      }
      return () => clearInterval(timer);
    }
  }, [status, seconds, navigate]);

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="alert alert-info text-center" style={{ maxWidth: 400 }}>
        {status === "verifying" && (
          <>
            <h5>Verifying your email...</h5>
            <div className="spinner-border text-primary mt-2" />
          </>
        )}
        {status === "success" && (
          <>
            <h5>{message}</h5>
            <div>You will be redirected to signin in {seconds} seconds.</div>
          </>
        )}
        {status === "error" && (
          <>
            <h5 className="alert alert-danger">{message}</h5>
            <div>
              <button
                className="btn btn-primary mt-2"
                onClick={() => navigate("/signin")}
              >
                Go to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
