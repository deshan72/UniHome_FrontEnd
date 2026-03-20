import { SLIIT_COORDINATES } from './constants';

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency', currency: 'LKR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(price);
};

const toRad = (deg) => deg * (Math.PI / 180);

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const distanceToSLIIT = (lat, lng) => {
  const dist = calculateDistance(lat, lng, SLIIT_COORDINATES.lat, SLIIT_COORDINATES.lng);
  return dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`;
};

export const distanceToSLIITValue = (lat, lng) =>
  calculateDistance(lat, lng, SLIIT_COORDINATES.lat, SLIIT_COORDINATES.lng);

export const getWalkingTime = (distKm) => {
  const mins = Math.round((distKm / 5) * 60);
  return mins < 60 ? `${mins} min walk` : `${Math.floor(mins / 60)}h ${mins % 60}min walk`;
};

export const getDrivingTime = (distKm) => {
  const mins = Math.round((distKm / 30) * 60);
  return mins < 60 ? `${mins} min drive` : `${Math.floor(mins / 60)}h ${mins % 60}min drive`;
};

export const getDistanceColor = (distKm) => {
  if (distKm <= 1) return 'text-green-600 bg-green-50';
  if (distKm <= 3) return 'text-blue-600 bg-blue-50';
  if (distKm <= 5) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

export const getDistanceLabel = (distKm) => {
  if (distKm <= 1) return 'Very Close';
  if (distKm <= 3) return 'Nearby';
  if (distKm <= 5) return 'Moderate';
  return 'Far';
};

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-LK', {
    year: 'numeric', month: 'short', day: 'numeric',
  });