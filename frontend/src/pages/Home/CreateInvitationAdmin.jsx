import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getPlantillasTemporales, createPlantillaTemporal, updatePlantilla} from '../../services/plantillas.service';
import { createEvento } from '../../services/eventos.service';
import EventForm from './components/EventForm';
import Swal from 'sweetalert2';
import TemplatePreview from './components/TemplatePreview';
import CreateTemplateForm from './components/CreateTemplateForm';

const CreateInvitationAdmin = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'boda',
    fecha_evento: '',
    ubicacion: '',
    descripcion: '',
    plantilla: ''
  });
  const [plantillas, setPlantillas] = useState({ results: [], count: 0 });
  const [loadingPlantillas, setLoadingPlantillas] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  {
    /********* EDITAR PLANTILLA *********/
  }
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

const handleTemplateUpdate = async (updatedTemplateData) => {
  if (!selectedTemplate) return;
  try {
    setSubmitting(true);
    await updatePlantilla(selectedTemplate.id, updatedTemplateData);

    // volver a pedir la lista
    const refreshed = await getPlantillasTemporales();
    setPlantillas(refreshed);

    // buscar la que acabamos de editar
    const refreshedTemplate = refreshed.results.find(p => p.id === selectedTemplate.id);

    // mantener seleccionada esa
    if (refreshedTemplate) {
      setSelectedTemplate(refreshedTemplate);
      setFormData((prev) => ({ ...prev, plantilla: refreshedTemplate.id }));
    }

    setIsEditingTemplate(false);
    Swal.fire("Éxito", "Plantilla actualizada correctamente", "success");
  } catch (error) {
    console.error("Error updating template:", error);
    Swal.fire("Error", "No se pudo actualizar la plantilla.", "error");
  } finally {
    setSubmitting(false);
  }
};
  {
    /********* EDITAR PLANTILLA *********/
  }

  useEffect(() => {
    const loadPlantillas = async () => {
      if (!currentUser) return;
      
      try {
        setLoadingPlantillas(true);
        const response = await getPlantillasTemporales();
        setPlantillas(response); 
        
        if (response?.results?.length > 0) {
          const firstTemplate = response.results[0];
          setFormData(prev => ({ 
            ...prev, 
            plantilla: firstTemplate.id 
          }));
          setSelectedTemplate(firstTemplate);
        }
      } catch (error) {
        console.error("Error loading templates:", error);
        setPlantillas({ results: [], count: 0 });
      } finally {
        setLoadingPlantillas(false);
      }
    };

    loadPlantillas();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (e) => {
    const selectedId = e.target.value;
    setFormData(prev => ({ ...prev, plantilla: selectedId }));
    
    const template = plantillas.results?.find(t => t.id === selectedId);
    setSelectedTemplate(template);
  };

  const handleTemplateCreated = async (newTemplate) => {
    try {
      setSubmitting(true);
      const createdTemplate = await createPlantillaTemporal(newTemplate);
      
      setPlantillas(prev => ({
        ...prev,
        count: prev.count + 1,
        results: [...prev.results, createdTemplate]
      }));
      
      setFormData(prev => ({ ...prev, plantilla: createdTemplate.id }));
      setSelectedTemplate(createdTemplate);
      setShowTemplateForm(false);
      
    } catch (error) {
      console.error("Error creating template:", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear la plantilla. Por favor, inténtalo de nuevo.',
        icon: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.plantilla) {
      Swal.fire('Advertencia', 'Debes seleccionar una plantilla', 'warning');
      return;
    }

    setSubmitting(true);
    
    try {
      const fechaCompleta = new Date(formData.fecha_evento).toISOString();
      
      await createEvento({
        ...formData,
        fecha_evento: fechaCompleta
      });

      Swal.fire({
        title: 'Éxito',
        text: 'Evento creado correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
      
      setFormData({
        titulo: '',
        tipo: 'boda',
        fecha_evento: '',
        ubicacion: '',
        descripcion: '',
        plantilla: formData.plantilla
      });
    } catch (error) {
      console.error("Error creating event:", error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Ocurrió un error al crear el evento',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Debes iniciar sesión para crear eventos</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
          Crear Nueva Invitación
        </Typography>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {showTemplateForm ? (
            <CreateTemplateForm 
              onSubmit={handleTemplateCreated} 
              onCancel={() => setShowTemplateForm(false)}
            />
          ) : isEditingTemplate && selectedTemplate ? (
            <CreateTemplateForm
              onSubmit={handleTemplateUpdate}
              onCancel={() => setIsEditingTemplate(false)}
              initialData={selectedTemplate}
            />
          ) : (
            <>
              <EventForm
                formData={formData}
                handleChange={handleChange}
                handleTemplateChange={handleTemplateChange}
                plantillas={plantillas}
                loadingPlantillas={loadingPlantillas}
                selectedTemplate={selectedTemplate}
              />
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button onClick={() => setShowTemplateForm(true)} variant="outlined">
                  Crear Nueva Plantilla
                </Button>
                <Button onClick={() => setIsEditingTemplate(true)} variant="outlined" disabled={!selectedTemplate}>
                  Editar Plantilla Seleccionada
                </Button>
              </Box>
              
              {selectedTemplate && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Vista Previa de la Plantilla
                  </Typography>
                  <TemplatePreview template={selectedTemplate} />
                </Box>
              )}
            </>
          )}

          {!showTemplateForm && !isEditingTemplate &&(
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={submitting || loadingPlantillas || !formData.plantilla}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  backgroundColor: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.dark' }
                }}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                    Creando...
                  </>
                ) : (
                  'Crear Evento'
                )}
              </Button>
            </Box>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default CreateInvitationAdmin;