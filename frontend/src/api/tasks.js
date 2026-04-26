import api from './index';

export const getTasks       = ()       => api.get('/tasks');
export const startTask      = (videoId) => api.post(`/tasks/${videoId}/start`);
export const completeTask   = (taskId)  => api.post(`/tasks/${taskId}/complete`);
export const getTaskHistory = ()        => api.get('/tasks/history');