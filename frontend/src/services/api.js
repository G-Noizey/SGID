// src/services/api.js
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  timeout: 10000,
});

export const enviarInvitacionMasiva = async (payload) => {
  try {
    const response = await api.post('invitaciones/enviar_masivo/', payload);

    // Mostrar detalles de los errores si existen
    if (response.data.fallidos && response.data.fallidos.length > 0) {
      response.data.fallidos.forEach(error => {
        toast.error(`Error en destinatario ${error.indice + 1}: ${error.error}`);
      });
    }

    return response.data;

  } catch (error) {
    // Manejo mejorado de errores
    if (error.response?.data?.detalles) {
      error.response.data.detalles.fallidos.forEach(err => {
        toast.error(`Error en destinatario ${err.indice + 1}: ${err.error}`);
      });
    } else {
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.detail ||
        'Error al enviar invitaciones';
      toast.error(errorMessage);
    }

    throw error;
  }
};


export const descargarPDF = async (evento) => {
  try {
    // Preparamos los datos igual que para PNG
    const eventoData = {
      ...evento,
      config_diseno: {
        ...evento.config_diseno,
        elementos: evento.config_diseno.elementos.map(el => {
          if (el.type === 'image' && typeof el.content === 'string') {
            return {
              ...el,
              content: {
                data: el.content.includes('base64,') ?
                  el.content.split('base64,')[1] :
                  el.content
              }
            };
          }
          return el;
        })
      }
    };

    const response = await api.post(
      'generar-pdf/',
      eventoData,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
};

export const descargarPNG = async (evento) => {
  try {
    // Preparamos los datos para el backend
    const eventoData = {
      ...evento,
      config_diseno: {
        ...evento.config_diseno,
        elementos: evento.config_diseno.elementos.map(el => {
          if (el.type === 'image' && typeof el.content === 'string') {
            return {
              ...el,
              content: {
                data: el.content.includes('base64,') ?
                  el.content.split('base64,')[1] :
                  el.content
              }
            };
          }
          return el;
        })
      }
    };

    const response = await api.post(
      'generar-png/',
      eventoData,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generando PNG:', error);
    throw error;
  }
};

// Interceptor para añadir token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejador global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Error en la solicitud";

    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
