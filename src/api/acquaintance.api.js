import api from './client';

export const getAcquaintanceDashboard = () => api.get('/acquaintance/dashboard');
export const getNotifications = () => api.get('/acquaintance/notifications');
export const markNotificationRead = (id) => api.put(`/acquaintance/notifications/${id}/read`);
