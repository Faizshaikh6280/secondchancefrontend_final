import api from './client';

export const startCopingSession = (data) => api.post('/coping/session/start', data);
export const updateCopingProgress = (id, stepsCompleted) => api.put(`/coping/session/${id}/progress`, { stepsCompleted });
export const completeCopingSession = (id, outcome) => api.put(`/coping/session/${id}/complete`, outcome);
