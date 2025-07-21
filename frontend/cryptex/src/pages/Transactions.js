import { useState } from "react";
import { isHexString } from "ethers";
import base64url from "base64url";
import bs58 from "bs58";
import toast from "react-hot-toast";

function Transactions() {
  const [txHash, setTxHash] = useState("");
  const [inputError, setInputError] = useState("");

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
    toast.success("Transaction hash is valid");
    setInputError("");
  };

  return (
    <div>
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
          className="btn btn-primary flex-grow-1"
          disabled={!txHash}
          onClick={handleSendTokens}
        >
          Validate Hash
        </button>
      </div>
    </div>
  );
}

export default Transactions;
