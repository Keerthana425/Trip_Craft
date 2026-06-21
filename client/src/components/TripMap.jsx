import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Resolve Leaflet marker icons utilizing unpkg CDNs to avoid bundler bugs
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Helper component to center map on coordinates update
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
}

const TripMap = ({ destination, activities = [] }) => {
  const [center, setCenter] = useState([35.6762, 139.6503]); // Default to Tokyo
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch coordinates for destination and place mock markers around it
  useEffect(() => {
    const geocode = async () => {
      if (!destination) return;
      setLoading(true);
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: { q: destination, format: 'json', limit: 1 },
          headers: { 'User-Agent': 'TripCraftAI-Agent' }
        });
        if (response.data && response.data.length > 0) {
          const lat = parseFloat(response.data[0].lat);
          const lon = parseFloat(response.data[0].lon);
          const newCenter = [lat, lon];
          setCenter(newCenter);

          // Generate some mock points around the center for activities
          const points = [
            { name: 'Hotel / Basecamp', offset: [0.005, -0.012], type: 'hotel', icon: 'hotel' },
            { name: 'Sight Attraction A', offset: [-0.015, 0.015], type: 'attraction', icon: 'photo_camera' },
            { name: 'Sight Attraction B', offset: [0.012, 0.008], type: 'attraction', icon: 'photo_camera' },
            { name: 'Recommended Dinings', offset: [-0.008, -0.005], type: 'restaurant', icon: 'restaurant' }
          ];

          const generatedMarkers = points.map((p, idx) => ({
            id: idx,
            name: p.name,
            position: [lat + p.offset[0], lon + p.offset[1]],
            type: p.type,
            icon: p.icon
          }));
          setMarkers(generatedMarkers);
        }
      } catch (err) {
        console.error('Map geocoding failed:', err);
      } finally {
        setLoading(false);
      }
    };

    geocode();
  }, [destination]);

  return (
    <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-outline-variant/20 shadow-inner">
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-xs z-[1000] flex items-center justify-center text-label-sm font-label-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            GEO-LOCATING DESTINATION...
          </div>
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark theme tile layer
        />
        {markers.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={defaultIcon}
          >
            <Popup>
              <div className="text-left font-body-md min-w-[120px] text-on-surface">
                <div className="font-bold text-[13px]">{marker.name}</div>
                <div className="text-[10px] text-on-surface-variant capitalize mt-0.5 opacity-80">{marker.type}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TripMap;
