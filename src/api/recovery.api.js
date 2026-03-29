import api from './client';

export const getJourney = () => api.get('/recovery/journey');
export const toggleJourneyTask = (dayId, taskId) => api.post(`/recovery/journey/day/${dayId}/task/${taskId}`);
export const completeDay = (dayId) => api.post(`/recovery/journey/day/${dayId}/complete`);
export const getRecoveryPlan = () => api.get('/recovery/plan');
export const refreshRecoveryPlan = () => api.post('/recovery/plan/refresh');
