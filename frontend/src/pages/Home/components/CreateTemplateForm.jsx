import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import TemplateEditor from './TemplateEditor';

const CreateTemplateForm = ({ onSubmit, onCancel, initialData }) => {
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [editorConfig, setEditorConfig] = useState(initialData?.config_diseno || {
    width: 600,
    height: 800,
    elements: []
  });
  const [loading, setLoading] = useState(false);

  // Estilo beige consistente
  const beigeButtonStyle = {
    backgroundColor: '#f5f5dc', // beige
    color: '#5a4633',            // texto marrón/beige oscuro
    '&:hover': { backgroundColor: '#e6e0c8' }
  };

  // Actualiza editorConfig si cambia initialData (editar plantilla)
  useEffect(() => {
    if (initialData?.config_diseno) {
      setEditorConfig(initialData.config_diseno);
    }
  }, [initialData]);

  const handleEditorChange = (newConfig) => {
    setEditorConfig(newConfig);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoading(true);
    try {
      const templateData = { nombre, config_diseno: editorConfig };
      await onSubmit(templateData);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <TextField
          label="Nombre de la plantilla"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          fullWidth
          required
        />

        {/* Editor de lienzo */}
        <TemplateEditor
          initialConfig={editorConfig}
          onChange={handleEditorChange} // pasar datos al form
          onCancel={onCancel}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            type="button"
            variant="outlined"
            sx={beigeButtonStyle}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={beigeButtonStyle}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar Plantilla'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CreateTemplateForm;
