import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import TemplatePreview from './TemplatePreview';

const TemplatePreviewSection = ({ selectedTemplate }) => (
  selectedTemplate && (
    <Paper elevation={3} sx={{ borderRadius: 2 }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Vista Previa de la Plantilla
        </Typography>
      </Box>
      <Box sx={{ p: 4 }}>
        <TemplatePreview template={selectedTemplate} />
      </Box>
    </Paper>
  )
);

export default TemplatePreviewSection;
