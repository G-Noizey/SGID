import api from './api';
import { getCurrentUserId } from './auth'; // Necesitarás implementar esta función

export const getPlantillasTemporales = async () => {
  try {
    const userId = getCurrentUserId();
    const response = await api.get('plantillas/', {
      params: {
        es_temporal: true,
        usuario: userId
      }
    });
    return response.data; 
  } catch (error) {
    console.error("Error fetching templates:", error);
    return { count: 0, results: [] };
  }
};

export const createPlantillaTemporal = (data) => {
  const payload = {
    ...data,
    es_temporal: true
  };
  return api.post('plantillas/', payload);
};

export const updatePlantilla = (id, data) => api.patch(`plantillas/${id}/`, data);
export const deletePlantilla = (id) => api.delete(`plantillas/${id}/`);