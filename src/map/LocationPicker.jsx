import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SLIIT_COORDINATES } from '../utils/constants';
import { reverseGeocode, searchLocation } from '../services/accommodation/mapService';
import DistanceCalculator from './DistanceCalculator';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const selectedIcon = new L.DivIcon({
  className: 'custom-marker-icon',
  html: `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#598392,#354e57);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(89,131,146,0.5);border:3px solid white;font-size:18px;">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const sliitSmallIcon = new L.DivIcon({
  className: 'custom-marker-icon',
  html: `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#991b1b);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(220,38,38,0.4);border:2px solid white;font-size:16px;">🎓</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);
      onLocationSelect({ lat, lng, address });
    },
  });
  return null;
};

const FlyTo = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16, { duration: 1.5 });
  }, [position, map]);
  return null;
};

const LocationPicker = ({ onLocationChange, initialLocation }) => {
  const [position, setPosition] = useState(
    initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null
  );
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [flyTo, setFlyTo] = useState(null);

  const handleLocationSelect = useCallback(
    ({ lat, lng, address: addr }) => {
      setPosition({ lat, lng });
      setAddress(addr);
      onLocationChange({ lat, lng, address: addr });
    },
    [onLocationChange]
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchLocation(searchQuery + ', Sri Lanka');
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition({ lat, lng });
    setAddress(result.display_name);
    setFlyTo([lat, lng]);
    setSearchResults([]);
    setSearchQuery('');
    onLocationChange({ lat, lng, address: result.display_name });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10"
            />
          </div>
          <button onClick={handleSearch} disabled={isSearching} className="btn-primary whitespace-nowrap">
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => handleResultClick(result)}
                className="w-full text-left px-4 py-3 hover:bg-primary-50 border-b border-gray-50 last:border-0 flex items-start gap-3"
              >
                <span className="text-primary-500 mt-0.5">📍</span>
                <span className="text-sm text-gray-700 line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info Tip */}
      <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200">
        <span className="text-amber-500 text-lg">💡</span>
        <p className="text-sm text-amber-700 font-medium">Click on the map to pin your property location</p>
      </div>

      {/* Map */}
      <div className="map-container-picker rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100">
        <MapContainer
          center={[SLIIT_COORDINATES.lat, SLIIT_COORDINATES.lng]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {flyTo && <FlyTo position={flyTo} />}

          {/* SLIIT Marker */}
          <Marker position={[SLIIT_COORDINATES.lat, SLIIT_COORDINATES.lng]} icon={sliitSmallIcon} />

          {/* Selected Location Marker */}
          {position && <Marker position={[position.lat, position.lng]} icon={selectedIcon} />}
        </MapContainer>
      </div>

      {/* Selected Address Display */}
      {address && (
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">📍 {address}</p>
      )}

      {/* Distance to SLIIT */}
      {position && <DistanceCalculator lat={position.lat} lng={position.lng} />}
    </div>
  );
};

export default LocationPicker;