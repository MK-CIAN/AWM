import React, { useEffect, useState, useRef } from "react";
import Axios from "../services/Axios";
import { FaBell } from "react-icons/fa";
import "../styles/FriendRequestNotification.css";

// Friend Request Interface
interface FriendRequest {
  id: number;
  from_user: string;
  from_user_id: number;
  timestamp: string;
}

// FriendRequestNotification Component
const FriendRequestNotification: React.FC = () => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetching pending friend requests
  const fetchPendingRequests = async () => {
    try {
      const response = await Axios.get("/friends/pending/");
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch friend requests:", error);
    }
  };

  // Accepting or deny friend requests
  const respondToRequest = async (requestId: number, action: string) => {
    try {
      await Axios.post("/friends/respond/", {
        request_id: requestId,
        action: action,
      });

      // Removing accepted or denied request from the list
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (error) {
      console.error("Failed to respond to friend request:", error);
    }
  };

  // Closing dropdown if clicked outside
  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  // Event listener for closing dropdown
  useEffect(() => {
    fetchPendingRequests();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`friend-request-dropdown ${showDropdown ? "show" : ""}`}
    >
      <div onClick={() => setShowDropdown(!showDropdown)} className="bell-icon">
        <FaBell />
        {requests.length > 0 && (
          <span className="notification-count">{requests.length}</span>
        )}
      </div>

      {showDropdown && (
        <div className="dropdown-menu">
          <h4>Friend Requests</h4>
          {requests.length > 0 ? (
            requests.map((req) => (
              <div key={req.id} className="request-item">
                <p>
                  <strong>{req.from_user}</strong> sent you a friend request
                </p>
                <div className="actions">
                  <button onClick={() => respondToRequest(req.id, "accept")}>
                    Accept
                  </button>
                  <button onClick={() => respondToRequest(req.id, "deny")}>
                    Deny
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No pending friend requests</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendRequestNotification;
