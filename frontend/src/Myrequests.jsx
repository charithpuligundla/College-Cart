import "./Myrequests.css"
import { useEffect, useState } from "react";
import profileImg from "./images/cart-logo.png"
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

export default function Myrequests() {
    const userId = localStorage.getItem("userId");
    const [Myrequest, setmyrequest] = useState([]);
    const [showrightdiv, setshowrightdiv] = useState(false);
    const [showEditblur, setshowEditblur] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        axios.post("http://localhost:5000/myrequests", { userId })
            .then(res => {
                console.log(res);
                setmyrequest(res.data);
            })
            .catch(err => {
                console.log(err);
            })
    }, [])

    return (
        <div className="home-outer-div">
            <div className="home-top-bar">
                <div className="title-name-div">
                    <p className="title-up-name"
                        onClick={()=>{
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
                        onClick={()=>{
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
                    onClick={()=>{
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
                        }
                        else {
                            deliveryfee = 50;
                        }
                        let issame;
                        if (userId === (data.userId ? data.userId._id : data.userId)) {
                            issame = true;
                        }
                        else {
                            issame = false;
                        }
                        return (
                            <div
                                className="myrequest-card"
                            >
                                <p>UserName : <span>{data.userId.userName}</span></p>
                                <div className="req-nums-div">
                                    <p>No of Items: <span>{data.requested.length}</span></p>
                                    <p>Total Price : <span>{data.totalAmount}</span></p>
                                    <p>Delivery Fee : <span>{deliveryfee}</span></p>
                                </div>
                                <p>Description : <span>{data.description}</span></p>
                                <p>Requested At : <span>{formatted}</span></p>
                                <p>Adress : <span>{data.address}</span></p>
                                <p className="status"
                                    style={{
                                        color:
                                            data.status==="accepted"
                                            ?"green"
                                            :data.status==="pending"
                                            ?"red"
                                            :data.status==="delivered"
                                            ?"rgba(17, 255, 0, 1)"
                                            :"grey",  
                                    }}
                                ><span
                                    style={{
                                        color:"grey"
                                    }}
                                >.</span>{data.status}</p>
                                <div className="req-card-btn-div">
                                    <button className="see-who-btn"
                                        onClick={()=>{
                                            navigate(`/profile/${data.acceptedBy}`);
                                        }}
                                        style={{
                                            display:data.status=="pending"
                                            ?"none"
                                            :""
                                        }}
                                    >see who</button>
                                    <button className="make-payment-btn"
                                        style={{
                                            display:data.status!=="accepted"
                                            ?"none"
                                            :""
                                        }}
                                    >make payment</button>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}