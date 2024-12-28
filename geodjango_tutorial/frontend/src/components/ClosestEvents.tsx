import React, { useEffect, useState } from "react";
import Axios from "../services/Axios";
import "../styles/ClosestEvents.css";

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

interface ClosestEventsProps {
  userLocation: [number, number] | null;
}

const RADIUS_KM = 5;

const ClosestEvents: React.FC<ClosestEventsProps> = ({
  userLocation,
}) => {
  const [events, setEvents] = useState<EventPoint[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<
    (EventPoint & { dates: string[] })[]
  >([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await Axios.get<EventPoint[]>(`events/`);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // Haversine formula to calculate distance between two lat/lon points
  const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Group events by name and location to avoid duplicates
  const groupEvents = (events: EventPoint[]) => {
    const grouped: { [key: string]: EventPoint & { dates: string[] } } = {};

    events.forEach((event) => {
      const key = `${event.name}-${event.location}`;
      if (!grouped[key]) {
        grouped[key] = { ...event, dates: [event.date] };
      } else {
        grouped[key].dates.push(event.date);
      }
    });

    return Object.values(grouped);
  };

  // Filter events by radius and group them
  useEffect(() => {
    if (userLocation) {
      const [userLat, userLon] = userLocation;
      const nearbyEvents = events.filter((event) => {
        const distance = haversineDistance(
          userLat,
          userLon,
          event.lat,
          event.lon
        );
        return distance <= RADIUS_KM;
      });

      const groupedEvents = groupEvents(nearbyEvents);
      setFilteredEvents(groupedEvents);
    }
  }, [userLocation, events]);

  return (
    <div className="closest-events-list">
      <h3>Events Near You!</h3>
      <div className="scrollable-list">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div className="event-card" key={event.id}>
              {event.image_url && (
                <img src={event.image_url} alt={event.name} className="event-image" />
              )}
              <div className="event-details">
                <h4>{event.name}</h4>
                <p>{event.location}</p>
                <div className="event-dates-scroll">
                  <ul>
                    {event.dates.map((date) => (
                      <li key={date}>
                        {new Date(date).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={event.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="more-info"
                >
                  More Info
                </a>
              </div>
            </div>
          ))
        ) : (
          <p>No events found near you.</p>
        )}
      </div>
    </div>
  );
};

export default ClosestEvents;
