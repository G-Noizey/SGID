import api from './api';

export const uploadAsset = async (file, plantillaId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (plantillaId) {
    formData.append('plantilla', plantillaId);
  }
  
  const response = await api.post('/assets/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getUserAssets = async () => {
  const response = await api.get('/assets/');
  return response.data;
};

export const deleteAsset = async (assetId) => {
  const response = await api.delete(`/assets/${assetId}/`);
  return response.data;
};
