import React, { useEffect, useState } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Rect, Circle, Line } from 'react-konva';
import { Box, Paper, Typography } from '@mui/material';

const TemplatePreview = ({ template }) => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    if (template?.config_diseno?.elements) {
      const loadImages = async () => {
        const elementsWithImages = await Promise.all(
          template.config_diseno.elements.map(async (element) => {
            if (element.type === 'image' && element.src) {
              return new Promise((resolve) => {
                const img = new window.Image();
                img.src = element.src;
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                  resolve({ ...element, imageObject: img });
                };
                img.onerror = () => {
                  resolve(element);
                };
              });
            }
            return element;
          })
        );
        setElements(elementsWithImages);
      };

      loadImages();
    }
  }, [template]);

  const renderElement = (element) => {
    switch (element.type) {
      case 'text':
        return (
          <Text
            key={element.id}
            x={element.x}
            y={element.y}
            text={element.text}
            fontSize={element.fontSize}
            fontFamily={element.fontFamily}
            fill={element.fill}
          />
        );
      case 'image':
        return element.imageObject ? (
          <KonvaImage
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            image={element.imageObject}
          />
        ) : null;
      case 'rect':
        return (
          <Rect
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      case 'circle':
        return (
          <Circle
            key={element.id}
            x={element.x}
            y={element.y}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      case 'line':
        return (
          <Line
            key={element.id}
            points={element.points}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      default:
        return null;
    }
  };

  if (!template) {
    return (
      <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
        <Typography>No hay plantilla seleccionada</Typography>
      </Paper>
    );
  }

  const { width = 600, height = 800 } = template.config_diseno || {};

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Vista Previa: {template.nombre}
      </Typography>
      <Box sx={{ overflow: 'auto', maxWidth: '100%' }}>
        <Stage width={width} height={height} style={{ border: '1px solid #ccc' }}>
          <Layer>
            {elements.map((element) => renderElement(element))}
          </Layer>
        </Stage>
      </Box>
    </Paper>
  );
};

export default TemplatePreview;