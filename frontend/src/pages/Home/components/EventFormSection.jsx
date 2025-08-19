import React from 'react';
import { Paper, Box, Typography, TextField, Grid, MenuItem } from '@mui/material';

const EventFormSection = ({ formData, handleChange, eventTypes }) => (
  <Paper elevation={3} sx={{ borderRadius: 2 }}>
    <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        2. Datos del Evento
      </Typography>
    </Box>
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h6" color="primary.main" gutterBottom>
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
        />
      </Box>
    </Box>
  </Paper>
);

export default EventFormSection;
  