import api from './client';

export const getDietToday = () => api.get('/diet/today');
export const toggleMeal = (mealId) => api.post(`/diet/meal/${mealId}/toggle`);
export const refreshDiet = () => api.post('/diet/refresh');
