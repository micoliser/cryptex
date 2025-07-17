import { useState } from "react";
import SearchBar from "../components/SearchBar";
import MainCard from "../components/MainCard";
import AssetList from "../components/AssetList";
import TradeModal from "../components/Trade";

const HomePage = () => {
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <div className="row h-100">
      <div className="col-md-7 p-4">
        <SearchBar />
        <MainCard onTrade={() => setShowTradeModal(true)} />
      </div>
      <div className="col-12 col-md-3 p-4">
        <AssetList
          onTrade={(asset = undefined) => {
            if (asset) setSelectedAsset(asset);
            setShowTradeModal(true);
          }}
        />
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
