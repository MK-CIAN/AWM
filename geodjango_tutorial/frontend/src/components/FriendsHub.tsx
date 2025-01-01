import React, { useEffect, useState, useRef } from "react";
import Axios from "../services/Axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "../styles/FriendsHub.css";
import Navbar from "./Navbar";

// Interface for Friend Location
interface FriendLocation {
  username: string;
  location: {
    latitude: number;
    longitude: number;
  };
  last_updated: string;
}

interface EventProps {
  id: number;
  name: string;
  date: string;
  location: string;
  image_url: string;
  lat: number;
  lon: number;
}

// Marker Icons
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

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const yellowIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Routing Control Component Props
interface RoutingControlProps {
  userLocation: [number, number];
  friendLocation: [number, number];
  clearRoute?: () => void; // Make it optional
}

// Routing Control Component
const RoutingControl: React.FC<RoutingControlProps> = ({
  userLocation,
  friendLocation,
}) => {
  const map = useMap();
  const routingRef = useRef<ReturnType<typeof L.Routing.control> | null>(null);

  // Add Routing Control
  useEffect(() => {
    if (map && userLocation && friendLocation) {
      if (routingRef.current) {
        map.removeControl(routingRef.current);
      }

      routingRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userLocation[0], userLocation[1]),
          L.latLng(friendLocation[0], friendLocation[1]),
        ],
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: "#007bff", weight: 4 }],
        },
        createMarker: () => null,
        show: window.innerWidth >= 768,
      }).addTo(map);
    }

    return () => {
      if (routingRef.current) {
        map.removeControl(routingRef.current);
      }
    };
  }, [map, userLocation, friendLocation]);

  return null;
};

// Main Component
const FriendsHub: React.FC = () => {
  // State Variables
  const [friendLocations, setFriendLocations] = useState<FriendLocation[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [selectedFriendLocation, setSelectedFriendLocation] = useState<
    [number, number] | null
  >(null);
  const [showRoute, setShowRoute] = useState(false);
  const [savedEvents, setSavedEvents] = useState<EventProps[]>([]);

  // Fetch Friends' Locations
  const fetchFriendsLocations = async () => {
    try {
      const response = await Axios.get("/friends/locations/");
      setFriendLocations(response.data);
    } catch (error) {
      console.error("Failed to fetch friends' locations:", error);
    }
  };

  const fetchSavedEvents = async () => {
    try {
      const response = await Axios.get("/events/saved/");
      setSavedEvents(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch saved events:", error);
    }
  };

  // Fetch User's Own Location and updating the backend
  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(coords);

          // Send user location to the backend
          try {
            await Axios.post("update-location/", {
              latitude: coords[0],
              longitude: coords[1],
            });
            console.log("User location updated:", coords);
          } catch (error) {
            console.error("Error sending location to the backend:", error);
          }
        },
        (error) => {
          console.error("Error fetching user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Handle Route
  const handleRoute = (latitude: number, longitude: number) => {
    if (userLocation) {
      setSelectedFriendLocation([latitude, longitude]);
      setShowRoute(true);
    } else {
      alert("User location not available. Please enable location services.");
    }
  };

  // Clear Route
  const clearRoute = () => {
    setSelectedFriendLocation(null);
    setShowRoute(false);
  };

  useEffect(() => {
    fetchFriendsLocations();
    fetchUserLocation();
    fetchSavedEvents();
  }, []);

  const center = userLocation || [53.3498, -6.2603]; // Default to Dublin

  return (
    <div>
      <Navbar />
      <div className="friends-hub-container">
        <h1>Your Friends' Locations</h1>

        {/* Clear Route Button - Positioned Outside the Map */}
        {showRoute && (
          <div className="clear-route-container">
            <button onClick={clearRoute} className="clear-route-button">
              Clear Route
            </button>
          </div>
        )}

        <MapContainer
          center={center}
          zoom={10}
          className="friends-map"
          key={userLocation ? userLocation.toString() : "default"}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* User's Location Marker */}
          {userLocation && (
            <Marker position={userLocation} icon={redIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Friends' Locations */}
          {friendLocations.map((friend, index) => (
            <Marker
              key={index}
              position={[friend.location.latitude, friend.location.longitude]}
              icon={greenIcon}
            >
              <Popup>
                <strong>{friend.username}</strong> <br />
                Last Updated: {new Date(friend.last_updated).toLocaleString()}
                <br />
                <button
                  onClick={() =>
                    handleRoute(
                      friend.location.latitude,
                      friend.location.longitude
                    )
                  }
                >
                  Get Route
                </button>
              </Popup>
            </Marker>
          ))}

          {savedEvents.map(
            (event, index) =>
              event.lat &&
              event.lon && (
                <Marker
                  key={`saved-${index}`}
                  position={[event.lat, event.lon]}
                  icon={yellowIcon}
                >
                  <Popup>
                    <strong>{event.name}</strong>
                    <br />
                    {new Date(event.date).toLocaleString()}
                  </Popup>
                </Marker>
              )
          )}

          {/* Show Routing if Friend is Selected */}
          {userLocation && selectedFriendLocation && showRoute && (
            <RoutingControl
              userLocation={userLocation}
              friendLocation={selectedFriendLocation}
              clearRoute={clearRoute}
            />
          )}
          
        </MapContainer>
      </div>
    </div>
  );
};

export default FriendsHub;
