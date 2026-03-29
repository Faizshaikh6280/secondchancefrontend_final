import api from './client';

export const getChallenges = (status) => api.get('/challenges', { params: status ? { status } : {} });
export const getChallenge = (id) => api.get(`/challenges/${id}`);
export const joinChallenge = (id) => api.post(`/challenges/${id}/join`);
export const toggleChallengeTask = (id, taskId) => api.post(`/challenges/${id}/task/${taskId}/toggle`);
export const getGlobalLeaderboard = () => api.get('/challenges/leaderboard/global');
