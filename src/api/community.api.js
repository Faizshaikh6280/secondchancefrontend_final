import api from './client';

export const getCommunityRisk = () => api.get('/community/risk');
export const refreshCommunityRisk = () => api.post('/community/risk/refresh');
export const getPosts = (page = 1) => api.get('/community/posts', { params: { page } });
export const createPost = (content) => api.post('/community/posts', { content });
export const toggleLike = (id) => api.post(`/community/posts/${id}/like`);
export const addComment = (id, text) => api.post(`/community/posts/${id}/comment`, { text });
export const deletePost = (id) => api.delete(`/community/posts/${id}`);
export const getGroups = () => api.get('/community/groups');
export const joinGroup = (id) => api.post(`/community/groups/${id}/join`);
export const leaveGroup = (id) => api.post(`/community/groups/${id}/leave`);
export const getMyCircle = () => api.get('/community/circle');
