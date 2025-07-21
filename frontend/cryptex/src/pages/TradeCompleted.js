import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";

const TradeCompleted = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrade = async () => {
      try {
        const res = await api.get(`/transactions/${id}/`);
        const tradeData = res.data;
        if (
          user.id !== tradeData.seller.id &&
          user.id !== tradeData.vendor.user.id
        ) {
          toast.error("You do not have permission to view this trade");
          navigate("/");
          return;
        }
        if (tradeData.status !== "completed") {
          navigate(`/trade/${id}`);
          return;
        }
        setIsSeller(tradeData.seller.id === user.id);
        setTrade(tradeData);
      } catch {
        setTrade(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTrade();
  }, [id]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <span className="spinner-border text-primary" /> Loading trade...
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="alert alert-danger mt-4">
        Trade not found or failed to load.
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <div className="text-center mb-4">
        <i
          className="bi bi-check-circle-fill"
          style={{ color: "#27ae60", fontSize: 64 }}
        />
        <h2 className="mt-3" style={{ fontWeight: 700 }}>
          Trade Completed
        </h2>
        <p className="text-muted">
          This transaction has been successfully completed.
        </p>
      </div>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Trade Details</h5>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <strong>Asset:</strong> {trade.asset?.name || trade.asset}
            </li>
            <li className="list-group-item">
              <strong>Amount:</strong> {trade.amount}
            </li>
            <li className="list-group-item">
              <strong>Seller:</strong> {trade.seller?.username || trade.seller}
            </li>
            <li className="list-group-item">
              <strong>Vendor:</strong>{" "}
              {trade.vendor?.display_name || trade.vendor}
            </li>
            <li className="list-group-item">
              <strong>{isSeller ? "Received" : "Paid"} (₦):</strong>{" "}
              {trade.value_paid_in_naira}
            </li>
            <li className="list-group-item">
              <strong>Transaction Hash:</strong>
              <div style={{ wordBreak: "break-all" }}>
                {trade.transaction_hash}
              </div>
            </li>
            <li className="list-group-item">
              <strong>Status:</strong>{" "}
              <span className="badge bg-success">{trade.status}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center">
        <Link to="/" className="btn btn-outline-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default TradeCompleted;
