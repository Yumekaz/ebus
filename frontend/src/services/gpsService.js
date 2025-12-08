import api3 from './api';

export const gpsService = {
  log: (data) => api3.post('/gps/log', data),
  getHistory: (busId, params) => api3.get(`/gps/history/${busId}`, { params })
};