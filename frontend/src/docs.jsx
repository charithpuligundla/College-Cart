import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profileImg from "./images/cart-logo.png"; // Ensure this path matches your Home.jsx
import "./docs.css";

export default function DocsPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  
  // States for the responsive mobile sidebar
  const [showrightdiv, setshowrightdiv] = useState(false);
  const [showEditblur, setshowEditblur] = useState(false);

  const features = [
    {
      title: "Request Items",
      description:
        "Students can submit requests for any items they need within the college. Include item details, quantity and description about it",
      img: "",
    },
    {
      title: "Fulfill Requests",
      description:
        "Other students going outside can view available requests, accept them, deliver items, and earn delivery charges safely.",
      img: "",
    },
    {
      title: "Secure Transactions",
      description:
        "After succesfully completing your delivery pay directly to the delivery person to avoid any scams",
      img: "",
    },
    {
      title: "Track Requests",
      description:
        "Track the status of your requests in real-time. Get Email when a request is accepted, in progress, or completed.",
      img: "",
    },
    {
      title: "User-Friendly Dashboard",
      description:
        "Intuitive dashboard for requesters and deliverers. Manage requests, check accepts, and view history easily.",
      img: "",
    },
  ];

  const toggleSidebar = () => {
    setshowrightdiv((prev) => !prev);
    setshowEditblur((prev) => !prev);
  };

  return (
    <div className="docs-page-wrapper">
      {/* --- Unified Top Navigation Bar --- */}
      <div className="home-top-bar">
        <div className="title-name-div" onClick={() => navigate("/")} style={{cursor: 'pointer'}}>
          <p className="title-up-name">
            COLLEGE
            <span className="title-down-name">CART</span>
          </p>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="display-sidebar-top-btn out" onClick={toggleSidebar}>
          ☰
        </button>

        {/* Desktop Navigation */}
        <div className="right-top-div">
          <p onClick={() => navigate("/myrequests")}>Requested</p>
          <p onClick={() => navigate("/mydeliveries")}>Accepted</p>
          <p className="docs-p active-link" onClick={() => navigate("/docs")}
            style={{ backgroundColor: "rgba(0, 140, 255, 1)", color: "white", padding: "5px", borderRadius: "15px" }}
            >
            Docs
          </p>
          <img
            src={profileImg}
            className="profile-img"
            alt="Profile"
            onClick={() => navigate(`/profile/${userId}`)}
          />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={showrightdiv ? "sidebar show" : "sidebar"}>
        <button className="display-sidebar-top-btn in" onClick={toggleSidebar}>
          ☰
        </button>
        <p onClick={() => navigate("/myrequests")}>Requested</p>
        <p onClick={() => navigate("/mydeliveries")}>Accepted</p>
        <p className="docs-p" onClick={() => navigate("/docs")}
          style={{ backgroundColor: "rgba(0, 140, 255, 1)", color: "white", padding: "5px", borderRadius: "15px" }}
          >Docs</p>
        <img
          src={profileImg}
          className="profile-img"
          alt="Profile"
          onClick={() => navigate(`/profile/${userId}`)}
        />
      </div>

      {/* Overlay Blur for Sidebar */}
      <div className={showEditblur ? "blurscreens show" : "blurscreens"} onClick={toggleSidebar}></div>

      {/* --- Main Documentation Content --- */}
      <div className="docs-container">
        {/* Hero Section */}
        <section className="hero">
          <h1 className="hero-title">College Carrt Documentation</h1>
          <p className="hero-desc">
            Your complete guide to using College Carrt – request items, fulfill
            deliveries, and earn safely within your college.
          </p>
         
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div className="feature-card" key={idx}>
               
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-section">
          <h2>How It Works</h2>
          <div className="how-step">
            
            <div>
              <h3>Submit Request</h3>
              <p>
                Students can submit requests for any item they need. Include
                quantity, urgency, and delivery preferences. Requests appear for
                others to fulfill.
              </p>
            </div>
          </div>

          <div className="how-step reverse">
            
            <div>
              <h3>Accept & Deliver Requests</h3>
              <p>
                Students going outside can view available requests and accept
                them. Deliver items, mark complete, and earn delivery charges
                safely.
              </p>
            </div>
          </div>

          <div className="how-step">
            
            <div>
              <h3>Secure Payments</h3>
              <p>
                After succesfully completing your delivery pay directly to the delivery person to avoid any scams
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <details className="faq-card">
            <summary>How do I request an item?</summary>
            <p>
              Login, go to 'Add request', fill details, and submit. Track
              requests from your dashboard.
            </p>
          </details>

          <details className="faq-card">
            <summary>How do I earn delivery charges?</summary>
            <p>
              Accept requests and complete deliveries. you will get the delivery aharges directly from the requester
            </p>
          </details>

          <details className="faq-card">
            <summary>Is my information secure?</summary>
            <p>
              Yes! Authentication and database validation keep all data secure.
            </p>
          </details>
        </section>

        {/* Support Section */}
        <section className="support-section">
          <h2>Need More Help?</h2>
          <p>
            Contact our support team anytime at{" "}
            <a href="mailto:support.collegecart@gmail.com">
              support.collegecart@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}