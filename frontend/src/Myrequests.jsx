import "./Myrequests.css"
import { useEffect, useState } from "react";
import profileImg from "./images/cart-logo.png"
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

export default function Myrequests() {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const [Myrequest, setmyrequest] = useState([]);
    const [showrightdiv, setshowrightdiv] = useState(false);
    const [showEditblur, setshowEditblur] = useState(false);
    const [showpreview, setshowpreview] = useState(false);
    const [previndex, setprevindex] = useState(0);
    const [confirmModal, setconfirmModal] = useState(null); // { title, message, onConfirm }
    const navigate = useNavigate();
    const backenduri = import.meta.env.VITE_BACKENDURI;

    useEffect(() => {
        axios.post(`${backenduri}/myrequests`, { userId }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                console.log(res);
                setmyrequest(res.data);
            })
            .catch(err => {
                console.log(err);
            })
    }, [])

    function askConfirm(title, message, onConfirm) {
        setconfirmModal({ title, message, onConfirm });
        setshowEditblur(true);
    }

    function closeConfirm() {
        setconfirmModal(null);
        setshowEditblur(false);
    }

    return (
        <div className="home-outer-div">
            <div className="home-top-bar">
                <div className="title-name-div">
                    <p className="title-up-name"
                        onClick={() => {
                            navigate("/home");
                        }}
                    >COLLEGE
                        <span className="title-down-name">CART</span>
                    </p>
                </div>
                <button className="display-sidebar-top-btn out"
                    onClick={() => {
                        setshowrightdiv(prev => !prev);
                        setshowEditblur(prev => !prev);
                    }}
                >☰</button>
                <div className="right-top-div">
                    <p
                        style={{
                            backgroundColor: "rgba(0, 140, 255, 1)",
                            color: "white",
                            padding: "5px",
                            borderRadius: "15px"
                        }}
                    >Requested</p>
                    <p
                        onClick={() => {
                            navigate("/mydeliveries");
                        }}
                    >Accepted</p>
                    <p className="docs-p">Docs</p>
                    <p>Help</p>
                    <img src={profileImg} className="profile-img"
                        onClick={() => {
                            navigate(`/profile/${userId}`);
                        }}
                    ></img>
                </div>
            </div>
            <div className={showrightdiv ? "sidebar show" : "sidebar"}>
                <button className="display-sidebar-top-btn in"
                    onClick={() => {
                        setshowrightdiv(prev => !prev);
                        setshowEditblur(prev => !prev);
                    }}
                >☰</button>
                <p
                    style={{
                        backgroundColor: "rgba(0, 140, 255, 1)",
                        color: "white",
                        padding: "5px",
                        borderRadius: "15px"
                    }}
                >Requested</p>
                <p
                    onClick={() => {
                        navigate("/mydeliveries");
                    }}
                >Accepted</p>
                <p className="docs-p">Docs</p>
                <p>Help</p>
                <img src={profileImg} className="profile-img"
                    onClick={() => {
                        navigate(`/profile/${userId}`);
                    }}
                ></img>
            </div>
            <div
                className={showEditblur ? "blurscreens show" : "blurscreens"}
                onClick={() => {
                    if (confirmModal) return; // don't close blur when confirm is open
                    setshowrightdiv(false);
                    setshowEditblur(false);
                    setshowpreview(false);
                }}
            ></div>

            <p className="requests-head-p">My Requests:-</p>
            <div className="myrequest-cards-div">
                {
                    Myrequest.map((data, index) => {
                        const d = new Date(data.createdAt);
                        const formatted = d.toLocaleString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        });
                        let deliveryfee;
                        if (data.totalAmount <= 500) {
                            deliveryfee = data.totalAmount / 10;
                        } else {
                            deliveryfee = 50;
                        }

                        return (
                            <div
                                key={data._id || index}
                                className="home-request-card"
                                onClick={() => {
                                    setprevindex(index);
                                    setshowpreview(true);
                                    setshowEditblur(true);
                                }}
                            >
                                <div className="own-badge" style={{
                                    background:
                                        data.status === "accepted" ? "linear-gradient(135deg,#00c853,#69f0ae)" :
                                            data.status === "pending" ? "linear-gradient(135deg,#e53935,#ef9a9a)" :
                                                data.status === "delivered" ? "linear-gradient(135deg,#0288d1,#29b6f6)" :
                                                    "linear-gradient(135deg,#757575,#bdbdbd)"
                                }}>{data.status}</div>

                                <div className="card-header-row">
                                    <div className="card-avatar">
                                        {data.userId.userName?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <p className="card-username">{data.userId.userName}</p>
                                        <p className="card-time">{formatted}</p>
                                    </div>
                                    <div className="card-fee-chip">₹{deliveryfee} fee</div>
                                </div>

                                <p className="card-desc">"{data.description}"</p>

                                <div className="card-meta-row">
                                    <div className="meta-pill">
                                        <span className="meta-icon">📦</span>
                                        <span>{data.requested.length} items</span>
                                    </div>
                                    <div className="meta-pill">
                                        <span className="meta-icon">💰</span>
                                        <span>₹{data.totalAmount}</span>
                                    </div>
                                    <div className="meta-pill address-pill">
                                        <span className="meta-icon">📍</span>
                                        <span>{data.address}</span>
                                    </div>
                                </div>

                                <div className="req-card-btn-div"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <button className="see-who-btn"
                                        onClick={() => { navigate(`/profile/${data.acceptedBy}`); }}
                                        style={{
                                            display: (data.status === "pending") || (data.status === "cancelled")
                                                ? "none" : ""
                                        }}
                                    >see who</button>
                                    <button className="chat-btn"
                                        style={{
                                            display: (data.status !== "accepted")
                                                ? "none" : ""
                                        }}
                                        onClick={() => { navigate(`/chat/${data.chatId}`) }}
                                    >chat</button>
                                    <button className="reject-btn"
                                        style={{ display: data.status !== "accepted" ? "none" : "" }}
                                        onClick={() => {
                                            askConfirm(
                                                "Reject Delivery?",
                                                "The request will be reposted and the accepter will be notified. This cannot be undone.",
                                                () => {
                                                    const accepterId = data.acceptedBy;
                                                    const requesterId = data.userId._id;
                                                    axios.post(`${backenduri}/you-rejected/${data._id}`, { accepterId, requesterId }, {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                    })
                                                        .then(res => { }).catch(err => { console.log(err); });
                                                    window.location.reload();
                                                }
                                            );
                                        }}
                                    >reject & repost</button>
                                    <button className="cancel-btn"
                                        style={{ display: data.status !== "pending" ? "none" : "" }}
                                        onClick={() => {
                                            askConfirm(
                                                "Cancel Request?",
                                                "Your request will be permanently cancelled and removed from the list.",
                                                () => {
                                                    const requesterId = data.userId._id;
                                                    axios.post(`${backenduri}/cancel-request/${data._id}`, { requesterId }, {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                    })
                                                        .then(res => { }).catch(err => { console.log(err); });
                                                    window.location.reload();
                                                }
                                            );
                                        }}
                                    >cancel request</button>
                                </div>
                            </div>
                        );
                    })
                }
            </div>

            {/* Preview div */}
            <div className={showpreview ? "preview-div show" : "preview-div"}>
                <button className="close-prev-btn"
                    onClick={() => {
                        setshowpreview(false);
                        setprevindex(0);
                        setshowEditblur(false);
                    }}
                >✕</button>
                {Myrequest[previndex] &&
                    <div>
                        <div className="preview-modal-header">
                            <div className="preview-avatar">
                                {Myrequest[previndex].userId.userName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="preview-username">{Myrequest[previndex].userId.userName}</p>
                                <p className="preview-subtitle">
                                    {Myrequest[previndex].requested.length} items · ₹{Myrequest[previndex].totalAmount}
                                </p>
                            </div>
                        </div>

                        <div className="preview-info-grid">
                            <div className="info-card">
                                <span className="info-label">Total Amount</span>
                                <span className="info-value">₹{Myrequest[previndex].totalAmount}</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Items Count</span>
                                <span className="info-value">{Myrequest[previndex].requested.length}</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Status</span>
                                <span className="info-value" style={{
                                    fontSize: "16px",
                                    color:
                                        Myrequest[previndex].status === "accepted" ? "#00c853" :
                                            Myrequest[previndex].status === "pending" ? "#e53935" :
                                                Myrequest[previndex].status === "delivered" ? "#0288d1" : "grey"
                                }}>{Myrequest[previndex].status}</span>
                            </div>
                        </div>

                        <div className="preview-field">
                            <span className="field-label">📝 Description</span>
                            <p className="field-value">"{Myrequest[previndex].description}"</p>
                        </div>

                        <div className="preview-field">
                            <span className="field-label">📍 Delivery Address</span>
                            <p className="field-value">{Myrequest[previndex].address}</p>
                        </div>

                        <div className="items-section">
                            <h4 className="items-title">🛍️ Items List</h4>
                            {Myrequest[previndex].requested.map((item, idx) => (
                                <div className="item-card" key={idx}>
                                    <div className="item-name-row">
                                        <span className="item-name">{item.itemName}</span>
                                        <span className="item-total">₹{item.quantity * item.price}</span>
                                    </div>
                                    <div className="item-details">
                                        <span>Qty: {item.quantity}</span>
                                        <span>Price: ₹{item.price}</span>
                                    </div>
                                    {item.description && (
                                        <p className="item-desc">{item.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>

            {/* Custom confirm warning modal */}
            {confirmModal && (
                <div className="confirm-modal">
                    <div className="confirm-icon">⚠️</div>
                    <h3 className="confirm-title">{confirmModal.title}</h3>
                    <p className="confirm-message">{confirmModal.message}</p>
                    <div className="confirm-btns">
                        <button className="confirm-no-btn" onClick={closeConfirm}>
                            No, Go Back
                        </button>
                        <button className="confirm-yes-btn" onClick={() => {
                            confirmModal.onConfirm();
                            closeConfirm();
                        }}>
                            Yes, Confirm
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}