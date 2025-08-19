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
    if (!data || !data.config_diseno || !Array.isArray(data.config_diseno.elements)) {
      throw new Error("La plantilla o su configuración no están definidas");
    }

    const processedElements = data.config_diseno.elements.map(el => {
      if (el.type === 'image' && el.content?.startsWith('data:image')) {
        const base64Data = el.content.split(',')[1];
        return { ...el, content: base64Data };
      }
      return el;
    });

    const payload = { 
      ...data,
      config_diseno: { ...data.config_diseno, elements: processedElements }
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
