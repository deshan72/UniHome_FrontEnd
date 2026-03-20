import { Link } from 'react-router-dom';
import StarRating from '../../common/StarRating';
import { formatPrice, distanceToSLIIT } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import { getImageUrl, getPlaceholder } from '../../utils/imageHelper';

const AccommodationCard = ({ listing, showStatus = false }) => {
  const distance = distanceToSLIIT(listing.location.lat, listing.location.lng);
  const lowestPrice = listing.roomTypes?.length
    ? Math.min(...listing.roomTypes.map((r) => r.pricePerMonth))
    : listing.pricing?.monthlyRent || listing.price;

  const coverImage = getImageUrl(listing.images?.[0]);

  return (
    <Link to={'/listing/' + listing._id} className="card overflow-hidden block group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = getPlaceholder(); }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="badge bg-primary-100 text-primary-700">{listing.type}</span>
          {listing.genderPreference !== 'Any' && (
            <span className="badge bg-purple-100 text-purple-700">{listing.genderPreference}</span>
          )}
        </div>
        {showStatus && (
          <span className={'absolute top-3 right-3 badge ' + (STATUS_COLORS[listing.status] || 'bg-gray-100 text-gray-600')}>
            {listing.status}
          </span>
        )}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm">
          📍 {distance} to SLIIT
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {listing.title}
        </h3>
        <p className="text-gray-500 text-sm mb-3 flex items-center gap-1 line-clamp-1">
          📍 {listing.location.address}
        </p>

        {listing.roomTypes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {listing.roomTypes.slice(0, 3).map((room) => (
              <span key={room._id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                {room.type} - {formatPrice(room.pricePerMonth)}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {listing.amenities?.slice(0, 4).map((a) => (
            <span key={a} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">{a}</span>
          ))}
          {listing.amenities?.length > 4 && (
            <span className="text-xs text-gray-400">+{listing.amenities.length - 4}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xl font-extrabold text-primary-600">{formatPrice(lowestPrice)}</span>
            <span className="text-gray-400 text-xs">/mo</span>
          </div>
          <StarRating rating={listing.rating || 0} reviewCount={listing.reviewCount} />
        </div>
      </div>
    </Link>
  );
};

export default AccommodationCard;