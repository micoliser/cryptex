import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { api } from "../utils/api";

const coingeckoIdMap = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  USDC: "usd-coin",
  USDT: "tether",
  XRP: "ripple",
};

const TradeModal = ({ show, onClose, asset = undefined }) => {
  const [assets, setAssets] = useState([]);
  const [selected, setSelected] = useState(asset || null);
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const [cgData, setCgData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastChanged, setLastChanged] = useState("quantity");

  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      api.get("/assets/").then((res) => {
        setAssets(res.data);
        if (!selected && res.data.length > 0) {
          setSelected(res.data[0]);
        }
      });
    }
  }, [show, selected]);

  useEffect(() => {
    if (!selected) return;
    const cgId = coingeckoIdMap[selected.symbol];
    if (!cgId) return;
    setLoading(true);
    axios
      .get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cgId}`
      )
      .then((res) => {
        setCgData(res.data[0]);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response && err.response.status === 429) {
          setError(
            "Price temporarily unavailable (rate limit). Please try again in a moment."
          );
          toast.error("Too many requests to price provider. Please wait.");
        } else {
          setError("Failed to fetch price.");
          toast.error("Failed to fetch price.");
        }
      });
  }, [selected]);

  useEffect(() => {
    if (!cgData || !cgData.current_price) {
      setAmount("");
      return;
    }
    if (lastChanged === "quantity") {
      const value = parseFloat(quantity) * cgData.current_price;
      setAmount(quantity ? value.toFixed(2) : "");
    } else if (lastChanged === "usd") {
      const qty = parseFloat(amount) / cgData.current_price;
      setQuantity(amount ? qty.toFixed(8).replace(/\.?0+$/, "") : "");
    }
    // eslint-disable-next-line
  }, [quantity, amount, cgData, lastChanged]);

  const handleContinue = () => {
    if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    } else if (!amount || isNaN(amount) || parseFloat(amount) < 5) {
      setError("Minimum trade amount is $5.");
      return;
    }
    localStorage.setItem(
      "tradeDetails",
      JSON.stringify({
        asset: selected,
        quantity,
        amount,
      })
    );
    navigate("/select-trader");
  };

  return (
    <div className="edit-profile-modal-backdrop">
      <div
        className="edit-profile-modal-content bg-white rounded-3 shadow p-4"
        style={{ maxWidth: 400 }}
      >
        <h5 className="text-center mb-4 text-primary fw-bold">Token sale</h5>
        {error && (
          <div
            className="alert alert-warning text-center py-2 mb-2"
            style={{ fontSize: 14 }}
          >
            {error}
          </div>
        )}
        <div className="mb-3 fw-semibold" style={{ fontSize: 16 }}>
          You are Selling
        </div>
        <div className="mb-4">
          <div className="d-flex align-items-center bg-light rounded p-3 mb-2">
            {cgData?.image && (
              <img
                src={cgData.image}
                alt={selected?.symbol}
                width={32}
                height={32}
                className="me-2"
              />
            )}
            <div className="flex-grow-1">
              <div className="fw-bold">{selected?.name}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                {selected?.symbol}
              </div>
            </div>
            <select
              className="form-select w-auto ms-2"
              value={selected?.id || ""}
              onChange={(e) => {
                const asset = assets.find((a) => a.id === e.target.value);
                setSelected(asset);
                setQuantity("");
                setAmount("");
              }}
              style={{ minWidth: 100 }}
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-2 fw-semibold" style={{ fontSize: 16 }}>
          Quantity
        </div>
        <div className="bg-light rounded px-3 py-2 mb-2">
          <input
            type="number"
            min="0"
            step="any"
            className="form-control border-0 bg-light"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setError(null);
              setLastChanged("quantity");
            }}
            style={{ fontSize: 18 }}
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            inputMode="decimal"
            className="form-control text-center"
            value={amount ? `$${amount}` : "$0.00"}
            onChange={(e) => {
              let val = e.target.value.replace(/[^0-9.]/g, "");
              setAmount(val);
              setError(null);
              setLastChanged("usd");
            }}
            style={{
              background: "#f5f5f5",
              fontWeight: "bold",
              fontSize: 18,
              border: "none",
              color: "#222",
            }}
            placeholder="$0.00"
          />
        </div>
        <button
          className="btn btn-primary w-100"
          style={{ fontSize: 17 }}
          disabled={loading || error}
          onClick={handleContinue}
        >
          Continue
        </button>
        <button
          className="btn btn-link w-100 mt-2"
          onClick={onClose}
          disabled={loading}
          style={{ color: "#888" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TradeModal;
