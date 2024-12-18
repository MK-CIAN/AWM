import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import Axios from "../services/Axios"; // Import Axios instance
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "../styles/MapView.css";
import { useNavigate } from "react-router-dom";

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

// Types for data
interface AudiotourPoint {
  id: number;
  name: string;
  description: string;
  lat: number;
  lon: number;
}

const MapView: React.FC = () => {
  const [audiotourPoints, setAudiotourPoints] = useState<AudiotourPoint[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();

  // Fetch audiotour points from API
  const fetchAudiotourPoints = async (category: string) => {
    try {
      const response = await Axios.get<AudiotourPoint[]>(
        `audiotour-points/?category=${category}`
      );
      setAudiotourPoints(response.data);
    } catch (error) {
      console.error("Error fetching audiotour points:", error);
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
      await Axios.post('logout/'); // Call backend logout endpoint
      localStorage.removeItem('token'); // Remove token from localStorage
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    fetchAudiotourPoints(selectedCategory);
    updateUserLocation(); // Update location once when the component mounts
  }, [selectedCategory]);

  return (
    <div>
      <div className="header">
        <h2>Event Hub</h2>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <CategoryFilter setSelectedCategory={setSelectedCategory} />

      {/* Centered and styled map */}
      <div className="map-container">
        <MapContainer center={[0, 0]} zoom={2} className="map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <MarkerClusterGroup>
            {audiotourPoints.map((point) => (
              <Marker
                key={point.id}
                position={[point.lat, point.lon]}
                icon={redIcon}
              >
                <Popup>
                  <strong>{point.name}</strong>
                  <p>{point.description}</p>
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
        <option value="art">Art</option>
        <option value="history">History</option>
        <option value="tourist">Tourist Attractions</option>
        <option value="nature">Nature</option>
        <option value="education">Education</option>
      </select>
    </form>
  );
};

export default MapView;
