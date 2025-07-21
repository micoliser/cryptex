import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { BsChatDots } from "react-icons/bs";
import { useAuth } from "../contexts/AuthContext";
import useTradeWebSocket from "../utils/websocket";
import SellerTrade from "../components/SellerTrade";
import VendorTrade from "../components/VendorTrade";
import TradeChat from "../components/TradeChat";

const INACTIVITY_LIMIT = 10 * 60;

const STATUS_CONFIG = {
  pending: {
    color: "#f7b731",
    text: "Ongoing\ntransaction",
    alert: (
      <>
        <b>Note:</b> Please send the specified amount of{" "}
        <b>{/* asset name will be injected */}</b> to the vendor. After sending,
        paste the transaction hash below and click{" "}
        <b>"I have sent the tokens"</b>. The vendor will verify and complete the
        trade.
        <br />
        <br />
        <b>If you have any issues, contact support.</b>
      </>
    ),
  },
  completed: {
    color: "#27ae60",
    text: "Transaction\ncompleted",
    alert: (
      <>
        <b>Success:</b> This transaction has been completed. Thank you for using
        Cryptex!
      </>
    ),
  },
  cancelled: {
    color: "#eb3b5a",
    text: "Transaction\ncancelled",
    alert: (
      <>
        <b>Cancelled:</b> This transaction was cancelled. No funds were
        transferred.
      </>
    ),
  },
};

const TradePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [tokensSent, setTokensSent] = useState(false);
  const [paymentMade, setPaymentMade] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState(INACTIVITY_LIMIT);
  const [chatOpen, setChatOpen] = useState(false);
  const timerRef = useRef();
  const navigate = useNavigate();

  const onTradeMessage = useCallback(
    (data) => {
      if (data.type === "tokens_sent") {
        setTokensSent(true);
        setTxHash(data.tx_hash);
        toast.success("Seller has sent the tokens!");
      }
      if (data.type === "payment_made") {
        setPaymentMade(true);
        setPaymentAmount(data.amount);
        toast.success("Vendor has made the payment!");
      }
      if (data.type === "payment_confirmed") {
        toast.success("Seller has confirmed the payment!");
        navigate(`/trade/${id}/completed`);
      }
      if (data.type === "transaction_cancelled") {
        toast.error(
          `This transaction has been cancelled by ${
            data.cancelled_by || "the system"
          }`
        );
        setTrade((t) => t && { ...t, status: "cancelled" });
      }
    },
    [id, navigate]
  );

  const sendWS = useTradeWebSocket(id, onTradeMessage);

  const isInitialState =
    trade &&
    !trade.transaction_hash &&
    !trade.value_paid_in_naira &&
    (trade.status === "pending" || !trade.status);

  useEffect(() => {
    if (!trade || !isInitialState) {
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const startTime = new Date(trade.created_at).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const initialTimeLeft = Math.max(INACTIVITY_LIMIT - elapsed, 0);
    setTimeLeft(initialTimeLeft);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [trade, isInitialState]);

  useEffect(() => {
    api
      .get(`/transactions/${id}/`)
      .then((res) => {
        const tradeData = res.data;
        if (
          user.id !== tradeData.seller.id &&
          user.id !== tradeData.vendor.user.id
        ) {
          toast.error("You do not have permission to view this trade");
          navigate("/");
          return;
        }
        setTrade(tradeData);
        setIsSeller(tradeData.seller.id === user.id);
        if (tradeData.transaction_hash) {
          setTokensSent(true);
          setTxHash(tradeData.transaction_hash);
        }
        if (tradeData.value_paid_in_naira) {
          setPaymentMade(true);
          setPaymentAmount(tradeData.value_paid_in_naira);
        }
      })
      .catch(() => toast.error("Failed to load trade"))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleCancel = () => setShowCancelModal(true);

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      await api.patch(`/transactions/${id}/`, { status: "cancelled" });
      toast.success("Transaction cancelled");
      setTrade((t) => t && { ...t, status: "cancelled" });
      setShowCancelModal(false);
    } catch (e) {
      toast.error("Failed to cancel transaction");
      console.error("Cancel error:", e);
    } finally {
      setCancelling(false);
    }
  };

  const handleSentTokens = (txHash) => {
    setTokensSent(true);
    sendWS({ type: "tokens_sent", sender: user.username, tx_hash: txHash });
    toast.success("Tokens sent! Vendor will be notified.");
  };

  const handlePayment = () => {
    setPaymentMade(true);
    sendWS({
      type: "payment_made",
      amount: paymentAmount,
      vendor: trade.vendor?.display_name || trade.vendor,
      username: user.username,
    });
    toast.success("Payment completed! Seller will be notified.");
  };

  const handleConfirmedReceived = () => {
    sendWS({ type: "payment_confirmed", tradeId: id });
    toast.success("Payment confirmed!");
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

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

  const statusKey = (trade.status || "pending").toLowerCase();
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;

  return (
    <div className="container py-4" style={{ maxWidth: 500 }}>
      <h4 className="mb-3 text-primary fw-bold">
        Trading {trade.asset?.name || trade.asset} with{" "}
        {isSeller
          ? trade.vendor?.display_name || trade.vendor
          : trade.seller?.username || trade.seller}
      </h4>
      {statusKey === "pending" && isInitialState && (
        <div className="mb-3">
          <div className="alert alert-info">
            <b>Time left to start this trade:</b>{" "}
            <span style={{ fontFamily: "monospace", fontSize: 18 }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      )}
      <div className="mb-3">
        <div>
          <b>Asset:</b> {trade.asset?.name || trade.asset}
        </div>
        <div>
          <b>Amount:</b> {trade.amount}
        </div>
        <div>
          {isSeller ? (
            <>
              <b>Vendor:</b> {trade.vendor?.display_name || trade.vendor}
            </>
          ) : (
            <>
              <b>Buyer:</b> {trade.seller?.username || trade.seller}
            </>
          )}
        </div>
        <div>
          <b>Status:</b> {trade.status}
        </div>
      </div>
      <div className="d-flex justify-content-center my-3">
        <div
          style={{
            width: 250,
            height: 250,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i
            className="bi bi-arrow-repeat"
            style={{
              fontSize: 250,
              color: statusConfig.color,
              opacity: 0.9,
              transition: "color 0.3s",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              width: "140px",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontWeight: 500,
                color: statusConfig.color,
                fontSize: 18,
                lineHeight: 1.2,
                whiteSpace: "pre-line",
              }}
            >
              {statusConfig.text}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div
          className={`alert ${
            statusKey === "pending"
              ? "alert-warning"
              : statusKey === "completed"
              ? "alert-success"
              : "alert-danger"
          } mb-0`}
          style={{ fontSize: 15 }}
        >
          {statusKey === "pending" ? (
            isSeller ? (
              <>
                <b>Note:</b> Click on the chat icon to start a chat with the
                trader and get the receiving address and network. Send the
                specified amount of <b>{trade.asset?.name || trade.asset}</b> to
                the vendor address. After sending, paste the transaction hash
                then click <b>"I have sent the tokens"</b>. The vendor will
                verify and complete the trade.
                <br />
                <br />
                <b className="text-danger" style={{ fontWeight: 1000 }}>
                  Always make sure you verify the current rate with the vendor
                  and agree on the price recieved in Naira before you send the
                  assets
                </b>
                <br />
                <br />
                <b className="text-primary" style={{ fontWeight: 1000 }}>
                  Only send using BTC, SOL, TRX, TON or any EVM network
                </b>
                <br />
                <br />
                <b>If you have any issues, contact support.</b>
              </>
            ) : (
              <>
                <b>Note:</b> Click on the chat icon to start a chat with the
                seller. Provide the correct receiving address and network to the
                seller and then wait for the tokens to be sent. After receiving
                the tokens, confirm and click on{" "}
                <b>"I have received the tokens"</b>. Then request for the
                sellers account details and make the transfer in Naira.
                <br />
                <br />
                <b className="text-danger" style={{ fontWeight: 1000 }}>
                  Always make sure you specify the current rate with the seller
                  and agree on the price to be sent in Naira before you send the
                  receiving address
                </b>
                <br />
                <br />
                <b className="text-primary" style={{ fontWeight: 1000 }}>
                  Only receive using BTC, SOL, TRX, TON or any EVM network
                </b>
                <br />
                <br />
                <b>If you have any issues, contact support.</b>
              </>
            )
          ) : (
            // Status specific alert
            statusConfig.alert
          )}
        </div>
      </div>
      {statusKey !== "pending" && (
        <div className="mb-3">
          <button
            className="btn btn-outline-danger"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      )}
      {statusKey === "pending" &&
        (isSeller ? (
          <SellerTrade
            trade={trade}
            txHash={txHash}
            setTxHash={setTxHash}
            tokensSent={tokensSent}
            paymentMade={paymentMade}
            paymentAmount={paymentAmount}
            handleCancel={handleCancel}
            handleSentTokens={handleSentTokens}
            handleConfirmedReceived={handleConfirmedReceived}
          />
        ) : (
          <VendorTrade
            trade={trade}
            txHash={txHash}
            tokensSent={tokensSent}
            paymentMade={paymentMade}
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            handleCancel={handleCancel}
            handlePayment={handlePayment}
          />
        ))}
      {statusKey === "pending" &&
        (!chatOpen ? (
          <div style={{ position: "fixed", bottom: "5%", right: "10%" }}>
            <button
              onClick={() => setChatOpen(true)}
              style={{
                background: "#fff",
                border: "none",
                borderRadius: "50%",
                boxShadow: "0 2px 8px #0001",
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Open chat"
            >
              <BsChatDots size={50} color="#3777f0" />
            </button>
          </div>
        ) : (
          <TradeChat
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            user={user}
            trade={trade}
          />
        ))}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.4)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Cancel Transaction</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCancelModal(false)}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                Are you sure you want to cancel this transaction? This action
                cannot be undone.
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                >
                  No
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradePage;
