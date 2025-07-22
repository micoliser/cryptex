import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import TradeChat from "../components/TradeChat";
import { coingeckoIdMap } from "../utils/utils";

const TransactionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [assetPhoto, setAssetPhoto] = useState("/logo192.png");

  useEffect(() => {
    api.get(`/transactions/${id}/`).then((res) => {
      setTransaction(res.data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!transaction) return;
    const symbol =
      transaction.asset?.symbol ||
      (typeof transaction.asset === "string" ? transaction.asset : "");
    const cgId = coingeckoIdMap[symbol?.toUpperCase()];
    if (!cgId) {
      setAssetPhoto("/logo192.png");
      return;
    }
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cgId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data[0]?.image) {
          setAssetPhoto(data[0].image);
        } else {
          setAssetPhoto("/logo192.png");
        }
      })
      .catch(() => setAssetPhoto("/logo192.png"));
  }, [transaction]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <span className="spinner-border text-primary" /> Loading transaction...
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="alert alert-danger mt-4">
        Transaction not found or failed to load.
      </div>
    );
  }

  const asset = transaction.asset?.name || transaction.asset;
  const symbol =
    transaction.asset?.symbol ||
    (typeof transaction.asset === "string" ? transaction.asset : "");
  const statusColor =
    transaction.status === "completed"
      ? "#27ae60"
      : transaction.status === "pending"
      ? "#f7b731"
      : "#eb3b5a";
  const statusText =
    transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1);

  return (
    <div className="container py-4" style={{ maxWidth: 500 }}>
      <div
        className="d-flex align-items-center justify-content-between mb-4"
        style={{ gap: 12 }}
      >
        <h4 className="text-primary fw-bold mb-0 flex-grow-1 text-center">
          Details for transaction {transaction.id}
        </h4>
        <div style={{ width: 40 }} /> {/* Spacer for symmetry */}
      </div>
      <div
        className="card border-0 shadow"
        style={{
          borderRadius: 20,
          background: "#f8f9fa",
        }}
      >
        <div className="card-body px-4 py-4">
          <div className="d-flex align-items-center mb-4">
            <img
              src={assetPhoto}
              alt={symbol}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: "#e9ecef",
                marginRight: 16,
              }}
            />
            <div>
              <div className="fw-bold" style={{ fontSize: 22 }}>
                {asset}{" "}
                <span
                  className="text-secondary"
                  style={{ fontSize: 16 }}
                >{`${symbol?.toUpperCase()}`}</span>
              </div>
              <div
                className="badge"
                style={{
                  background: statusColor,
                  color: "#fff",
                  fontSize: 14,
                }}
              >
                {statusText}
              </div>
            </div>
          </div>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary">Quantity</span>
              <span className="fw-bold" style={{ fontSize: 18 }}>
                {Number(transaction.quantity).toFixed(6)}{" "}
                {symbol?.toUpperCase()}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary">Amount</span>
              <span className="fw-bold" style={{ fontSize: 18 }}>
                ${Number(transaction.amount).toFixed(2)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary">Vendor</span>
              <span className="fw-semibold">
                {transaction.vendor?.display_name || transaction.vendor}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary">Buyer</span>
              <span className="fw-semibold">
                {transaction.seller?.username || transaction.seller}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary">Created At</span>
              <span>{new Date(transaction.created_at).toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary">Transaction Hash</span>
              <span className="text-break" style={{ fontSize: 13 }}>
                {transaction.transaction_hash || "N/A"}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary">Value Paid (Naira)</span>
              <span>N{transaction.value_paid_in_naira || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-primary px-4 py-2"
          style={{
            borderRadius: 16,
            fontWeight: 500,
            fontSize: 17,
          }}
          onClick={() => setShowChat(true)}
        >
          Show Chat
        </button>
      </div>
      {showChat && (
        <TradeChat
          open={showChat}
          onClose={() => setShowChat(false)}
          user={user}
          trade={transaction}
          isHistory={true}
        />
      )}
    </div>
  );
};

export default TransactionDetail;
