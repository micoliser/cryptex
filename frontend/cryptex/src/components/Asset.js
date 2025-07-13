const Asset = ({ icon, name, symbol, price, change, priceChanged }) => (
  <div
    className={`card mb-3 border-0 shadow-sm w-100 ${
      priceChanged ? "price-flash" : ""
    }`}
  >
    <div className="card-body d-flex align-items-center">
      <span className="me-3" style={{ fontSize: 32 }}>
        {icon}
      </span>
      <div className="flex-grow-1">
        <div className="fw-bold">{name}</div>
        <div className="text-muted small">{symbol}</div>
      </div>
      <div className="text-end">
        <div className="fw-bold">${price}</div>
        <div
          className={`${
            change.startsWith("-") ? "text-danger" : "text-success"
          } small`}
        >
          {change}%
        </div>
      </div>
    </div>
    <div className="p-3 pt-0 text-center">
      <button className="btn btn-sm btn-success w-100">Trade Now</button>
    </div>
  </div>
);

export default Asset;
