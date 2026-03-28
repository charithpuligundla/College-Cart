import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "./ChatRoom.css";


const backenduri = import.meta.env.VITE_BACKENDURI;
const socket = io(backenduri);

export default function ChatRoom() {
    const { chatId } = useParams();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const bottomRef = useRef(null);
    const navigate = useNavigate();
    const [receiver,setreceiver]=useState(null);

    useEffect(() => {
        socket.emit("joinRoom", chatId);

        const handleReceiveMessage = (msg) => {
            setMessages(prev => [...prev, msg]);
        };

        socket.on("receiveMessage", handleReceiveMessage);

        axios.get(`${backenduri}/chat/${chatId}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                setMessages(res.data.messages)
                if(userId===res.data.users[0]._id)
                    setreceiver(res.data.users[1].userName);
                else
                    setreceiver(res.data.users[0].userName);
            });
            

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [chatId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!text.trim()) return;
        socket.emit("sendMessage", {
            roomId: chatId,
            senderId: userId,
            text
        });
        setText("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    function formatTime(timestamp) {
        if (!timestamp) return "";
        const d = new Date(timestamp);
        return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    }

    return (
        <div className="chat-outer">
            {/* Header */}
            <div className="chat-header">
                <button className="chat-back-btn" onClick={() => navigate(-1)}>←</button>
                <div className="chat-header-avatar">💬</div>
                <div className="chat-header-info">
                    <p className="chat-header-title">{receiver}</p>
                    <p className="chat-header-sub">Live · {messages.length} messages</p>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="chat-empty">
                        <div className="chat-empty-icon">💬</div>
                        <p>No messages yet</p>
                        <span>Start the conversation!</span>
                    </div>
                )}
                {messages.map((m, i) => {
                    const isMe = m.sender?._id === userId;
                    const showName = !isMe && (i === 0 || messages[i - 1]?.sender?._id !== m.sender?._id);
                    return (
                        <div key={i} className={isMe ? "msg-row me" : "msg-row them"}>
                            {!isMe && (
                                <div className="msg-avatar">
                                    {m.sender?.userName?.[0]?.toUpperCase() || "?"}
                                </div>
                            )}
                            <div className="msg-bubble-wrap">
                                {showName && (
                                    <p className="msg-sender-name">{m.sender?.userName}</p>
                                )}
                                <div className="msg-bubble">
                                    <p className="msg-text">{m.text}</p>
                                    <span className="msg-time">{formatTime(m.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef}></div>
            </div>

            {/* Input bar */}
            <div className="chat-input-bar">
                <input
                    className="chat-input"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                />
                <button
                    className={text.trim() ? "chat-send-btn active" : "chat-send-btn"}
                    onClick={sendMessage}
                >
                    ➤
                </button>
            </div>
        </div>
    );
}