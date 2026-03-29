import api from './client';

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const saveOnboarding = (data) => api.put('/profile/onboarding', data);
export const saveExtendedProfile = (data) => api.put('/profile/extended', data);
export const awardReward = (data) => api.post('/profile/reward', data);
