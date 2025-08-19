// src/services/confirmacionesService.js
import api from './api';

// Obtener todas las confirmaciones (GET)
export const getConfirmaciones = () => api.get('confirmaciones/');

// Crear una nueva confirmación (POST)
export const createConfirmacion = (data) => api.post('confirmaciones/', data);

// Actualizar una confirmación existente (PATCH)
export const updateConfirmacion = (id, data) => api.patch(`confirmaciones/${id}/`, data);

// Eliminar una confirmación (DELETE)
export const deleteConfirmacion = (id) => api.delete(`confirmaciones/${id}/`);

// Endpoint adicional si tu API tuviera alguna acción especial, por ejemplo "aprobar" o "marcar como leída"
// export const aprobarConfirmacion = (id) => api.post(`confirmaciones/${id}/aprobar/`);
