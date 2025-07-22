import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import TransactionItem from "../components/TransactionItem";
import { coingeckoIdMap } from "../utils/utils";

function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [cgData, setCgData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/transactions/").then((res) => {
      const txs = res.data
        .filter(
          (t) => t.seller?.id === user.id || t.vendor?.user?.id === user.id
        )
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      setTransactions(txs);
      setLoading(false);
    });
  }, [user.id]);

  // Fetch CoinGecko data for all unique asset symbols in transactions
  useEffect(() => {
    const symbols = [
      ...new Set(
        transactions
          .map(
            (tx) =>
              tx.asset?.symbol?.toUpperCase() ||
              (typeof tx.asset === "string" ? tx.asset.toUpperCase() : null)
          )
          .filter(Boolean)
      ),
    ];
    const ids = symbols.map((sym) => coingeckoIdMap[sym]).filter(Boolean);
    if (!ids.length) return;

    const fetchCoinGecko = async () => {
      try {
        const cgResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(
            ","
          )}`
        );
        const data = await cgResponse.json();
        const cgMap = {};
        data.forEach((coin) => {
          cgMap[coin.symbol.toUpperCase()] = coin;
        });
        setCgData(cgMap);
      } catch (e) {
        // ignore
      }
    };
    fetchCoinGecko();
  }, [transactions]);

  const grouped = transactions.reduce((acc, tx) => {
    const date = new Date(tx.created_at).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    acc[date] = acc[date] || [];
    acc[date].push(tx);
    return acc;
  }, {});

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <span className="spinner-border text-primary" /> Loading transactions...
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 500 }}>
      {Object.keys(grouped).length === 0 && (
        <div className="alert alert-info text-center">
          No transactions found.
        </div>
      )}
      {Object.entries(grouped).map(([date, txs]) => (
        <div key={date} className="mb-4">
          <div className="fw-semibold mb-2" style={{ color: "#888" }}>
            {date}
          </div>
          {txs.map((tx) => (
            <TransactionItem
              key={tx.id}
              tx={tx}
              user={user}
              cg={
                cgData[
                  tx.asset?.symbol?.toUpperCase() ||
                    (typeof tx.asset === "string" ? tx.asset.toUpperCase() : "")
                ]
              }
              onView={() => navigate(`/transactions/${tx.id}`)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Transactions;
