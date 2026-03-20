import API from './api';

export const getAccommodations = (params) => API.get('/accommodations', { params });
export const getAccommodation = (id) => API.get(`/accommodations/${id}`);
export const getMyListings = (params) => API.get('/accommodations/my/listings', { params });
export const createAccommodation = (data) => API.post('/accommodations', data);
export const updateAccommodation = (id, data) => API.put(`/accommodations/${id}`, data);
export const deleteAccommodation = (id) => API.delete(`/accommodations/${id}`);
export const toggleAvailability = (id) => API.patch(`/accommodations/${id}/availability`);
export const toggleDeactivate = (id) => API.patch(`/accommodations/${id}/deactivate`);
export const updateRoomAvailability = (id, roomTypeId, data) =>
  API.patch(`/accommodations/${id}/rooms/${roomTypeId}`, data);