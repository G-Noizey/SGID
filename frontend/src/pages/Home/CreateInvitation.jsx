import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getPlantillasTemporales, createPlantillaTemporal, updatePlantilla } from '../../services/plantillas.service';
import { createEvento } from '../../services/eventos.service';
import { toast } from 'react-toastify';

import StepHeader from './components/StepHeader';
import TemplateSelection from './components/TemplateSelection';
import TemplatePreviewSection from './components/TemplatePreviewSection';
import EventFormSection from './components/EventFormSection';
import SubmitEventSection from './components/SubmitEventSection';
import TemplateDialog from './components/TemplateDialog';

const CreateInvitation = () => {
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
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateTab, setTemplateTab] = useState(0);
  const [templateToEdit, setTemplateToEdit] = useState(null);

  const eventTypes = [
    { value: 'boda', label: 'Boda' },
    { value: 'cumpleaños', label: 'Cumpleaños' },
    { value: 'baby_shower', label: 'Baby Shower' },
    { value: 'graduacion', label: 'Graduación' },
    { value: 'otro', label: 'Otro' }
  ];

  const steps = ['Seleccionar Plantilla', 'Datos del Evento', 'Confirmar Invitación'];

  const getCurrentStep = () => {
    if (!selectedTemplate) return 0;
    if (!formData.titulo || !formData.fecha_evento) return 1;
    return 2;
  };

  useEffect(() => {
    const loadPlantillas = async () => {
      if (!currentUser) return;
      try {
        setLoadingPlantillas(true);
        const response = await getPlantillasTemporales();
        setPlantillas(response);
        if (response?.results?.length > 0) {
          const firstTemplate = response.results[0];
          setFormData(prev => ({ ...prev, plantilla: firstTemplate.id }));
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

    // Normalizar tipo de evento para que coincida con los choices del modelo
    if (name === 'tipo') {
      const normalized = value.replace(/-/g, '_'); 
      setFormData(prev => ({ ...prev, [name]: normalized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTemplateChange = (e) => {
    const selectedId = Number(e.target.value);
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
      setTemplateTab(0);
      toast.success("Plantilla creada correctamente 🎉");
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Error al crear la plantilla ❌");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTemplateUpdate = async (updatedTemplateData) => {
    if (!templateToEdit) return;
    try {
      setSubmitting(true);
      await updatePlantilla(templateToEdit.id, updatedTemplateData);
      const refreshed = await getPlantillasTemporales();
      setPlantillas(refreshed);
      const refreshedTemplate = refreshed.results.find(p => p.id === templateToEdit.id);
      if (refreshedTemplate) {
        if (selectedTemplate?.id === templateToEdit.id) {
          setSelectedTemplate(refreshedTemplate);
          setFormData((prev) => ({ ...prev, plantilla: refreshedTemplate.id }));
        }
        setTemplateToEdit(null);
      }
      setTemplateTab(0);
      toast.success("Plantilla actualizada correctamente 🎉");
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Error al actualizar la plantilla ❌");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plantilla) {
      console.warn('Debes seleccionar una plantilla');
      return;
    }

    // Normalizar fecha: agregar segundos si no existen
    let fecha = formData.fecha_evento;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fecha)) {
      fecha += ':00';
    }

    const payload = { ...formData, fecha_evento: fecha };
    console.log('Payload enviado al backend:', payload);

    setSubmitting(true);
    try {
      await createEvento(payload);
      toast.success("Evento creado correctamente 🎉");
      setFormData({ titulo: '', tipo: 'boda', fecha_evento: '', ubicacion: '', descripcion: '', plantilla: formData.plantilla });
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Error al crear el evento ❌");
    } finally {
      setSubmitting(false);
    }
  };

  const openTemplateDialog = (tab = 0, template = null) => {
    setTemplateTab(tab);
    setTemplateToEdit(template);
    setTemplateDialogOpen(true);
  };

  const closeTemplateDialog = () => {
    setTemplateDialogOpen(false);
    setTemplateToEdit(null);
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Debes iniciar sesión para crear eventos</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            Crear Nueva Invitación
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Crea tu evento paso a paso con nuestras plantillas personalizables
          </Typography>
        </Box>

        <StepHeader steps={steps} activeStep={getCurrentStep()} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <TemplateSelection
            plantillas={plantillas}
            formData={formData}
            selectedTemplate={selectedTemplate}
            loadingPlantillas={loadingPlantillas}
            onTemplateChange={handleTemplateChange}
            onOpenDialog={openTemplateDialog}
          />

          <TemplatePreviewSection selectedTemplate={selectedTemplate} />

          {selectedTemplate && (
            <EventFormSection 
              formData={formData} 
              handleChange={handleChange} 
              eventTypes={eventTypes} 
            />
          )}

          {selectedTemplate && (
            <SubmitEventSection
              handleSubmit={handleSubmit}
              submitting={submitting}
              loadingPlantillas={loadingPlantillas}
              formData={formData}
            />
          )}
        </Box>
      </motion.div>

      <TemplateDialog
        open={templateDialogOpen}
        tab={templateTab}
        onTabChange={setTemplateTab}
        onClose={closeTemplateDialog}
        plantillas={plantillas}
        formData={formData}
        onTemplateChange={handleTemplateChange}
        onSubmit={templateTab === 1 ? handleTemplateCreated : handleTemplateUpdate}
        templateToEdit={templateToEdit}
      />
    </Container>
  );
};

export default CreateInvitation;
