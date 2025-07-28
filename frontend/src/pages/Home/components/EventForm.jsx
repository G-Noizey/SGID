import React from 'react';
import { 
  Grid, 
  TextField,
  Typography,
  Divider,
  Box
} from '@mui/material';
import EventTypeSelect from './EventTypeSelect';
import TemplateSelect from './TemplateSelect';

const EventForm = ({ 
  formData, 
  handleChange, 
  handleTemplateChange,
  plantillas, 
  loadingPlantillas,
  selectedTemplate
}) => {
  return (
    <Grid container spacing={3}>
      {/* Sección de información básica */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Información del Evento
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Nombre del Evento"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          required
          variant="outlined"
          size="medium"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Fecha del Evento"
          type="date"
          name="fecha_evento"
          value={formData.fecha_evento}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
          variant="outlined"
          inputProps={{
            min: new Date().toISOString().split('T')[0] // Fecha mínima hoy
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <EventTypeSelect 
          value={formData.tipo} 
          onChange={handleChange} 
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Ubicación"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleChange}
          required
          variant="outlined"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Descripción (Opcional)"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          multiline
          rows={4}
          variant="outlined"
        />
      </Grid>

      {/* Sección de diseño */}
      <Grid item xs={12}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Diseño de la Invitación
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Selecciona una plantilla y personaliza los detalles de diseño
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <TemplateSelect 
          plantillas={plantillas} 
          value={formData.plantilla} 
          onChange={handleTemplateChange}
          loading={loadingPlantillas}
          selectedTemplate={selectedTemplate}
        />
      </Grid>

      {/* Visualización de la configuración de diseño seleccionada */}
      {selectedTemplate?.config_diseno && (
        <Grid item xs={12}>
          <Box sx={{ 
            p: 2, 
            border: '1px solid', 
            borderColor: 'divider', 
            borderRadius: 1,
            backgroundColor: 'background.paper'
          }}>
            <Typography variant="subtitle1" gutterBottom>
              Configuración de diseño seleccionada:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {selectedTemplate.config_diseno.colores && (
                <Box>
                  <Typography variant="caption" display="block">Colores:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {Object.entries(selectedTemplate.config_diseno.colores).map(([name, color]) => (
                      <Box 
                        key={name} 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          backgroundColor: color, 
                          borderRadius: '50%',
                          border: '1px solid #ddd'
                        }} 
                        title={`${name}: ${color}`}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              {selectedTemplate.config_diseno.fuentes && (
                <Box>
                  <Typography variant="caption" display="block">Fuentes:</Typography>
                  <Box sx={{ mt: 1 }}>
                    {Object.entries(selectedTemplate.config_diseno.fuentes).map(([name, font]) => (
                      <Typography 
                        key={name} 
                        variant="caption" 
                        display="block"
                        sx={{ fontFamily: font }}
                      >
                        {name}: {font}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default EventForm;