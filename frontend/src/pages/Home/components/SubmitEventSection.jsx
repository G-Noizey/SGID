import React from 'react';
import { Paper, Box, Typography, Button, CircularProgress } from '@mui/material';

const SubmitEventSection = ({ handleSubmit, submitting, loadingPlantillas, formData }) => (
  <Paper elevation={3} sx={{ borderRadius: 2 }}>
    <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        3. Crear Invitación
      </Typography>
    </Box>
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Revisa todos los datos y crea tu invitación
      </Typography>
      <Button 
        variant="contained" 
        size="large" 
        onClick={handleSubmit}
        disabled={submitting || loadingPlantillas || !formData.plantilla || !formData.titulo || !formData.fecha_evento}
        sx={{ px: 6, py: 2, fontSize: '1.1rem', fontWeight: 'bold', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' }, minWidth: 200 }}
      >
        {submitting ? (
          <>
            <CircularProgress size={24} sx={{ color: 'white', mr: 2 }} />
            Creando Invitación...
          </>
        ) : 'Crear Invitación'}
      </Button>
    </Box>
  </Paper>
);

export default SubmitEventSection;
