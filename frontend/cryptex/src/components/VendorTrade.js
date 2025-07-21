import { useState } from "react";
import { api } from "../utils/api";

const VendorTrade = ({
  trade,
  tokensSent,
  txHash,
  paymentMade,
  paymentAmount,
  setPaymentAmount,
  handleCancel,
  handlePayment,
}) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePaymentClick = async () => {
    setError("");
    const amount = Number(paymentAmount);
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/transactions/${trade.id}/`, {
        value_paid_in_naira: amount,
      });
      handlePayment(amount);
    } catch (err) {
      error.response?.data?.value_paid_in_naira
        ? setError(err.response.data.value_paid_in_naira[0])
        : setError("Failed to update payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!tokensSent ? (
        <>
          <div
            className="d-flex align-items-center justify-content-center mb-3"
            style={{
              background: "#fffbe6",
              border: "1px solid #ffe58f",
              borderRadius: 8,
              padding: "14px 18px",
              color: "#b8860b",
              fontWeight: 500,
              fontSize: 16,
              gap: 10,
            }}
          >
            <span
              className="spinner-border spinner-border-sm me-2"
              style={{ color: "#f7b731" }}
              role="status"
              aria-hidden="true"
            />
            Awaiting seller to send tokens...
          </div>
          <div className="mb-3">
            <button className="btn btn-outline-danger" onClick={handleCancel}>
              Cancel Transaction
            </button>
          </div>
        </>
      ) : !paymentMade ? (
        <>
          <div className="alert alert-success mb-3">
            <div
              style={{
                fontWeight: 500,
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <i
                className="bi bi-check-circle-fill me-2"
                style={{ color: "#27ae60", fontSize: 22 }}
              />
              {trade.seller?.username || "Seller"} has sent the tokens. Confirm
              receipt and make payment.
            </div>
            <span
              className="text-muted"
              style={{ fontSize: 14, fontWeight: 700, wordBreak: "break-all" }}
            >
              Transaction Hash: {txHash}
            </span>
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Payment Amount (₦)</label>
            <input
              type="number"
              className={`form-control${error ? " is-invalid" : ""}`}
              placeholder="Enter payment amount"
              value={paymentAmount}
              onChange={(e) => {
                setPaymentAmount(e.target.value);
                setError("");
              }}
              min="0"
              step="any"
              disabled={loading}
            />
            {error && (
              <div className="invalid-feedback" style={{ display: "block" }}>
                {error}
              </div>
            )}
          </div>
          <div className="mb-3">
            <button
              className="btn btn-primary"
              disabled={!paymentAmount || loading}
              onClick={handlePaymentClick}
            >
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
              ) : null}
              I have made the payment
            </button>
          </div>
        </>
      ) : (
        <div className="alert alert-info mb-3">
          <span
            className="spinner-border spinner-border-sm me-2 text-primary"
            role="status"
            aria-hidden="true"
          />
          Waiting for confirmation from {trade.seller?.username || "seller"}...
        </div>
      )}
    </>
  );
};

export default VendorTrade;
