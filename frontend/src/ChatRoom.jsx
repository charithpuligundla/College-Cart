import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChatRoom() {
    const { chatId } = useParams();
    const userId = localStorage.getItem("userId");
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    useEffect(() => {
        socket.emit("joinRoom", chatId);

        const handleReceiveMessage = (msg) => {
            setMessages(prev => [...prev, msg]);
        };

        socket.on("receiveMessage", handleReceiveMessage);

        axios.get(`http://localhost:5000/chat/${chatId}`)
            .then(res => setMessages(res.data.messages));

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [chatId]);


    const sendMessage = () => {
        socket.emit("sendMessage", {
            roomId: chatId,
            senderId: userId,
            text
        });
        setText("");
    };

    return (
        <div>
            <h2>Chat Room</h2>

            {messages.map((m, i) => (
                <p key={i}>
                    <b>{m.sender?._id === userId ? "you" : m.sender?.userName}:</b> {m.text}
                </p>
            ))}

            <input
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}
