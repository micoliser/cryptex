import { useState } from "react";
import SearchBar from "../components/SearchBar";
import MainCard from "../components/MainCard";
import AssetList from "../components/AssetList";
import TradeModal from "../components/TradeModal";
import { useAuth } from "../contexts/AuthContext";
import { fetchPendingTrades } from "../utils/utils";
import toast from "react-hot-toast";

const HomePage = () => {
  const { user } = useAuth();
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const handleTradeClick = async (asset = undefined) => {
    try {
      const pendingTrades = await fetchPendingTrades(user);
      if (pendingTrades.length > 0) {
        toast.error(
          "You have an existing pending trade. Go to pending trades to complete or cancel it before starting a new trade."
        );
      } else {
        if (asset) setSelectedAsset(asset);
        setShowTradeModal(true);
      }
    } catch (error) {
      toast.error("Failed to check pending trades.");
    }
  };

  return (
    <div className="row h-100">
      <div className="col-md-7 p-4">
        <SearchBar />
        <MainCard onTrade={handleTradeClick} />
      </div>
      <div className="col-12 col-md-3 p-4">
        <AssetList onTrade={handleTradeClick} />
      </div>
      {showTradeModal && (
        <TradeModal
          show={showTradeModal}
          onClose={() => setShowTradeModal(false)}
          asset={selectedAsset}
        />
      )}
    </div>
  );
};

export default HomePage;
