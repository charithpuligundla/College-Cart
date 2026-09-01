import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [isVerified, setIsVerified] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const backenduri = import.meta.env.VITE_BACKENDURI;

  useEffect(() => {
    if (userId && token) {
      axios.post(
        `${backenduri}/getuser`,
        { profileId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then((res) => {
          setIsVerified(res.data.user.isVerified);
          setLoading(false);
        })
        .catch((err) => {
          if (err.response && (err.response.status === 401 || err.response.status === 404)) {
            // Token expired or invalid
            localStorage.removeItem("userId");
            localStorage.removeItem("token");
            setIsVerified(null);
          } else {
            // General error or not verified scenario from some reason, default to unverified UI or handle appropriately
            setIsVerified(false);
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId, token, backenduri]);

  if (loading) {
    return (
      <div className="protected-loader-container">
        <div className="protected-spinner"></div>
        <div className="protected-loading-text">Authenticating...</div>
      </div>
    );
  }

  if (!localStorage.getItem("userId") || !localStorage.getItem("token")) {
    return (
      <div className="protected-route-container">
        <div className="protected-content-card">
          <div className="protected-icon">🔒</div>
          <h2 className="protected-title">Access Denied</h2>
          <p className="protected-message">
            You need to be signed in to access this page. Join the community to explore and request items!
          </p>
          <button className="protected-action-btn" onClick={() => navigate("/login")}>
            Sign In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  if (isVerified === false) {
    return (
      <div className="protected-route-container">
        <div className="protected-content-card">
          <div className="protected-icon">✉️</div>
          <h2 className="protected-title">Verify Your Email</h2>
          <p className="protected-message">
            We sent a verification link to your college email. Please verify your account to unlock full access.
          </p>
          <button className="protected-action-btn" onClick={() => navigate("/login")}>
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;