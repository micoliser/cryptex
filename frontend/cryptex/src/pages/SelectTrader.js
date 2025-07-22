import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../utils/api";
import { fetchPendingTrades } from "../utils/utils";
import { useAuth } from "../contexts/AuthContext";
import "../styles/select-trader.css";

const SelectTrader = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tradeDetails, setTradeDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const details = JSON.parse(localStorage.getItem("tradeDetails"));
    setTradeDetails(details);
    if (!details || !details.asset) {
      navigate("/");
      return;
    }
    try {
      const pendingTrades = fetchPendingTrades(user);
      if (pendingTrades.length > 0) {
        toast.error(
          "You have an existing pending trade. Go to pending trades to complete or cancel it before starting a new trade."
        );
        navigate("/trades/pending");
        return;
      }
    } catch (error) {
      toast.error("Failed to load pending trades.");
      navigate("/");
      return;
    }
    api
      .get("/vendors/")
      .then((res) => {
        // Only vendors that support the asset
        const filtered = res.data.filter((v) => {
          if (user?.is_vendor && v.user.id === user.id) return false;
          return v.supported_assets.some((a) => a.id === details.asset.id);
        });
        setVendors(filtered);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  const handleStartTrade = async (vendor) => {
    try {
      const vendorPendingTrades = await fetchPendingTrades(vendor.user);
      if (vendorPendingTrades.length > 0) {
        toast.error(
          "Vendor is currently busy with another trade. Please select a different vendor."
        );
        return;
      }
      const tradeDetails = JSON.parse(localStorage.getItem("tradeDetails"));
      const res = await api.post("/transactions/", {
        seller_id: user.id,
        vendor_id: vendor.id,
        asset_id: tradeDetails.asset.id,
        quantity: tradeDetails.quantity,
        amount: tradeDetails.amount,
        status: "pending",
      });

      const ws = new window.WebSocket(
        `ws://localhost:8000/ws/vendor/${vendor.id}/`
      );
      ws.onopen = () => {
        console.log("WebSocket connection established");
        ws.send(
          JSON.stringify({
            type: "trade_started",
            trade: {
              id: res.data.id,
              seller: { username: user.username },
              asset: { name: tradeDetails.asset.name },
              amount: tradeDetails.amount,
            },
          })
        );
        ws.close();
      };
      navigate(`/trade/${res.data.id}`);
    } catch (err) {
      toast.error("Failed to start trade. Please try again.");
    }
  };

  if (!tradeDetails) return null;

  return (
    <div className="container py-4">
      <h4 className="mb-3 text-primary fw-bold">
        Select a trader to trade with
      </h4>
      <div className="mb-3">
        <span className="fw-semibold">Asset:</span> {tradeDetails.asset.name} (
        {tradeDetails.asset.symbol})
        <br />
        <span className="fw-semibold">Amount:</span> {tradeDetails.amount}
      </div>
      {loading ? (
        <div>Loading traders...</div>
      ) : vendors.length === 0 ? (
        <div className="alert alert-warning">
          No traders found for this asset.
        </div>
      ) : (
        <div className="row g-3">
          {vendors.map((vendor) => {
            const isOnline = vendor.is_online;
            return (
              <div key={vendor.id} className="col-12 col-sm-6 col-lg-4">
                <div className="trader-card d-flex align-items-center mb-3 p-3 bg-white rounded-3 shadow-sm h-100">
                  <img
                    src={
                      vendor.user.picture ||
                      "https://www.gravatar.com/avatar/?d=mp"
                    }
                    alt={vendor.display_name}
                    className="trader-avatar me-3"
                  />
                  <div className="flex-grow-1">
                    <div className="fw-bold">{vendor.display_name}</div>
                    <div className="d-flex align-items-center mb-1">
                      <span
                        className={`trader-status-dot me-1 ${
                          isOnline ? "online" : "offline"
                        }`}
                      />
                      <span
                        className={`small ${
                          isOnline ? "text-success" : "text-secondary"
                        }`}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div
                      className="d-flex align-items-center text-muted"
                      style={{ fontSize: 15 }}
                    >
                      <span className="me-1">
                        &#9733; {vendor.rating || "No ratings yet"}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`btn trader-message-btn px-3 fs-6 ${
                      isOnline ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => handleStartTrade(vendor)}
                    disabled={!isOnline}
                    style={{
                      opacity: isOnline ? 1 : 0.6,
                      cursor: isOnline ? "pointer" : "not-allowed",
                    }}
                  >
                    Trade
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectTrader;
