import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Axios from "../services/Axios";
import "../styles/EventDetail.css";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import Navbar from "./Navbar";
import SaveButton from "./SaveButton";
import FriendRequestButton from "./FriendRequestButton";

// Event Interface
interface EventDetailsProps {
  id: number;
  name: string;
  description: string;
  lat: number;
  lon: number;
  location: string;
  date: string;
  image_url: string;
  external_link: string;
}

// Chat Message Interface
interface ChatMessage {
  user_id: number;
  user: string;
  content: string;
  timestamp: string;
}

// Red Marker Icon
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Blue Marker Icon
const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map Initializer Component
const MapInitializer: React.FC<{
  setMap: (map: L.Map) => void;
  userLocation: [number, number] | null;
  event: EventDetailsProps | null;
}> = ({ setMap, userLocation, event }) => {
  const map = useMap();

  useEffect(() => {
    setMap(map);

    if (map && userLocation && event) {
      // Clearing previous routing to avoid duplication problem
      map.eachLayer((layer) => {
        if (layer instanceof L.Routing.control) {
          map.removeLayer(layer);
        }
      });

      // Add User Marker (Red)
      L.marker(userLocation, { icon: redIcon })
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

      // Add Event Location Marker (Blue)
      L.marker([event.lat, event.lon], { icon: blueIcon })
        .addTo(map)
        .bindPopup(event.name);

      // Initialize Routing Control
      if (
        userLocation &&
        event &&
        typeof userLocation[0] === "number" &&
        typeof userLocation[1] === "number" &&
        typeof event.lat === "number" &&
        typeof event.lon === "number"
      ) {
        L.Routing.control({
          waypoints: [userLocation, [event.lat, event.lon]],
          routeWhileDragging: true,
          createMarker: (i: number) => {
            if (i === 0) {
              return L.marker(userLocation, { icon: redIcon }).bindPopup(
                "You are here"
              );
            } else if (i === 1) {
              return L.marker([event.lat, event.lon], {
                icon: blueIcon,
              }).bindPopup(event.name);
            }
            return null; // Avoid creating extra markers
          },
          lineOptions: {
            styles: [{ color: "#6FA1EC", weight: 4 }],
          },
        }).addTo(map);
      } else {
        console.warn(
          "Invalid userLocation or event coordinates. Routing not initialized."
        );
      }
    }
  }, [map, userLocation, event, setMap]);

  return null;
};

// Event Details Component
const EventDetails: React.FC = () => {
  //State variables
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventDetailsProps | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [, setMap] = useState<L.Map | null>(null);

  // Fetch Event Details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await Axios.get(`/events/${eventId}/`);
        setEvent(response.data);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
      }
    };

    // Fetch event details if eventId is available
    if (eventId) {
      fetchEvent();
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      });
    }
  }, [eventId]);

  // Fetch Chat Messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await Axios.get(`/chatroom/${eventId}/messages/`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
      }
    };

    if (eventId) {
      // Fetch immediately on component load
      fetchMessages();

      // Fetching every 20 seconds
      const interval = setInterval(() => {
        fetchMessages();
      }, 20000);

      // Clear interval on component unmount
      return () => clearInterval(interval);
    }
  }, [eventId]);

  // Auto-scrolling to the bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handiling sending new messages
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      const response = await Axios.post(`/chatroom/${eventId}/send/`, {
        content: newMessage,
      });

      // Appending new message to the chat
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!event) {
    return <div>Loading event details...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="event-details-container">
        <div className="event-card">
          {/* Event Image */}
          <img src={event.image_url} alt={event.name} className="event-image" />

          {/* Event Info */}
          <div className="event-details">
            <h1>{event.name}</h1>
            <SaveButton eventId={event.id} />
            <p>
              <strong>Location:</strong> {event.location}
            </p>
            <p>
              <strong>Date:</strong> {new Date(event.date).toLocaleString()}
            </p>
            <p>
              <a
                href={event.external_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Event Link
              </a>
            </p>
          </div>

          {/* Map Section */}
          {event.lat && event.lon && (
            <MapContainer
              center={[event.lat, event.lon]}
              zoom={13}
              className="event-map"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <MapInitializer
                setMap={setMap}
                userLocation={userLocation}
                event={event}
              />
            </MapContainer>
          )}

          {/* Chat Section */}
          <div className="chat-box">
            <h3>Event Chat</h3>
            <div className="chat-messages">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div key={index} className="chat-message-container">
                    <div className="chat-message-content">
                      <p>
                        <strong>{msg.user}: </strong>
                        {msg.content}
                        <span className="timestamp">
                          {" "}
                          - {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </p>
                    </div>
                    <FriendRequestButton toUserId={msg.user_id} />
                  </div>
                ))
              ) : (
                <p>No messages yet.</p>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input">
              <textarea
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
