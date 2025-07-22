import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchPendingTrades } from "../utils/utils";
import { useAuth } from "../contexts/AuthContext";

const PendingTrade = () => {
  const { user } = useAuth();
  const [pendingTrade, setPendingTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPendingTrade = async () => {
      try {
        const pendingTrades = await fetchPendingTrades(user);
        if (pendingTrades.length > 0) {
          setPendingTrade(pendingTrades[0]);
        }
      } catch (error) {
        toast.error("Failed to load pending trades. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadPendingTrade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <span className="spinner-border text-primary" /> Loading pending
        trade...
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          {pendingTrade ? (
            <>
              <div className="mb-3">
                <div>
                  <b>Asset:</b> {pendingTrade.asset?.name || pendingTrade.asset}
                </div>
                <div>
                  <b>Amount:</b> {pendingTrade.amount}
                </div>
                <div>
                  <b>Status:</b>{" "}
                  <span className="badge bg-warning text-dark">
                    {pendingTrade.status}
                  </span>
                </div>
                <div>
                  <b>Vendor:</b>{" "}
                  {pendingTrade.vendor?.display_name || pendingTrade.vendor}
                </div>
                <div>
                  <b>Buyer:</b>{" "}
                  {pendingTrade.seller?.username || pendingTrade.seller}
                </div>
              </div>
              <button
                className="btn btn-primary w-100"
                onClick={() => navigate(`/trade/${pendingTrade.id}`)}
              >
                Go to Trade
              </button>
            </>
          ) : (
            <div className="alert alert-info text-center mb-0">
              You have no pending trades at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingTrade;
