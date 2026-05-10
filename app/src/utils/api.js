import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({ baseURL: BASE_URL });

export const getLotStatus = () => api.get('/api/reports/lot-status').then((r) => r.data);
export const getGarageFloors = (id) => api.get(`/api/garages/${id}/floors`).then((r) => r.data);
export const getSpot = (id) => api.get(`/api/spots/${id}`).then((r) => r.data);
export const submitReport = (spotId, status, userId) =>
  api.post('/api/reports', { spotId, status, userId }).then((r) => r.data);
