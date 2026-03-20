import { useState } from 'react';
import StarRating from '../common/StarRating';
import { formatPrice, distanceToSLIIT, distanceToSLIITValue, getWalkingTime, getDrivingTime, getDistanceColor, getDistanceLabel } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import { getImageUrl, getPlaceholder } from '../../utils/imageHelper';

const AccommodationDetails = ({ listing, onBooking, onContact, isStudent }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const distance = distanceToSLIIT(listing.location.lat, listing.location.lng);
  const distValue = distanceToSLIITValue(listing.location.lat, listing.location.lng);

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl overflow-hidden h-80 lg:h-96">
          <img
            src={getImageUrl(listing.images?.[selectedImage])}
            alt={listing.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = getPlaceholder(); }}
          />
        </div>
        {listing.images?.length > 1 && (
          <div className="grid grid-cols-3 gap-2">
            {listing.images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)}
                className={'rounded-xl overflow-hidden h-24 lg:h-28 border-2 transition-all ' +
                  (i === selectedImage ? 'border-primary-500 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100')}>
                <img src={getImageUrl(img)} alt={listing.title + ' ' + (i + 1)}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = getPlaceholder(); }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Title & Badges */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="badge bg-primary-100 text-primary-700">{listing.type}</span>
          {listing.genderPreference !== 'Any' && <span className="badge bg-purple-100 text-purple-700">{listing.genderPreference} Only</span>}
          <span className={'badge ' + (STATUS_COLORS[listing.status] || 'bg-gray-100 text-gray-600')}>{listing.status}</span>
          {listing.isAvailable
            ? <span className="badge bg-green-100 text-green-700">Available</span>
            : <span className="badge bg-red-100 text-red-700">Not Available</span>}
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{listing.title}</h1>
        <p className="text-gray-500 flex items-center gap-1">📍 {listing.location.address}, {listing.location.city}</p>
        <div className="mt-2">
          <StarRating rating={listing.rating || 0} reviewCount={listing.reviewCount} size="md" />
        </div>
      </div>

      {/* Distance to SLIIT */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-5 border border-primary-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎓</span>
          <h4 className="font-bold text-gray-800">Distance to SLIIT Campus</h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-primary-600">{distance}</p>
            <p className={'text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block ' + getDistanceColor(distValue)}>
              {getDistanceLabel(distValue)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg mb-1">🚶</p>
            <p className="text-sm font-bold text-gray-700">{getWalkingTime(distValue)}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg mb-1">🚗</p>
            <p className="text-sm font-bold text-gray-700">{getDrivingTime(distValue)}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">📝 Description</h3>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
      </div>

      {/* Room Types & Pricing */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🛏️ Room Types & Pricing</h3>
        {listing.roomTypes?.length > 0 ? (
          <div className="space-y-3">
            {listing.roomTypes.map((room) => {
              const roomIcons = { Single: '🛏️', Double: '🛏️🛏️', Shared: '👥', Studio: '🏠' };
              return (
                <div key={room._id}
                  onClick={() => setSelectedRoom(room._id === selectedRoom ? null : room._id)}
                  className={'p-4 rounded-xl border-2 cursor-pointer transition-all ' +
                    (selectedRoom === room._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{roomIcons[room.type] || '🛏️'}</span>
                      <div>
                        <h4 className="font-bold text-gray-900">{room.type} Room</h4>
                        <p className="text-sm text-gray-500">Capacity: {room.capacity} person(s)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-primary-600">
                        {formatPrice(room.pricePerMonth)}<span className="text-xs text-gray-400 font-normal">/mo</span>
                      </p>
                      <p className={'text-sm font-semibold ' + (room.availableRooms > 0 ? 'text-green-600' : 'text-red-500')}>
                        {room.availableRooms > 0 ? room.availableRooms + ' of ' + room.totalRooms + ' available' : 'Fully Booked'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xl font-extrabold text-primary-600">
              {formatPrice(listing.pricing?.monthlyRent || listing.price)}
              <span className="text-sm text-gray-400 font-normal">/month</span>
            </p>
          </div>
        )}

        {listing.pricing && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 uppercase font-semibold">Deposit</p>
              <p className="text-lg font-bold text-gray-800">{formatPrice(listing.pricing.deposit)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 uppercase font-semibold">Key Money</p>
              <p className="text-lg font-bold text-gray-800">{formatPrice(listing.pricing.keyMoney)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 uppercase font-semibold">Bills</p>
              <p className="text-lg font-bold text-gray-800">{listing.pricing.billsIncluded ? '✅ Included' : '❌ Separate'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 uppercase font-semibold">Min Period</p>
              <p className="text-lg font-bold text-gray-800">{listing.minimumPeriod || '6 Months'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Amenities & Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">✨ Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {listing.amenities?.map((a) => (
              <span key={a} className="badge bg-blue-50 text-blue-700 py-1.5 px-3">{a}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">🏷️ Features</h3>
          <div className="flex flex-wrap gap-2">
            {listing.features?.map((f) => (
              <span key={f} className="badge bg-accent-50 text-accent-700 py-1.5 px-3">{f}</span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
            <div><p className="text-sm text-gray-500">Bedrooms</p><p className="font-bold text-gray-800">{listing.totalBedrooms}</p></div>
            <div><p className="text-sm text-gray-500">Bathrooms</p><p className="font-bold text-gray-800">{listing.totalBathrooms}</p></div>
            <div><p className="text-sm text-gray-500">Max</p><p className="font-bold text-gray-800">{listing.maxOccupants}</p></div>
          </div>
        </div>
      </div>

      {/* Owner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">👤 Listed By</h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {listing.owner?.name?.charAt(0) || 'O'}
          </div>
          <div>
            <p className="font-bold text-gray-900 flex items-center gap-2">
              {listing.owner?.name}
              {listing.owner?.isVerified && <span className="badge bg-green-100 text-green-700 text-xs">✓ Verified</span>}
            </p>
            <p className="text-sm text-gray-500">{listing.owner?.phone}</p>
            <p className="text-sm text-gray-500">{listing.owner?.email}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isStudent && listing.isAvailable && listing.status === 'Active' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => onBooking && onBooking(selectedRoom)} className="btn-primary flex-1 text-center">
            📋 Book Now
          </button>
          <button onClick={() => onContact && onContact()} className="btn-secondary flex-1 text-center">
            💬 Contact Owner
          </button>
        </div>
      )}
    </div>
  );
};

export default AccommodationDetails;