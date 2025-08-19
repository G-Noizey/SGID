import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Button, Box, IconButton, TextField, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CreateTemplateForm from './CreateTemplateForm';

const TemplateDialog = ({
  open,
  tab,
  onTabChange,
  onClose,
  plantillas,
  formData,
  onTemplateChange,
  onSubmit,
  templateToEdit
}) => {

  const handleFormSubmit = async (data) => {
    // Ya no usamos toast aquí, solo delegamos al padre
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          overflow: 'hidden',
          position: 'relative'
        }
      }}
    >
      <DialogTitle sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Tabs value={tab} onChange={(e, newValue) => onTabChange(newValue)}>
          <Tab label="Seleccionar Plantilla" disabled={tab !== 0} />
          <Tab label="Crear Plantilla" disabled={tab !== 1} />
          <Tab label="Editar Plantilla" disabled={tab !== 2} />
        </Tabs>
        <IconButton onClick={onClose} sx={{ mr: 1 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', height: 'calc(100% - 64px)', p: 2, overflow: 'auto' }}>
        {tab === 0 && (
          <Box sx={{ flex: 1, pt: 2 }}>
            <TextField
              select
              name="plantilla"
              label="Seleccionar Plantilla"
              value={formData.plantilla}
              onChange={onTemplateChange}
              fullWidth
              variant="outlined"
            >
              {plantillas.results?.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.nombre} ({template.tipo})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}

        {(tab === 1 || tab === 2) && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            <CreateTemplateForm 
              onSubmit={handleFormSubmit}
              onCancel={onClose}
              initialData={tab === 2 ? templateToEdit : null}
            />
          </Box>
        )}
      </DialogContent>

      {tab === 0 && (
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
          <Button onClick={() => onTabChange(1)} variant="contained">Nueva Plantilla</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default TemplateDialog;
