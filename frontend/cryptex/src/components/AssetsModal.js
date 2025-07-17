import { useEffect, useState } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const AssetsModal = ({
  showAssetsModal,
  setShowAssetsModal,
  handleProfileUpdated,
  user,
}) => {
  const [allAssets, setAllAssets] = useState([]);
  const [updatingAsset, setUpdatingAsset] = useState(false);
  const [updatingAssetId, setUpdatingAssetId] = useState(null);

  const vendorProfile = user?.vendor_profile;
  const supportedAssets = vendorProfile?.supported_assets || [];

  useEffect(() => {
    if (showAssetsModal) {
      api
        .get("/assets/")
        .then((res) => setAllAssets(res.data))
        .catch(() => toast.error("Failed to fetch assets"));
    }
  }, [showAssetsModal]);

  const handleToggleAsset = async (
    { id: assetId, name: assetName },
    isSupported
  ) => {
    if (!vendorProfile) return;
    setUpdatingAsset(true);
    setUpdatingAssetId(assetId);
    let newAssets;
    if (isSupported) {
      newAssets = supportedAssets
        .filter((a) => a.id !== assetId)
        .map((a) => a.id);
    } else {
      newAssets = [...supportedAssets.map((a) => a.id), assetId];
    }
    try {
      await api.patch(`/vendors/${vendorProfile.id}/`, {
        supported_assets_ids: newAssets,
      });
      await handleProfileUpdated();
      toast.success(
        isSupported ? `${assetName} removed` : `${assetName} added`
      );
    } catch {
      toast.error("Failed to update assets");
    } finally {
      setUpdatingAsset(false);
      setUpdatingAssetId(null);
    }
  };

  return (
    <div className="edit-profile-modal-backdrop">
      <div
        className="edit-profile-modal-content bg-white rounded-3 shadow p-4"
        style={{ maxWidth: 400 }}
      >
        <h5 className="text-center mb-4 text-primary fw-bold">
          Manage Supported Assets
        </h5>
        <div
          className="d-flex flex-column gap-2"
          style={{ maxHeight: 350, overflowY: "auto" }}
        >
          {allAssets.map((asset) => {
            const isSupported = supportedAssets.some((a) => a.id === asset.id);
            return (
              <div
                key={asset.id}
                className="d-flex align-items-center justify-content-between border-bottom py-2"
              >
                <div>
                  <span className="fw-semibold">
                    {asset.symbol || asset.name}
                  </span>
                  <span className="text-muted ms-2" style={{ fontSize: 13 }}>
                    {asset.name}
                  </span>
                </div>
                <button
                  className={`btn btn-sm ${
                    isSupported ? "btn-danger" : "btn-success"
                  }`}
                  disabled={updatingAsset}
                  onClick={() => handleToggleAsset(asset, isSupported)}
                >
                  {isSupported ? (
                    updatingAssetId === asset.id ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Removing...
                      </span>
                    ) : (
                      "Remove"
                    )
                  ) : updatingAssetId === asset.id ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Adding...
                    </span>
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <div className="d-flex gap-2 mt-4">
          <button
            className="btn btn-outline-secondary flex-grow-1"
            onClick={() => setShowAssetsModal(false)}
            disabled={updatingAsset}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetsModal;
