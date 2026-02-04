import "./app.css";
import titleNameimg from "./images/title-name.png";
import facilityimg from "./images/facility-img.png";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function App() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(()=>{
    if(userId){
      navigate("/home");
    }
  },[]);

  return (
    <div className="opening-outer-div">
      <div className="opening-hero-div">
        <div className="opening-top-bar">
          <div className="title-name-div">
            <p className="title-up-name">COLLEGE
              <span className="title-down-name">CART</span>
            </p>
          </div>
          <div className="left-top-div">
            <button className="get-sarted-btn-top"
              onClick={()=>{
                navigate("/login");
              }}
            >Get Started</button>
            <p>Docs</p>
          </div>
        </div>
        <div className="opening-hero-content-div">
          <div className="opening-hero-text-div">
            <p className="opening-hero-heading">
              Simplify Your College <span>Shopping🛒</span> Experience
            </p>
            <p className="opening-hero-para">
              Discover the ultimate platform for college students to find,
              compare, and purchase textbooks, supplies, and dorm essentials
              all in one place.
            </p>
            <button className="get-started-btn-down"
              onClick={()=>{
                navigate("/login");
              }}
            >Get Started</button>
          </div>
        </div>
      </div>
      <div className="div-2">
        <h1 className="facility-heading">FACILITIES</h1>
        <div className="facility-main-div">
          <div>
          <div className="color-1"></div>
        <div className="color-2"></div>
        <div className="color-3"></div>
        <div className="circle-2-container">
        <div className="circle-2-bg"></div>
        <img src={facilityimg} className="circle-2-img"></img>
        </div>
        </div>
        <div className="facilities-content-div">
          <p>➤🏫 College Item Exchange Service</p>
          <p>➤🛍️ Forgot something? We’ve got you covered</p>
          <p>➤🚶‍♂️ Someone’s going out? Get your stuff too!</p>
          <p>➤Request items from outside the campus and get them delivered by students who are already heading out.</p>
        </div>
        </div>
      </div>
    </div>
  );
}