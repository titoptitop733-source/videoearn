import api from './index';

export const getLevels      = ()   => api.get('/levels');
export const purchaseLevel  = (id) => api.post(`/levels/${id}/purchase`);