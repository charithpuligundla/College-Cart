import "./Profile.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import profileImg from "./images/cart-logo.png"
import { useNavigate } from "react-router-dom";

export default function Profile(){
    const { profileId } = useParams();
    const [user,setuser]=useState(null);
    const userId = localStorage.getItem("userId");
    const [showrightdiv, setshowrightdiv] = useState(false);
    const [showEditblur, setshowEditblur] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        axios.post("http://localhost:5000/getuser",{profileId})
        .then(res=>{
            console.log(res);
            setuser(res.data.user);
        })
        .catch(err=>{
            console.log(err);
        })
    },[])

    return(
        <div className="profile-outer-div">
             <div className="home-top-bar">
                            <div className="title-name-div"
                                onClick={() => {
                                    navigate("/home");
                                }}
                            >
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
        <div className="profile-main-div">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.userName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="profile-name">{user?.userName}</h2>
          <p className="profile-email">{user?.email}</p>
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-item">
          <span>Degree</span>
          <p>{user?.degree}</p>
        </div>
        <div className="detail-item">
          <span>Branch</span>
          <p>{user?.branch}</p>
        </div>
        <div className="detail-item">
          <span>Year</span>
          <p>{user?.year}</p>
        </div>
        <div className="detail-item">
          <span>Status</span>
          <p className={`status ${user?.status?.toLowerCase()}`}>
            {user?.status}
          </p>
        </div>
        <div className="detail-item">
          <span>Roll NO</span>
          <p>{user?.email?.slice(0, 6)}</p>
        </div>
      </div>
      <div className="stats-container">
  <div className="stat-card">
    <h3>Requested</h3>
    <p>{user?.no_requests}</p>
  </div>

  <div className="stat-card">
    <h3>Accepted</h3>
    <p>2</p>
  </div>
</div>
    </div>
        </div>
    );
}