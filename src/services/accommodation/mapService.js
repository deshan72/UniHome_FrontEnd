export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'UniHome/1.0' } }
    );
    const data = await res.json();
    return data.display_name || 'Address not found';
  } catch {
    return 'Address not available';
  }
};

export const searchLocation = async (query) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=lk&limit=5`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'UniHome/1.0' } }
    );
    return await res.json();
  } catch {
    return [];
  }
};