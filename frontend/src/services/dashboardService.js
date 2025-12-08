import api4 from './api';

export const dashboardService = {
  getStats: () => api4.get('/dashboard/stats'),
  getActiveBuses: () => api4.get('/dashboard/active-buses')
};