import api from './api';
import { getCurrentUserId } from './auth';

export const getPlantillasTemporales = async () => {
  try {
    const userId = getCurrentUserId();
    const response = await api.get('plantillas/', {
      params: {
        es_temporal: true,
        creado_por: userId
      }
    });
    return response.data; 
  } catch (error) {
    console.error("Error fetching templates:", error);
    return { count: 0, results: [] };
  }
};

export const createPlantillaTemporal = async (data) => {
  try {
    const processedElements = data.config_diseno.elementos.map(element => {
      if (element.type === 'image' && element.content) {
        if (element.content.startsWith('data:image')) {
          const base64Data = element.content.split(',')[1];
          return {
            ...element,
            content: base64Data
          };
        }
        return element;
      }
      return element;
    });

    const payload = {
      ...data,
      config_diseno: {
        ...data.config_diseno,
        elementos: processedElements
      }
    };

    const response = await api.post('plantillas/', payload);
    return response.data;
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
};

export const updatePlantilla = (id, data) => api.patch(`plantillas/${id}/`, data);
export const deletePlantilla = (id) => api.delete(`plantillas/${id}/`);