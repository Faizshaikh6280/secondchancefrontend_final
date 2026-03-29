import api from './client';

export const getDashboardToday = () => api.get('/dashboard/today');
export const toggleTask = (taskId) => api.post(`/dashboard/task/${taskId}/toggle`);
export const logCraving = (intensity) => api.post('/dashboard/craving', { intensity });
export const logMood = (mood) => api.post('/dashboard/mood', { mood });
export const getChartData = () => api.get('/dashboard/charts');
