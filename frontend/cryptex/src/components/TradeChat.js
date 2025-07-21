import { useEffect, useState, useRef, useCallback } from "react";
import { FaPaperPlane } from "react-icons/fa";
import useTradeWebSocket from "../utils/websocket";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const defaultPic = "https://www.gravatar.com/avatar/?d=mp";

// Utility to get the other user's id and display info
function getRecipient(user, trade) {
  // If current user is vendor, recipient is seller; else recipient is vendor's user
  if (user.id === trade.vendor?.user?.id) {
    return {
      id: trade.seller?.id,
      name: trade.seller?.username,
      picture: trade.seller?.picture || defaultPic,
    };
  } else {
    return {
      id: trade.vendor?.user?.id,
      name: trade.vendor?.display_name,
      picture: trade.vendor?.picture || defaultPic,
    };
  }
}

const TradeChat = ({ open, onClose, user, trade }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const textareaRef = useRef();
  const messagesEndRef = useRef();

  const recipient = getRecipient(user, trade);

  // WebSocket: send and receive messages
  const onWSMessage = useCallback(
    (data) => {
      if (data.type === "chat_message") {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id || Date.now(),
            sender: {
              id: data.sender,
              name: data.sender_name,
              picture: data.sender_picture,
            },
            recipient: data.recipient,
            content: data.content,
            timestamp: data.timestamp,
            isMe: data.sender === user.id,
          },
        ]);
      }
    },
    [user.id]
  );

  const sendWS = useTradeWebSocket(trade.id, onWSMessage);

  useEffect(() => {
    if (open && trade?.id) {
      api.get(`/chat_messages/?transaction_id=${trade.id}`).then((res) => {
        setMessages(
          res.data.map((msg) => ({
            id: msg.id,
            sender: {
              id: msg.sender.id,
              name: msg.sender.name,
              picture: msg.sender.picture,
            },
            recipient: msg.recipient.id,
            content: msg.content,
            timestamp: msg.created_at,
            isMe: msg.sender.id === user.id,
          }))
        );
      });
    }
  }, [open, trade?.id, user.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "38px";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  useEffect(() => {
    if (open) {
      document.body.classList.add("no-scroll");
      document.documentElement.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
    };
  }, [open]);

  if (!open) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    let savedMsg;
    try {
      const res = await api.post("/chat_messages/", {
        sender_id: user.id,
        recipient_id: recipient.id,
        transaction_id: trade.id,
        content: message,
      });
      savedMsg = res.data;
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
      return;
    }

    // Send via WebSocket for real-time update
    sendWS({
      type: "chat_message",
      id: savedMsg.id,
      content: savedMsg.content,
      sender: savedMsg.sender.id,
      recipient: savedMsg.recipient.id,
      timestamp: savedMsg.created_at,
    });

    setMessage("");
  };

  return (
    <div
      className="position-fixed w-100 h-100"
      style={{
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <div
        className="bg-white d-flex flex-column"
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          width: "100%",
          maxWidth: 430,
          height: "80vh",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.12)",
          position: "relative",
          margin: 0,
          animation: "slideUp 0.25s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-center px-3 py-2 border-bottom">
          <img
            src={recipient.picture}
            alt="avatar"
            className="me-3"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
            }}
          />
          <div className="flex-grow-1 fw-semibold">{recipient.name}</div>
          <button
            onClick={onClose}
            className="btn btn-link p-0"
            style={{
              fontSize: 22,
              color: "#888",
              textDecoration: "none",
            }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        {/* Messages */}
        <div
          className="flex-grow-1 px-3 py-2"
          style={{
            overflowY: "auto",
            background: "#fafbfc",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex align-items-end mb-2 ${
                msg.isMe ? "flex-row-reverse" : ""
              }`}
            >
              <img
                src={msg.sender.picture || defaultPic}
                alt="avatar"
                className={msg.isMe ? "ms-2" : "me-2"}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                }}
              />
              <div>
                <div
                  style={{
                    background: msg.isMe ? "#3777f0" : "#fff",
                    color: msg.isMe ? "#fff" : "#222",
                    borderRadius: 16,
                    padding: "8px 14px",
                    maxWidth: 200,
                    fontSize: 15,
                    boxShadow: msg.isMe
                      ? "0 2px 8px #3777f033"
                      : "0 2px 8px #0001",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#888",
                    marginTop: 2,
                    textAlign: msg.isMe ? "right" : "left",
                  }}
                >
                  {msg.time ||
                    (msg.timestamp &&
                      new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }))}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <form
          onSubmit={handleSend}
          className="d-flex align-items-end gap-2 px-3 py-2 border-top bg-white"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-control"
            style={{
              borderRadius: 20,
              background: "#fafbfc",
              resize: "none",
              minHeight: 38,
              maxHeight: 120,
              overflowY: "auto",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
            }}
          />
          <button
            type="submit"
            className="btn btn-link p-0 d-flex align-items-center justify-content-center"
            style={{
              color: "#3777f0",
              fontSize: 22,
            }}
            aria-label="Send"
          >
            <FaPaperPlane size={25} />
          </button>
          <style>
            {`
              textarea::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
        </form>
      </div>
      {/* Add keyframes for slideUp animation */}
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default TradeChat;
