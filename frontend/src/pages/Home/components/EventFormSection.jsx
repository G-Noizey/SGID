import React from 'react';
import { Paper, Box, Typography, TextField, Grid, MenuItem } from '@mui/material';

const EventFormSection = ({ formData, handleChange, eventTypes }) => {
  const beigeFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#d6cbb3' }, // borde beige claro
      '&:hover fieldset': { borderColor: '#cbbf9c' },
      '&.Mui-focused fieldset': { borderColor: '#bfae82' }
    }
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 2 }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: '#d6cbb3' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#8b6d3b' }}>
          2. Datos del Evento
        </Typography>
      </Box>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h6" color="#8b6d3b" gutterBottom>
            Información del Evento
          </Typography>
          <TextField
            name="titulo"
            label="Nombre del Evento"
            value={formData.titulo}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            required
            placeholder="Ej: Boda de Juan y María"
            sx={beigeFieldStyle}
          />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="fecha_evento"
                label="Fecha y Hora del Evento"
                type="datetime-local"
                value={formData.fecha_evento}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                required
                InputLabelProps={{ shrink: true }}
                sx={beigeFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                name="tipo"
                label="Tipo de Evento"
                value={formData.tipo}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                required
                sx={beigeFieldStyle}
              >
                {eventTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <TextField
            name="ubicacion"
            label="Ubicación"
            value={formData.ubicacion}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            required
            placeholder="Ej: Salón Los Rosales, Calle Principal #123"
            sx={beigeFieldStyle}
          />
          <TextField
            name="descripcion"
            label="Descripción (Opcional)"
            value={formData.descripcion}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            placeholder="Agrega detalles adicionales sobre tu evento..."
            sx={beigeFieldStyle}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default EventFormSection;
