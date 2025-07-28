import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Chip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

const PreviewContainer = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const ColorBadge = styled(Box)(({ color }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: color,
  display: 'inline-block',
  marginRight: 8,
  border: '1px solid #ddd'
}));

const TemplatePreview = ({ template }) => {
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    const mockHtml = `
      <div style="font-family: ${template.config_diseno?.fuentes?.cuerpo || 'Arial'}; 
                  color: ${template.config_diseno?.colores?.text || '#333'}; 
                  max-width: 500px; margin: 0 auto;">
        <h1 style="color: ${template.config_diseno?.colores?.primary || '#4a2c82'}; 
                    font-family: ${template.config_diseno?.fuentes?.titulo || 'Georgia'}; 
                    text-align: center;">
          ${template.nombre}
        </h1>
        <div style="background: ${template.config_diseno?.colores?.secondary || '#f8e5ff'}; 
                    padding: 20px; border-radius: 8px;">
          ${(template.config_diseno?.elementos || [])
            .map(el => `<p>${el.content}</p>`)
            .join('')}
          <p style="text-align: center;">Contenido del evento aparecerá aquí</p>
        </div>
      </div>
    `;
    setPreviewHtml(mockHtml);
  }, [template]);

  if (!template) return null;

  return (
    <PreviewContainer elevation={0}>
      <Typography variant="h6" gutterBottom>
        {template.nombre}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Configuración de diseño:
        </Typography>
        
        {template.config_diseno?.colores && (
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Typography variant="body2">Colores:</Typography>
            {Object.entries(template.config_diseno.colores).map(([name, color]) => (
              <Chip
                key={name}
                label={name}
                avatar={<ColorBadge color={color} />}
                size="small"
                sx={{ mr: 1 }}
              />
            ))}
          </Box>
        )}
        
        {template.config_diseno?.fuentes && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Fuentes:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {Object.entries(template.config_diseno.fuentes).map(([name, font]) => (
                <Chip
                  key={name}
                  label={`${name}: ${font}`}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
      
      <Typography variant="subtitle1" gutterBottom>
        Vista previa:
      </Typography>
      <Box
        sx={{ 
          border: '1px solid #eee',
          borderRadius: 1,
          p: 2,
          minHeight: 200,
          bgcolor: 'background.default'
        }}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </PreviewContainer>
  );
};

export default TemplatePreview;