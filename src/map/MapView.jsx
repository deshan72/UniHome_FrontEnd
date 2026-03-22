import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SLIIT_COORDINATES } from '../utils/constants';
import MapMarkerPopup from './MapMarkerPopup';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const sliitIcon = new L.DivIcon({
  className: 'custom-marker-icon',
  html: `<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#991b1b);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(220,38,38,0.5);border:3px solid white;font-size:20px;">🎓</div>`,
  iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -22],
});

const createListingIcon = (price, isSelected = false) => {
  const bg = isSelected ? 'linear-gradient(135deg,#598392,#354e57)' : 'linear-gradient(135deg,#124559,#071c24)';
  return new L.DivIcon({
    className: 'custom-marker-icon',
    html: `<div style="min-width:70px;padding:4px 10px;background:${bg};color:white;font-weight:800;font-size:11px;border-radius:20px;text-align:center;box-shadow:0 4px 12px rgba(1,22,30,0.3);border:2px solid white;white-space:nowrap;">LKR ${(price / 1000).toFixed(0)}K</div>`,
    iconSize: [80, 30], iconAnchor: [40, 15], popupAnchor: [0, -20],
  });
};

const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => { if (bounds) map.fitBounds(bounds, { padding: [50, 50] }); }, [bounds, map]);
  return null;
};

const MapView = ({ listings, selectedListing, onSelectListing, onViewDetails, bounds, className = 'map-container-search' }) => {
  return (
    <div className={`${className} rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100`}>
      <MapContainer center={[SLIIT_COORDINATES.lat, SLIIT_COORDINATES.lng]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {bounds && <FitBounds bounds={bounds} />}

        <Marker position={[SLIIT_COORDINATES.lat, SLIIT_COORDINATES.lng]} icon={sliitIcon}>
          <Popup><div style={{ textAlign: 'center', padding: '8px' }}><h3 style={{ fontWeight: 800, fontSize: '15px', color: '#dc2626' }}>🎓 SLIIT Malabe</h3><p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{SLIIT_COORDINATES.address}</p></div></Popup>
        </Marker>

        {listings.map((listing) => {
          const lowestPrice = listing.roomTypes?.length
            ? Math.min(...listing.roomTypes.map((r) => r.pricePerMonth))
            : listing.price || 0;
          return (
            <Marker key={listing._id} position={[listing.location.lat, listing.location.lng]}
              icon={createListingIcon(lowestPrice, selectedListing?._id === listing._id)}
              eventHandlers={{ click: () => onSelectListing?.(listing) }}>
              <Popup maxWidth={320}><MapMarkerPopup listing={listing} onViewDetails={onViewDetails} /></Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;