import React, { useEffect, useState } from "react";
import Axios from "../services/Axios";
import "../styles/SavedEvents.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

// EventProps interface
interface EventProps {
  id: number;
  name: string;
  date: string;
  location: string;
  image_url: string;
  lat: number;
  lon: number;
}

// SavedEvents component
const SavedEvents: React.FC = () => {
  const [savedEvents, setSavedEvents] = useState<EventProps[]>([]);
  const navigate = useNavigate();

  // Fetch saved events from the backend
  useEffect(() => {
    const fetchSavedEvents = async () => {
      try {
        const response = await Axios.get("/events/saved/");
        setSavedEvents(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Failed to fetch saved events:", error);
      }
    };

    fetchSavedEvents();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="saved-events-page-container">
        <h1>Saved Events</h1>
        <div className="saved-events-list">
          {savedEvents.length > 0 ? (
            savedEvents.map((event) => (
              <div
                key={event.id}
                className="saved-event-card"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <img
                  src={event.image_url}
                  alt={event.name}
                  className="saved-event-card-image"
                />
                <div className="saved-event-info">
                  <h3>{event.name}</h3>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No saved events yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedEvents;
