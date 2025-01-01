import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../services/Axios";
import "../styles/Navbar.css";
import FriendRequestNotification from "./FriendRequestNotification";

// Navbar component
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    try {
      await Axios.post("logout/");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="header">
      <h2 onClick={() => navigate("/map")} className="navbar-logo">
        EventHub
      </h2>

      <button className="hamburger" onClick={toggleMenu}>
        ☰
      </button>

      <div className={`navbar-actions ${menuOpen ? "active" : ""}`}>
        <FriendRequestNotification />
        <button onClick={() => navigate("/map")} className="nav-button">
          Home
        </button>
        <button
          onClick={() => navigate("/saved-events")}
          className="nav-button"
        >
          Saved Events
        </button>
        <button onClick={() => navigate("/friends-hub")} className="nav-button">
          Friends Hub
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
