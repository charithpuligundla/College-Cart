import "./Home.css"
import { useEffect, useState } from "react";
import profileImg from "./images/cart-logo.png"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CountdownTimer from "./Timer";

export default function Home() {
    const [requestdata, setrequestdata] = useState([]);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const [showpreview, setshowpreview] = useState(false);
    const [previndex, setprevindex] = useState(0);
    const [showrightdiv, setshowrightdiv] = useState(false);
    const [showEditblur, setshowEditblur] = useState(false);
    const [user, setuser] = useState(null);
    const [outpeople, setoutpeople] = useState([]);
    const [ownreq, setownreq] = useState(false);


    useEffect(() => {
        axios.get("http://localhost:5000/getrequests")
            .then(res => {
                console.log(res);
                setrequestdata(res.data);
            })
            .catch(error => {
                alert(error.response.data.message);
            });
    }, []);

    useEffect(() => {
        axios.post("http://localhost:5000/getuser", { profileId: userId })
            .then(res => {
                console.log(res);
                setuser(res.data.user);
            })
            .catch(err => {
                console.log(err);
            })
    }, []);

    useEffect(() => {
        axios.get("http://localhost:5000/getoutpeople")
            .then(res => {
                console.log(res);
                setoutpeople(res.data);
            })
            .catch(err => {
                console.log(err);
            })
    }, [])

    function getrequests() {
        document.querySelector(".explr-req").style.backgroundColor = "rgb(195, 244, 255)";
        document.querySelector(".see-out").style.backgroundColor = "white";
        document.querySelector(".request-section").style.display = "block";
        document.querySelector(".out-people-section").style.display = "none";
    }

    function getpeople() {
        document.querySelector(".explr-req").style.backgroundColor = "white";
        document.querySelector(".see-out").style.backgroundColor = "rgb(195, 244, 255)";
        document.querySelector(".request-section").style.display = "none";
        document.querySelector(".out-people-section").style.display = "block";
    }

    async function changepersonstatus() {
        await axios.post("http://localhost:5000/changestatus", { userId })
            .then(res => {
                console.log(res);
                setuser(res.data);
            })
            .catch(err => {
                console.log(err)
            });
        await axios.get("http://localhost:5000/getoutpeople")
            .then(res => {
                console.log(res);
                setoutpeople(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    }

    return (
        <div>
            {
                user?.isVerified?
                <div className="home-outer-div">
            <div className="home-top-bar">
                <div className="title-name-div">
                    <p className="title-up-name">COLLEGE
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
                        onClick={() => {
                            navigate("/myrequests");
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
                    onClick={() => {
                        navigate("/myrequests");
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
            ></div>
            <div className="top-buttons">
                <button className="explr-req"
                    style={
                        {
                            backgroundColor: "rgb(195, 244, 255)",
                        }
                    }
                    onClick={() => {
                        getrequests();
                    }}
                >Explore Requests</button>
                <button className="see-out"
                    onClick={() => {
                        getpeople();
                    }}
                >See who are out</button>
            </div>
            <div className="request-section">
                <div className="home-req-top">
                    <p className="requests-head-p">Requests:-</p>
                    <button onClick={() => {
                        navigate("/addrequest");
                    }}>⊕Add Request</button>
                </div>
                <div className="homerequest-cards-div">
                    {
                        requestdata.map((data, index) => {
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
                                    className={issame ? "home-request-card own" : "home-request-card"}
                                    onClick={() => {
                                        setprevindex(index);
                                        setshowpreview(true);
                                        setshowEditblur(true);
                                        setownreq(issame);
                                    }}
                                >
                                    <p>UserName : <span>{data.userId.userName}</span></p>
                                    <div className="req-nums-div">
                                        <p>No of Items: <span>{data.requested.length}</span></p>
                                        <p>Total Price : <span>{data.totalAmount}</span></p>
                                        <p>Delivery Fee : <span>{deliveryfee}</span></p>
                                    </div>
                                    <p>Description : <span>{data.description}</span></p>
                                    <p>Requested At : <span>{formatted}</span></p>
                                    <p>Address : <span>{data.address}</span></p>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            <div className="out-people-section">
                <div className="home-people-top">
                    <p className="people-head-p">Out People :-</p>
                    <button
                        onClick={() => {
                            changepersonstatus();
                        }}
                        style={{
                            backgroundColor: user?.status === "in"
                                ? "rgb(51, 255, 0)" : "rgb(0,0,0)",

                        }}
                    >{user?.status === "in" ? "I'm Out" : "I'm In"}</button>
                </div>
                <div className="out-peoples-div">
                    {outpeople.map((person, index) => {
                        const rollno = person.email.slice(0, 6);
                        return (
                            <div className="out-peoples-card" key={index}>
                                <p className="person-name">{person.userName}</p>
                                <p className="person-email">{person.email}</p>
                                <p className="person-roll">Roll No: {rollno}</p>
                                <p className="person-branch">Branch: {person.branch}</p>
                            </div>
                        );
                    })}
                </div>

            </div>

            {/* Request preview div */}
            <div className={showpreview ? "preview-div show" : "preview-div"}>
                <button className="close-prev-btn"
                    onClick={() => {
                        setshowpreview(false);
                        setprevindex(0);
                        setshowEditblur(false);
                    }}
                >x</button>
                {requestdata[previndex] &&
                    <div>
                        <p>UserName : <span>{requestdata[previndex].userId.userName}</span></p>
                        <div className="req-nums-div-prev">
                            <p>No of Items: <span>{requestdata[previndex].requested.length}</span></p>
                            <p>Total Price : <span>{requestdata[previndex].totalAmount}</span></p>

                        </div>
                        <p>Description : <span>{requestdata[previndex].description}</span></p>

                        <p>Adress : <span>{requestdata[previndex].address}</span></p>
                        <p>Items :-</p>
                        <div>
                            {
                                requestdata[previndex].requested.map((item, index) => {

                                    return (
                                        <div>
                                            <p>Item Name : <span>{item.itemName}</span></p>
                                            <p>Quantity : <span>{item.quantity}</span></p>
                                            <p>Price : <span>{item.price}</span></p>
                                            <p>Total Price : <span>{item.quantity * item.price}</span></p>
                                            <p>Description : <span>{item.description}</span></p>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        {
                            !ownreq &&
                            <div>
                                <p>You Get : <span>{requestdata[previndex].totalAmount <= 500 ? requestdata[previndex].totalAmount / 10 : 50}</span></p>
                                <button
                                    onClick={async () => {
                                        const res = await axios.post(
                                            `http://localhost:5000/accept-request/${requestdata[previndex]._id}`,
                                            { accepterId: userId, requesterId: requestdata[previndex].userId._id }
                                        );

                                        navigate(`/chat/${res.data.chatId}`);
                                    }}
                                >
                                    Accept Request
                                </button>
                            </div>
                        }
                    </div>
                }
            </div>
            {/* <CountdownTimer seconds={10}/> */}
        </div>:
        <div>
            {
                user?
                <div>
                    <p>Verify your account by clicking link sent to gmail... or sign in again</p>
                    <button 
                        onClick={()=>{
                            navigate("/login");
                        }}
                    >sign in</button>
                </div>
                :
                <div>
                    <p>Sign Up first and visit this page</p>
                    <button 
                        onClick={()=>{
                            navigate("/login");
                        }}
                    >sign in</button>
                </div>
            }
        </div>
            }
        </div>
    );
}