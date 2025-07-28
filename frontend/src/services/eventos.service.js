import api from './api';

export const getEventos = () => api.get('eventos/');
export const createEvento = (data) => api.post('eventos/', data);
export const updateEvento = (id, data) => api.patch(`eventos/${id}/`, data);
export const deleteEvento = (id) => api.delete(`eventos/${id}/`);
export const publicarEvento = (id) => api.post(`eventos/${id}/publicar/`);