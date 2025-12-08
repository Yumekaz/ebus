import api2 from './api';

export const shiftService = {
  getAll: (params) => api2.get('/shifts', { params }),
  create: (data) => api2.post('/shifts', data),
  updateStatus: (id, status) => api2.patch(`/shifts/${id}/status`, { status })
};