import { api } from "./api";

export const fetchPendingTrades = async (user) => {
  const res = await api.get("transactions/?status=pending");
  const pendingTrades = res.data.filter(
    (trade) =>
      trade.seller?.id === user.id || trade.vendor?.user?.id === user.id
  );
  return pendingTrades;
};
