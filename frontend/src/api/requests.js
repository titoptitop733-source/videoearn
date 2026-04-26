import api from './index';

export const createDeposit    = (data) => api.post('/requests/deposit', data);
export const createWithdrawal = (data) => api.post('/requests/withdrawal', data);
export const getMyRequests    = ()     => api.get('/requests/my');