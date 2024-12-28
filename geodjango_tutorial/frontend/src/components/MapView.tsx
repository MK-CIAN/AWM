import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import Axios from "../services/Axios"; // Import Axios instance
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "../styles/MapView.css";
import { useNavigate } from "react-router-dom";
import ClosestEvents from "./ClosestEvents";

// Custom marker icon for React-Leaflet
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

interface EventPoint {
  id: number;
  name: string;
  description: string;
  lat: number;
  lon: number;
  location: string;
  date: string;
  category: string;
  external_link: string;
  image_url: string;
}

// Grouping function to aggregate events by name
const groupEventsByName = (events: EventPoint[]) => {
  const grouped: { [key: string]: EventPoint & { dates: string[] } } = {};

  events.forEach((event) => {
    const key = `${event.name}-${event.lat}-${event.lon}`;

    if (!grouped[key]) {
      grouped[key] = { ...event, dates: [event.date] };
    } else {
      grouped[key].dates.push(event.date);
    }
  });

  return Object.values(grouped);
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};


const MapView: React.FC = () => {
  const [events, setEvents] = useState<EventPoint[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();

  const mapRef = useRef<L.Map | null>(null);

  const fetchEvents = async (category: string) => {
    try {
      const encodedCategory = encodeURIComponent(category); // Encode the category
      const response = await Axios.get<EventPoint[]>(
        `events/?category=${encodedCategory}`
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Update user location
  const updateUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
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
        } catch (error) {
          console.error("Error updating location:", error);
        }
      });
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await Axios.post("logout/"); // Call backend logout endpoint
      localStorage.removeItem("token"); // Remove token from localStorage
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    fetchEvents(selectedCategory);
    updateUserLocation();
  }, [selectedCategory]);

  const groupedEvents = groupEventsByName(events);

  // Store map instance
  const handleMapLoad = (map: L.Map) => {
    mapRef.current = map;
  };

  const handleMarkerClick = (marker: L.Marker) => {
    const popupLatLng = marker.getLatLng();
    if (mapRef.current && popupLatLng) {
      const currentZoom = mapRef.current.getZoom();
      const offsetLat = popupLatLng.lat - (currentZoom > 14 ? 0.002 : 0.005); // Offset to shift down
      const offsetLatLng = L.latLng(offsetLat, popupLatLng.lng);
      
      mapRef.current.flyTo(offsetLatLng, Math.max(currentZoom, 14), {
        animate: true,
        duration: 1,
      });

      // Open the popup
      marker.openPopup();
    }
  };


  return (
    <div>
      <div className="header">
        <h2>Event Hub</h2>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="category-filter">
        <CategoryFilter setSelectedCategory={setSelectedCategory} />
      </div>

      <div className="map-and-events">
        {/* Closest Events Section */}
        <ClosestEvents userLocation={userLocation} />

        <div className="map-container">
            <MapContainer
              center={[53.3498, -6.2603]}
              zoom={10}
              className="map"
              whenReady={() => handleMapLoad(mapRef.current!)}
            >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MarkerClusterGroup>
              {groupedEvents.map((event) => (
                <Marker
                  key={event.id}
                  position={[event.lat, event.lon]}
                  icon={redIcon}
                  eventHandlers={{
                    click: (e) => handleMarkerClick(e.target),
                  }}
                >
                  <Popup>
                    <strong>{event.name}</strong>
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.name}
                        style={{
                          width: "100%",
                          maxHeight: "150px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <p>No Image Available</p>
                    )}
                    <p>{event.description}</p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {event.location || "Location not available"}
                    </p>
                    <p><strong>Show Dates:</strong></p>
                    <div className="popup-scroll">
                      <ul>
                        {event.dates.map((date) => (
                          <li key={date}>{formatDate(date)}</li>
                        ))}
                      </ul>
                    </div>
                    <p>
                      <a
                        href={event.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        More Info
                      </a>
                    </p>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>

            {userLocation && (
              <>
                <Marker position={userLocation} icon={redIcon}>
                  <Popup>Your Location</Popup>
                </Marker>
                <Circle center={userLocation} radius={500} />
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

interface CategoryFilterProps {
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  setSelectedCategory,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <form>
      <label>Filter by Category:</label>
      <select onChange={handleChange}>
        <option value="all">All Categories</option>
        <option value="Music">Music</option>
        <option value="Arts & Theatre">Arts & Theatre</option>
        <option value="Sports">Sports</option>
      </select>
    </form>
  );
};

export default MapView;
