import React from 'react';
import { Box, Typography, Paper, Button, TextField, MenuItem, CircularProgress } from '@mui/material';

const TemplateSelection = ({
  plantillas,
  formData,
  selectedTemplate,
  loadingPlantillas,
  onTemplateChange,
  onOpenDialog
}) => (
  <Paper elevation={3} sx={{ borderRadius: 2 }}>
    <Box sx={{ 
      p: 3, 
      borderBottom: 1, 
      borderColor: 'divider', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between'
    }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        1. Plantilla de Invitación
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button onClick={() => onOpenDialog(1)} variant="outlined" size="small">
          Nueva Plantilla
        </Button>
        <Button 
          onClick={() => onOpenDialog(2, selectedTemplate)} 
          variant="outlined" 
          disabled={!selectedTemplate}
          size="small"
        >
          Editar Plantilla
        </Button>
      </Box>
    </Box>
    <Box sx={{ p: 4 }}>
      <TextField
        select
        name="plantilla"
        label="Seleccionar Plantilla"
        value={formData.plantilla}
        onChange={onTemplateChange}
        fullWidth
        variant="outlined"
        disabled={loadingPlantillas}
        helperText={loadingPlantillas ? "Cargando plantillas..." : `${plantillas.count} plantillas disponibles`}
      >
        {plantillas.results?.map((template) => (
          <MenuItem key={template.id} value={template.id}>
            {template.nombre} ({template.es_temporal ? "Temporal" : "Predefinida"})
          </MenuItem>
        ))}
      </TextField>
      {loadingPlantillas && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  </Paper>
);

export default TemplateSelection;
