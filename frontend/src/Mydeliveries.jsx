import "./Mydeliveries.css"
import { useEffect, useState } from "react";
import profileImg from "./images/cart-logo.png"
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

export default function Mydeliveries() {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const [mydeliveries, setmydeliveries] = useState([]);
    const [showrightdiv, setshowrightdiv] = useState(false);
    const [showEditblur, setshowEditblur] = useState(false);
    const [showpreview, setshowpreview] = useState(false);
    const [previndex, setprevindex] = useState(0);
    const [confirmModal, setconfirmModal] = useState(null);
    const navigate = useNavigate();
    const backenduri = import.meta.env.VITE_BACKENDURI;

    useEffect(() => {
        axios.post(`${backenduri}/myaccepts`, { userId },{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => { setmydeliveries(res.data); })
            .catch(err => { console.log(err); })
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
                    <p className="title-up-name" onClick={() => { navigate("/home"); }}>COLLEGE
                        <span className="title-down-name">CART</span>
                    </p>
                </div>
                <button className="display-sidebar-top-btn out"
                    onClick={() => { setshowrightdiv(prev => !prev); setshowEditblur(prev => !prev); }}
                >☰</button>
                <div className="right-top-div">
                    <p onClick={() => { navigate("/myrequests"); }}>Requested</p>
                    <p style={{ backgroundColor: "rgba(0, 140, 255, 1)", color: "white", padding: "5px", borderRadius: "15px" }}>Accepted</p>
                    <p className="docs-p">Docs</p>
                    <p>Help</p>
                    <img src={profileImg} className="profile-img" onClick={() => { navigate(`/profile/${userId}`); }}></img>
                </div>
            </div>
            <div className={showrightdiv ? "sidebar show" : "sidebar"}>
                <button className="display-sidebar-top-btn in"
                    onClick={() => { setshowrightdiv(prev => !prev); setshowEditblur(prev => !prev); }}
                >☰</button>
                <p onClick={() => { navigate("/myrequests"); }}>Requested</p>
                <p style={{ backgroundColor: "rgba(0, 140, 255, 1)", color: "white", padding: "5px", borderRadius: "15px" }}>Accepted</p>
                <p className="docs-p">Docs</p>
                <p>Help</p>
                <img src={profileImg} className="profile-img" onClick={() => { navigate(`/profile/${userId}`); }}></img>
            </div>
            <div className={showEditblur ? "blurscreens show" : "blurscreens"}
                onClick={() => {
                    if (confirmModal) return;
                    setshowrightdiv(false);
                    setshowEditblur(false);
                    setshowpreview(false);
                }}
            ></div>

            <p className="requests-head-p">My Deliveries:-</p>
            <div className="myrequest-cards-div">
                {mydeliveries.map((data, index) => {
                    const d = new Date(data.createdAt);
                    const formatted = d.toLocaleString("en-IN", {
                        hour: "2-digit", minute: "2-digit", hour12: true,
                        day: "2-digit", month: "short", year: "numeric"
                    });
                    const deliveryfee = data.totalAmount <= 500 ? data.totalAmount / 10 : 50;

                    return (
                        <div key={data._id || index} className="home-request-card"
                            onClick={() => { setprevindex(index); setshowpreview(true); setshowEditblur(true); }}
                        >
                            <div className="own-badge" style={{
                                background:
                                    data.status === "accepted"  ? "linear-gradient(135deg,#00c853,#69f0ae)" :
                                    data.status === "pending"   ? "linear-gradient(135deg,#e53935,#ef9a9a)" :
                                    data.status === "delivered" ? "linear-gradient(135deg,#0288d1,#29b6f6)" :
                                    data.status === "paid"      ? "linear-gradient(135deg,#f9a825,#ffd54f)" :
                                    "linear-gradient(135deg,#757575,#bdbdbd)"
                            }}>{data.status}</div>

                            <div className="card-header-row">
                                <div className="card-avatar">{data.userId.userName?.[0]?.toUpperCase() || "?"}</div>
                                <div>
                                    <p className="card-username">{data.userId.userName}</p>
                                    <p className="card-time">{formatted}</p>
                                </div>
                                <div className="card-fee-chip">Rs.{deliveryfee} fee</div>
                            </div>

                            <p className="card-desc">"{data.description}"</p>

                            <div className="card-meta-row">
                                <div className="meta-pill"><span className="meta-icon">📦</span><span>{data.requested.length} items</span></div>
                                <div className="meta-pill"><span className="meta-icon">💰</span><span>Rs.{data.totalAmount}</span></div>
                                <div className="meta-pill address-pill"><span className="meta-icon">📍</span><span>{data.address}</span></div>
                            </div>

                            <div className="req-card-btn-div" onClick={e => e.stopPropagation()}>
                                <button className="see-who-btn"
                                    onClick={() => { navigate(`/profile/${data.userId._id}`); }}
                                >see who</button>
                                <button className="make-payment-btn"
                                    style={{ display: data.status !== "accepted" ? "none" : "" }}
                                    onClick={() => {
                                            askConfirm(
                                                "Delivery order?",
                                                "The order will be mark as deliverd . This cannot be undone.",
                                                () => {
                                                    const accepterId = data.acceptedBy;
                                                    const requesterId = data.userId._id;
                                                    axios.post(`${backenduri}/delivered/${data._id}`, { accepterId, requesterId }, {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                    })
                                                        .then(res => { }).catch(err => { console.log(err); });
                                                    window.location.reload();
                                                }
                                            );
                                        }}
                                >complete delivery</button>
                                <button className="chat-btn"
                                    style={{ display: (data.status !== "accepted")? "none" : "" }}
                                    onClick={() => { navigate(`/chat/${data.chatId}`) }}
                                >chat</button>
                                <button className="reject-btn"
                                    style={{ display: data.status !== "accepted" ? "none" : "" }}
                                    onClick={() => {
                                        askConfirm(
                                            "Reject Delivery?",
                                            "You will be unassigned from this delivery. The request will be reposted for others.",
                                            () => {
                                                const accepterId = data.acceptedBy;
                                                const requesterId = data.userId._id;
                                                axios.post(`${backenduri}/reject-request/${data._id}`, { accepterId, requesterId },{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
                                                    .then(res => {}).catch(err => { console.log(err); });
                                                window.location.reload();
                                            }
                                        );
                                    }}
                                >reject</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Preview div */}
            <div className={showpreview ? "preview-div show" : "preview-div"}>
                <button className="close-prev-btn"
                    onClick={() => { setshowpreview(false); setprevindex(0); setshowEditblur(false); }}
                >✕</button>
                {mydeliveries[previndex] &&
                    <div>
                        <div className="preview-modal-header">
                            <div className="preview-avatar">{mydeliveries[previndex].userId.userName?.[0]?.toUpperCase()}</div>
                            <div>
                                <p className="preview-username">{mydeliveries[previndex].userId.userName}</p>
                                <p className="preview-subtitle">{mydeliveries[previndex].requested.length} items · Rs.{mydeliveries[previndex].totalAmount}</p>
                            </div>
                        </div>

                        <div className="preview-info-grid">
                            <div className="info-card">
                                <span className="info-label">Total Amount</span>
                                <span className="info-value">Rs.{mydeliveries[previndex].totalAmount}</span>
                            </div>
                            <div className="info-card highlight-card">
                                <span className="info-label">You Earn</span>
                                <span className="info-value earn-value">
                                    Rs.{mydeliveries[previndex].totalAmount <= 500 ? mydeliveries[previndex].totalAmount / 10 : 50}
                                </span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Items Count</span>
                                <span className="info-value">{mydeliveries[previndex].requested.length}</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Status</span>
                                <span className="info-value" style={{
                                    fontSize: "16px",
                                    color:
                                        mydeliveries[previndex].status === "accepted"  ? "#00c853" :
                                        mydeliveries[previndex].status === "pending"   ? "#e53935" :
                                        mydeliveries[previndex].status === "delivered" ? "#0288d1" :
                                        mydeliveries[previndex].status === "paid"      ? "#f9a825" : "grey"
                                }}>{mydeliveries[previndex].status}</span>
                            </div>
                        </div>

                        <div className="preview-field">
                            <span className="field-label">📝 Description</span>
                            <p className="field-value">"{mydeliveries[previndex].description}"</p>
                        </div>
                        <div className="preview-field">
                            <span className="field-label">📍 Delivery Address</span>
                            <p className="field-value">{mydeliveries[previndex].address}</p>
                        </div>

                        <div className="items-section">
                            <h4 className="items-title">🛍️ Items List</h4>
                            {mydeliveries[previndex].requested.map((item, idx) => (
                                <div className="item-card" key={idx}>
                                    <div className="item-name-row">
                                        <span className="item-name">{item.itemName}</span>
                                        <span className="item-total">Rs.{item.quantity * item.price}</span>
                                    </div>
                                    <div className="item-details">
                                        <span>Qty: {item.quantity}</span>
                                        <span>Price: Rs.{item.price}</span>
                                    </div>
                                    {item.description && <p className="item-desc">{item.description}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>

            {/* Confirm warning modal */}
            {confirmModal && (
                <div className="confirm-modal">
                    <div className="confirm-icon">⚠️</div>
                    <h3 className="confirm-title">{confirmModal.title}</h3>
                    <p className="confirm-message">{confirmModal.message}</p>
                    <div className="confirm-btns">
                        <button className="confirm-no-btn" onClick={closeConfirm}>No, Go Back</button>
                        <button className="confirm-yes-btn" onClick={() => { confirmModal.onConfirm(); closeConfirm(); }}>Yes, Confirm</button>
                    </div>
                </div>
            )}
        </div>
    );
}