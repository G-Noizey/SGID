import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
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
  const [imageLoadError, setImageLoadError] = useState({});
  
  const handleImageError = (index) => {
    setImageLoadError(prev => ({ ...prev, [index]: true }));
  };

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
          backgroundColor: template.config_diseno?.colores?.secondary || '#fff'
        }}
      >
        {template.config_diseno?.elementos?.map((elemento, index) => (
          <Box 
            key={index} 
            sx={{ 
              textAlign: elemento.type === 'header' ? 'center' : 'left',
              mb: 2,
              color: template.config_diseno.colores?.text || '#000',
              fontFamily: elemento.type === 'header' 
                ? template.config_diseno.fuentes?.titulo 
                : template.config_diseno.fuentes?.cuerpo
            }}
          >
            {elemento.type === 'image' ? (
              elemento.content && !imageLoadError[index] ? (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <img 
                    src={`data:image/png;base64,${elemento.content}`} 
                    alt={`Imagen ${index}`}
                    onError={() => handleImageError(index)}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }} 
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  height: 150, 
                  bgcolor: '#f0f0f0', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed #ccc',
                  borderRadius: 1
                }}>
                  <Typography variant="body2" color="textSecondary">
                    {elemento.content ? 'Error al cargar imagen' : 'Imagen no disponible'}
                  </Typography>
                </Box>
              )
            ) : (
              <Typography 
                variant={elemento.type === 'header' ? 'h4' : 'body1'}
                sx={{
                  fontFamily: elemento.type === 'header' 
                    ? template.config_diseno.fuentes?.titulo 
                    : template.config_diseno.fuentes?.cuerpo,
                  color: template.config_diseno.colores?.text || '#000'
                }}
              >
                {elemento.content}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </PreviewContainer>
  );
};

export default TemplatePreview;