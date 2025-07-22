import { useEffect, useState, useRef, useCallback } from "react";
import { FaPaperPlane } from "react-icons/fa";
import useTradeWebSocket from "../utils/websocket";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { defaultPic } from "../utils/utils";
import "../styles/trade-chat.css";

function getRecipient(user, trade) {
  console.log("trade", trade);
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
      picture: trade.vendor?.user.picture || defaultPic,
    };
  }
}

const TradeChat = ({ open, onClose, user, trade, isHistory = false }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const textareaRef = useRef();
  const messagesEndRef = useRef();

  const recipient = getRecipient(user, trade);

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

  console.log("recipient", recipient);

  return (
    <div className="position-fixed w-100 h-100 tradechat-modal">
      <div className="tradechat-sheet">
        {/* Header */}
        <div className="d-flex align-items-center px-3 py-2 border-bottom tradechat-header">
          <img
            src={recipient.picture}
            alt="avatar"
            className="me-3 rounded-circle"
            width={40}
            height={40}
          />
          <div className="flex-grow-1 fw-semibold">{recipient.name}</div>
          <button
            onClick={onClose}
            className="btn btn-link p-0 btn-close"
            aria-label="Close"
          ></button>
        </div>
        {/* Messages */}
        <div className="flex-grow-1 px-3 py-2 tradechat-messages">
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
                className={
                  msg.isMe ? "ms-2 rounded-circle" : "me-2 rounded-circle"
                }
                width={32}
                height={32}
              />
              <div>
                <div
                  className={`tradechat-bubble ${
                    msg.isMe ? "tradechat-bubble-me" : "tradechat-bubble-other"
                  }`}
                >
                  {msg.content}
                </div>
                <div
                  className={`tradechat-time ${
                    msg.isMe ? "text-end" : "text-start"
                  }`}
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
        {!isHistory && (
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
              className="form-control tradechat-textarea"
            />
            <button
              type="submit"
              className="btn btn-link p-0 d-flex align-items-center justify-content-center"
              aria-label="Send"
            >
              <FaPaperPlane size={25} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TradeChat;
