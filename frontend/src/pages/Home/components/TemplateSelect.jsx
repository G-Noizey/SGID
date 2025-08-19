import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  Typography,
  Box
} from '@mui/material';

const TemplateSelect = ({ plantillas = { results: [] }, value, onChange, loading }) => {
  const plantillasList = plantillas.results || [];
  const totalPlantillas = plantillas.count || 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2">Cargando plantillas...</Typography>
      </Box>
    );
  }

  if (totalPlantillas === 0) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
        No hay plantillas disponibles. Por favor crea una plantilla primero.
      </Typography>
    );
  }

  return (
    <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
      <InputLabel id="plantilla-select-label">Plantilla</InputLabel>
      <Select
        labelId="plantilla-select-label"
        value={value || ''}
        onChange={onChange}
        label="Plantilla"
        name="plantilla"
        required
      >
        {plantillasList.map((plantilla) => (
          <MenuItem 
            key={plantilla.id} 
            value={plantilla.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{plantilla.nombre}</span>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ ml: 2 }}
            >
              {plantilla.es_temporal ? '(Temporal)' : '(Predefinida)'}
            </Typography>
          </MenuItem>
        ))}
      </Select>
      {totalPlantillas > 0 && (
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          {totalPlantillas} plantilla{totalPlantillas !== 1 ? 's' : ''} disponible{totalPlantillas !== 1 ? 's' : ''}
        </Typography>
      )}
    </FormControl>
  );
};

export default TemplateSelect;
