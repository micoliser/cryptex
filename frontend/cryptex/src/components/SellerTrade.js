import { useState } from "react";
import { api } from "../utils/api";
import { isHexString } from "ethers";
import bs58 from "bs58";

const SellerTrade = ({
  trade,
  txHash,
  setTxHash,
  tokensSent,
  paymentMade,
  paymentAmount,
  handleCancel,
  handleSentTokens,
  handleConfirmedReceived,
}) => {
  const [sending, setSending] = useState(false);
  const [inputError, setInputError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  function isEvmHash(hash) {
    return isHexString(hash, 32);
  }

  function isSolanaHash(hash) {
    if (typeof hash !== "string") return false;
    if (hash.length < 43 || hash.length > 88) return false;
    try {
      bs58.decode(hash);
      return true;
    } catch {
      return false;
    }
  }

  function isTronHash(hash) {
    return (
      typeof hash === "string" &&
      hash.length === 64 &&
      /^[0-9a-fA-F]+$/.test(hash)
    );
  }

  function isTonHash(hash) {
    if (typeof hash !== "string") return false;
    if (!/^[A-Za-z0-9_\-+/]{43,44}=?$/.test(hash)) return false;
    try {
      // Convert base64url to base64 if needed
      let base64 = hash.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4 !== 0) {
        base64 += "=";
      }
      atob(base64);
      return true;
    } catch {
      return false;
    }
  }

  // BTC (hex, 64 chars)
  function isBtcHash(hash) {
    return (
      typeof hash === "string" &&
      hash.length === 64 &&
      /^[0-9a-fA-F]+$/.test(hash)
    );
  }

  function isValidHash(hash) {
    return (
      isEvmHash(hash) ||
      isSolanaHash(hash) ||
      isTronHash(hash) ||
      isTonHash(hash) ||
      isBtcHash(hash)
    );
  }

  const handleSendTokens = async () => {
    if (!isValidHash(txHash)) {
      setInputError("Invalid transaction hash");
      return;
    }
    setInputError("");
    setSending(true);
    try {
      await api.patch(`/transactions/${trade.id}/`, {
        transaction_hash: txHash,
      });
      handleSentTokens(txHash);
    } catch (e) {
      e.response?.data?.transaction_hash
        ? setInputError(e.response.data.transaction_hash[0])
        : setInputError("Failed to update transaction hash, please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleConfirmReceived = async () => {
    setConfirmError("");
    setConfirming(true);
    try {
      await api.patch(`/transactions/${trade.id}/`, {
        status: "completed",
      });
      handleConfirmedReceived();
    } catch (e) {
      e.response?.data?.status
        ? setConfirmError(e.response.data.status[0])
        : setConfirmError("Failed to mark as completed, please try again.");
    } finally {
      setConfirming(false);
    }
  };

  return !tokensSent ? (
    <>
      <div className="mb-3">
        <label className="form-label fw-medium">Transaction Hash</label>
        <input
          type="text"
          className={`form-control${inputError ? " is-invalid" : ""}`}
          placeholder="Paste transaction hash here"
          value={txHash}
          onChange={(e) => {
            setTxHash(e.target.value);
            if (inputError) setInputError("");
          }}
        />
        {inputError && <div className="invalid-feedback">{inputError}</div>}
      </div>
      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-danger flex-grow-1"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary flex-grow-1"
          disabled={!txHash || sending}
          onClick={handleSendTokens}
        >
          {sending ? "Sending..." : "I have sent the tokens"}
        </button>
      </div>
    </>
  ) : !paymentMade ? (
    <div className="alert alert-info mb-3">
      <span
        className="spinner-border spinner-border-sm me-2 text-primary"
        role="status"
        aria-hidden="true"
      />
      Tokens sent, awaiting payment from vendor.
    </div>
  ) : (
    <>
      <div
        className="alert alert-success mb-3"
        style={{
          fontWeight: 500,
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <i
          className="bi bi-cash-stack me-2"
          style={{ color: "#27ae60", fontSize: 22 }}
        />
        {trade.vendor?.display_name || "Vendor"} has completed the transfer of ₦
        {paymentAmount}. Check your account and confirm when you receive the
        payment.
      </div>
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={handleConfirmReceived}
          disabled={confirming}
        >
          {confirming ? "Confirming..." : "I have received the payment"}
        </button>
        {confirmError && <div className="text-danger mt-2">{confirmError}</div>}
      </div>
    </>
  );
};

export default SellerTrade;
