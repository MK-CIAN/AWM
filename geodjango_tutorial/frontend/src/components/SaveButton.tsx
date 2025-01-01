import React, { useState } from "react";
import Axios from "../services/Axios";

// SaveButtonProps interface
interface SaveButtonProps {
  eventId: number;
}

// SaveButton component
const SaveButton: React.FC<SaveButtonProps> = ({ eventId }) => {
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  // Handle save event
  const handleSaveEvent = async () => {
    try {
      const response = await Axios.post(`/events/${eventId}/save/`);
      setMessage(response.data.message);
      setSaved(true);
    } catch (error) {
      setMessage("Failed to save event.");
    }
  };

  return (
    <div>
      <button
        onClick={handleSaveEvent}
        disabled={saved}
        className="button"
      >
        {saved ? "Saved" : "Save Event"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SaveButton;
