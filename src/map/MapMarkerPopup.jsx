import StarRating from '../common/StarRating';
import { distanceToSLIIT, formatPrice } from '../utils/formatters';
import { getImageUrl, getPlaceholder } from '../utils/imageHelper';

const MapMarkerPopup = ({ listing, onViewDetails }) => {
  const distance = distanceToSLIIT(listing.location.lat, listing.location.lng);
  const lowestPrice = listing.roomTypes?.length
    ? Math.min(...listing.roomTypes.map((r) => r.pricePerMonth))
    : listing.pricing?.monthlyRent || listing.price;

  return (
    <div className="map-popup-card" style={{ minWidth: '250px', maxWidth: '300px' }}>
      <img src={getImageUrl(listing.images?.[0])} alt={listing.title}
        onError={(e) => { e.target.src = getPlaceholder(); }} />
      <div className="popup-body">
        <h3 className="popup-title">{listing.title}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span className="popup-price">{formatPrice(lowestPrice)}<span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>/mo</span></span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>📍 {distance}</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{listing.type}</span>
          {listing.genderPreference !== 'Any' && (
            <span style={{ background: '#fdf4ff', color: '#a855f7', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{listing.genderPreference}</span>
          )}
        </div>
        <StarRating rating={listing.rating || 0} reviewCount={listing.reviewCount} />
        {onViewDetails && (
          <button onClick={() => onViewDetails(listing)} style={{
            width: '100%', marginTop: '10px', padding: '8px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          }}>View Details →</button>
        )}
      </div>
    </div>
  );
};

export default MapMarkerPopup;