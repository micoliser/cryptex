function TransactionItem({ tx, user, cg, onView }) {
  const isBuy = tx.seller?.id !== user.id;
  const statusColor =
    tx.status === "completed"
      ? "#27ae60"
      : tx.status === "pending"
      ? "#f7b731"
      : "#eb3b5a";
  const statusText = tx.status.charAt(0).toUpperCase() + tx.status.slice(1);

  const symbol =
    tx.asset?.symbol || (typeof tx.asset === "string" ? tx.asset : "");
  const iconUrl = cg?.image || "/logo192.png";

  return (
    <div
      className="d-flex align-items-center justify-content-between mb-3 p-3 rounded"
      style={{
        background: "#fff",
        boxShadow: "0 2px 8px #0001",
        minHeight: 70,
      }}
    >
      <div className="d-flex align-items-center">
        <img
          src={iconUrl}
          alt="asset"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            marginRight: 12,
            background: "#f0f0f0",
          }}
        />
        <div>
          <div
            className="fw-bold"
            style={{
              color: isBuy ? "#0b7417" : "#eb3b5a",
              fontSize: 16,
            }}
          >
            {isBuy ? "Bought" : "Sold"} {tx.asset?.symbol}
          </div>
          <div style={{ fontSize: 13, color: "#888" }}>
            {isBuy
              ? `From: ${tx.seller?.username || tx.seller}`
              : `To: ${tx.vendor?.display_name || tx.vendor}`}
          </div>
          <div style={{ fontSize: 13, color: statusColor }}>
            Status: {statusText}
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <div
          className="fw-semibold"
          style={{
            color: isBuy ? "#0b7417" : "#eb3b5a",
            fontSize: 15,
          }}
        >
          {isBuy ? "+" : "-"}
          {Number(tx.quantity).toFixed(4)} {symbol?.toUpperCase()}
        </div>
        <button className="btn btn-primary btn-sm mt-2" onClick={onView}>
          View
        </button>
      </div>
    </div>
  );
}

export default TransactionItem;
