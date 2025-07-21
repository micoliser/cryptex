import { useEffect, useRef } from "react";

function useTradeWebSocket(tradeId, onMessage) {
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/trade/${tradeId}/`);
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      onMessage && onMessage(data);
    };
    ws.current.onclose = () => console.log("WebSocket closed");
    return () => ws.current && ws.current.close();
  }, [tradeId, onMessage]);

  const send = (data) => {
    if (ws.current && ws.current.readyState === 1) {
      ws.current.send(JSON.stringify(data));
    }
  };

  return send;
}

export function useVendorWebSocket(vendorId, onMessage) {
  const ws = useRef(null);

  useEffect(() => {
    if (!vendorId) return;
    ws.current = new WebSocket(`ws://localhost:8000/ws/vendor/${vendorId}/`);
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      onMessage && onMessage(data);
    };
    ws.current.onclose = () => console.log("Vendor WebSocket closed");
    return () => ws.current && ws.current.close();
  }, [vendorId, onMessage]);

  return ws.current;
}

export default useTradeWebSocket;
