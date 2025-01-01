import React, { useState } from "react";
import Axios from "../services/Axios";

// FriendRequestButtonProps interface
interface FriendRequestButtonProps {
  toUserId: number;
}

// FriendRequestButton component
const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({
  toUserId,
}) => {
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState("");

  // Send friend request function
  const sendFriendRequest = async () => {
    try {
      await Axios.post(`/friends/request/`, {
        to_user_id: toUserId,
      });
      setRequestSent(true);
    } catch (err: any) {
      // Check for error response from the server
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); // Set specific error message
      } else {
        setError("Failed to send request. Try again later."); // Fallback error message
      }
    }

    console.log("Friend request endpoint hit");
  };

  return (
    <div>
      <button
        className="friend-request-button"
        onClick={sendFriendRequest}
        disabled={requestSent}
      >
        {requestSent ? "Request Sent" : "Add Friend"}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default FriendRequestButton;
