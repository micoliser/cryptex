const MainCard = () => (
  <div className="card p-4 mb-4 shadow-sm">
    <div className="card-body p-0">
      <div
        className="rounded bg-dark text-white p-4 mb-4"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #0ff 10%, #001233 100%)",
        }}
      >
        <h4 className="fw-bold">Trade Crypto Easily</h4>
        <div>Buy, sell and chat with traders securely</div>
      </div>
      <div className="d-flex gap-3">
        <button className="btn btn-primary flex-fill">
          <i className="bi bi-arrow-down me-2"></i>Buy
        </button>
        <button className="btn btn-light flex-fill">
          <i className="bi bi-arrow-up me-2"></i>Sell
        </button>
      </div>
    </div>
  </div>
);

export default MainCard;
