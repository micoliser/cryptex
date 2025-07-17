import { useState, useEffect, useRef } from "react";
import Asset from "./Asset";
import axios from "axios";
import { api } from "../utils/api";

const coingeckoIdMap = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  USDC: "usd-coin",
  USDT: "tether",
  XRP: "ripple",
};

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [cgData, setCgData] = useState({});
  const prevPrices = useRef({});

  const currency =
    localStorage.getItem("preferredCurrency").toLowerCase() || "usd";

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await api.get("/assets/");
        setAssets(response.data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };
    fetchAssets();
  }, []);

  useEffect(() => {
    if (assets.length === 0) return;

    const fetchCoinGecko = async () => {
      const ids = assets
        .map((asset) => coingeckoIdMap[asset.symbol])
        .filter(Boolean);

      if (ids.length) {
        try {
          const cgResponse = await axios.get(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${ids.join(
              ","
            )}`
          );
          const cgMap = {};
          cgResponse.data.forEach((coin) => {
            cgMap[coin.symbol.toUpperCase()] = coin;
          });
          setCgData((old) => {
            prevPrices.current = {};
            for (const symbol in cgMap) {
              prevPrices.current[symbol] = old[symbol]?.current_price;
            }
            return cgMap;
          });
        } catch (error) {
          // do nothing
        }
      }
    };

    fetchCoinGecko();
    const interval = setInterval(fetchCoinGecko, 10000);
    return () => clearInterval(interval);
  }, [assets]);

  return (
    <div>
      <h5 className="fw-bold text-primary mb-3">Assets</h5>
      {assets.map((asset) => {
        const cg = cgData[asset.symbol];
        const prevPrice = prevPrices.current[asset.symbol];
        const priceChanged =
          cg && prevPrice !== undefined && cg.current_price !== prevPrice;

        return (
          <Asset
            key={asset.id}
            icon={
              cg ? (
                <img src={cg.image} alt={asset.symbol} width={24} height={24} />
              ) : null
            }
            name={asset.name}
            symbol={asset.symbol}
            price={cg ? cg.current_price : "N/A"}
            currency={currency}
            change={
              cg && typeof cg.price_change_percentage_24h === "number"
                ? `${cg.price_change_percentage_24h.toFixed(2)}`
                : "N/A"
            }
            priceChanged={priceChanged}
          />
        );
      })}
    </div>
  );
};

export default AssetList;
