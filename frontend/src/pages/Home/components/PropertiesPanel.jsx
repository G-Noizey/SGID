import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Box,
  Divider,
} from '@mui/material';

const fontOptions = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Palatino',
  'Garamond',
  'Bookman',
  'Tahoma',
  'Arial Black',
  'Lucida Sans',
];

const colorOptions = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
  '#00ffff', '#ff00ff', '#c0c0c0', '#808080', '#800000', '#808000', 
  '#008000', '#800080', '#008080', '#000080', '#ffa500', '#ffc0cb'
];

const PropertiesPanel = ({ selectedElement, onPropertyChange, canvasSize }) => {
  if (!selectedElement) {
    return (
      <Paper elevation={2} sx={{ p: 2, width: 300 }}>
        <Typography variant="h6" gutterBottom>
          Propiedades
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona un elemento para editar sus propiedades
        </Typography>
      </Paper>
    );
  }

  const renderCommonProperties = () => (
    <>
      <TextField
        label="Posición X"
        type="number"
        value={Math.round(selectedElement.x)}
        onChange={(e) => onPropertyChange('x', parseInt(e.target.value))}
        fullWidth
        margin="normal"
        size="small"
      />
      <TextField
        label="Posición Y"
        type="number"
        value={Math.round(selectedElement.y)}
        onChange={(e) => onPropertyChange('y', parseInt(e.target.value))}
        fullWidth
        margin="normal"
        size="small"
      />
      
      {selectedElement.type !== 'line' && (
        <>
          <Typography gutterBottom sx={{ mt: 2 }}>Rotación</Typography>
          <Slider
            value={selectedElement.rotation || 0}
            onChange={(e, value) => onPropertyChange('rotation', value)}
            min={0}
            max={360}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}°`}
          />
          
          <Typography gutterBottom sx={{ mt: 2 }}>Opacidad</Typography>
          <Slider
            value={selectedElement.opacity !== undefined ? selectedElement.opacity * 100 : 100}
            onChange={(e, value) => onPropertyChange('opacity', value / 100)}
            min={0}
            max={100}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
          />
        </>
      )}
    </>
  );

  const renderTextProperties = () => (
    <>
      <TextField
        label="Texto"
        value={selectedElement.text}
        onChange={(e) => onPropertyChange('text', e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={3}
      />
      <TextField
        label="Tamaño de fuente"
        type="number"
        value={selectedElement.fontSize}
        onChange={(e) => onPropertyChange('fontSize', parseInt(e.target.value))}
        fullWidth
        margin="normal"
        size="small"
      />
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Fuente</InputLabel>
        <Select
          value={selectedElement.fontFamily || 'Arial'}
          onChange={(e) => onPropertyChange('fontFamily', e.target.value)}
          label="Fuente"
        >
          {fontOptions.map(font => (
            <MenuItem key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Estilo</InputLabel>
        <Select
          value={selectedElement.fontStyle || 'normal'}
          onChange={(e) => onPropertyChange('fontStyle', e.target.value)}
          label="Estilo"
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="bold">Negrita</MenuItem>
          <MenuItem value="italic">Cursiva</MenuItem>
          <MenuItem value="bold italic">Negrita y Cursiva</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Alineación</InputLabel>
        <Select
          value={selectedElement.align || 'left'}
          onChange={(e) => onPropertyChange('align', e.target.value)}
          label="Alineación"
        >
          <MenuItem value="left">Izquierda</MenuItem>
          <MenuItem value="center">Centro</MenuItem>
          <MenuItem value="right">Derecha</MenuItem>
          <MenuItem value="justify">Justificado</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ mt: 2 }}>
        <Typography gutterBottom>Color de texto</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {colorOptions.map(color => (
            <Box
              key={color}
              sx={{
                width: 24,
                height: 24,
                backgroundColor: color,
                border: '1px solid #ccc',
                cursor: 'pointer',
                borderRadius: '4px',
                boxShadow: selectedElement.fill === color ? '0 0 0 2px #1976d2' : 'none'
              }}
              onClick={() => onPropertyChange('fill', color)}
            />
          ))}
          <TextField
            type="color"
            value={selectedElement.fill}
            onChange={(e) => onPropertyChange('fill', e.target.value)}
            sx={{ width: 24, height: 24, minWidth: 24, padding: 0 }}
            inputProps={{ 
              style: { 
                width: 24, 
                height: 24, 
                padding: 0,
                cursor: 'pointer'
              } 
            }}
          />
        </Box>
      </Box>
    </>
  );

  const renderShapeProperties = () => (
    <>
      {selectedElement.type !== 'line' && selectedElement.type !== 'star' && (
        <>
          <TextField
            label="Ancho"
            type="number"
            value={Math.round(selectedElement.width)}
            onChange={(e) => onPropertyChange('width', parseInt(e.target.value))}
            fullWidth
            margin="normal"
            size="small"
          />
          <TextField
            label="Alto"
            type="number"
            value={Math.round(selectedElement.height)}
            onChange={(e) => onPropertyChange('height', parseInt(e.target.value))}
            fullWidth
            margin="normal"
            size="small"
          />
        </>
      )}
      
      {selectedElement.type === 'rect' && (
        <TextField
          label="Radio de esquina"
          type="number"
          value={selectedElement.cornerRadius || 0}
          onChange={(e) => onPropertyChange('cornerRadius', parseInt(e.target.value))}
          fullWidth
          margin="normal"
          size="small"
        />
      )}
      
      {selectedElement.type === 'star' && (
        <>
          <TextField
            label="Puntos"
            type="number"
            value={selectedElement.numPoints || 5}
            onChange={(e) => onPropertyChange('numPoints', parseInt(e.target.value))}
            fullWidth
            margin="normal"
            size="small"
          />
          <TextField
            label="Radio interno"
            type="number"
            value={selectedElement.innerRadius || 40}
            onChange={(e) => onPropertyChange('innerRadius', parseInt(e.target.value))}
            fullWidth
            margin="normal"
            size="small"
          />
          <TextField
            label="Radio externo"
            type="number"
            value={selectedElement.outerRadius || 70}
            onChange={(e) => onPropertyChange('outerRadius', parseInt(e.target.value))}
            fullWidth
            margin="normal"
            size="small"
          />
        </>
      )}
      
      <Box sx={{ mt: 2 }}>
        <Typography gutterBottom>Color de relleno</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {colorOptions.map(color => (
            <Box
              key={color}
              sx={{
                width: 24,
                height: 24,
                backgroundColor: color,
                border: '1px solid #ccc',
                cursor: 'pointer',
                borderRadius: '4px',
                boxShadow: selectedElement.fill === color ? '0 0 0 2px #1976d2' : 'none'
              }}
              onClick={() => onPropertyChange('fill', color)}
            />
          ))}
          <TextField
            type="color"
            value={selectedElement.fill}
            onChange={(e) => onPropertyChange('fill', e.target.value)}
            sx={{ width: 24, height: 24, minWidth: 24, padding: 0 }}
            inputProps={{ 
              style: { 
                width: 24, 
                height: 24, 
                padding: 0,
                cursor: 'pointer'
              } 
            }}
          />
        </Box>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography gutterBottom>Color de borde</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {colorOptions.map(color => (
            <Box
              key={color}
              sx={{
                width: 24,
                height: 24,
                backgroundColor: color,
                border: '1px solid #ccc',
                cursor: 'pointer',
                borderRadius: '4px',
                boxShadow: selectedElement.stroke === color ? '0 0 0 2px #1976d2' : 'none'
              }}
              onClick={() => onPropertyChange('stroke', color)}
            />
          ))}
          <TextField
            type="color"
            value={selectedElement.stroke || '#000000'}
            onChange={(e) => onPropertyChange('stroke', e.target.value)}
            sx={{ width: 24, height: 24, minWidth: 24, padding: 0 }}
            inputProps={{ 
              style: { 
                width: 24, 
                height: 24, 
                padding: 0,
                cursor: 'pointer'
              } 
            }}
          />
        </Box>
      </Box>
      
      <TextField
        label="Grosor de borde"
        type="number"
        value={selectedElement.strokeWidth || 0}
        onChange={(e) => onPropertyChange('strokeWidth', parseInt(e.target.value))}
        fullWidth
        margin="normal"
        size="small"
      />
    </>
  );

  const renderImageProperties = () => (
    <>
      <TextField
        label="Ancho"
        type="number"
        value={Math.round(selectedElement.width)}
        onChange={(e) => onPropertyChange('width', parseInt(e.target.value))}
        fullWidth
        margin="normal"
        size="small"
      />
      <TextField
        label="Alto"
        type="number"
        value={Math.round(selectedElement.height)}
        onChange={(e) => onPropertyChange('height', parseInt(e.target.value))}
        fullWidth
        margin="normal"
        size="small"
      />
    </>
  );

  const renderLineProperties = () => (
    <>
      <TextField
        label="Punto inicial X"
        type="number"
        value={Math.round(selectedElement.points[0])}
        onChange={(e) => {
          const newPoints = [...selectedElement.points];
          newPoints[0] = parseInt(e.target.value);
          onPropertyChange('points', newPoints);
        }}
        fullWidth
        margin="normal"
        size="small"
      />
      <TextField
        label="Punto inicial Y"
        type="number"
        value={Math.round(selectedElement.points[1])}
        onChange={(e) => {
          const newPoints = [...selectedElement.points];
          newPoints[1] = parseInt(e.target.value);
          onPropertyChange('points', newPoints);
        }}
        fullWidth
        margin="normal"
        size="small"
      />
      <TextField
        label="Punto final X"
        type="number"
        value={Math.round(selectedElement.points[2])}
        onChange={(e) => {
          const newPoints = [...selectedElement.points];
          newPoints[2] = parseInt(e.target.value);
          onPropertyChange('points', newPoints);
        }}
        fullWidth
        margin="normal"
        size="small"
      />
      <TextField
        label="Punto final Y"
        type="number"
        value={Math.round(selectedElement.points[3])}
        onChange={(e) => {
          const newPoints = [...selectedElement.points];
          newPoints[3] = parseInt(e.target.value);
          onPropertyChange('points', newPoints);
        }}
        fullWidth
        margin="normal"
        size="small"
      />
      
      <Box sx={{ mt: 2 }}>
        <Typography gutterBottom>Color de línea</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {colorOptions.map(color => (
            <Box
              key={color}
              sx={{
                width: 24,
                height: 24,
                backgroundColor: color,
                border: '1px solid #ccc',
                cursor: 'pointer',
                borderRadius: '4px',
                boxShadow: selectedElement.stroke === color ? '0 0 0 2px #1976d2' : 'none'
              }}
              onClick={() => onPropertyChange('stroke', color)}
            />
          ))}
          <TextField
            type="color"
            value={selectedElement.stroke}
            onChange={(e) => onPropertyChange('stroke', e.target.value)}
            sx={{ width: 24, height: 24, minWidth: 24, padding: 0 }}
            inputProps={{ 
              style: { 
                width: 24, 
                height: 24, 
                padding: 0,
                cursor: 'pointer'
              } 
            }}
          />
        </Box>
      </Box>
      
      <TextField
        label="Grosor de línea"
        type="number"
        value={selectedElement.strokeWidth}
        onChange={(e) => onPropertyChange('strokeWidth', parseInt(e.target.value))}
        fullWidth
        margin="normal"
        size="small"
      />
    </>
  );

  return (
    <Paper elevation={2} sx={{ p: 2, width: 300, maxHeight: '80vh', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Propiedades {selectedElement.type && `- ${selectedElement.type}`}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {renderCommonProperties()}
      
      {selectedElement.type === 'text' && (
        <>
          <Divider sx={{ my: 2 }} />
          {renderTextProperties()}
        </>
      )}
      
      {['rect', 'circle', 'triangle', 'star'].includes(selectedElement.type) && (
        <>
          <Divider sx={{ my: 2 }} />
          {renderShapeProperties()}
        </>
      )}
      
      {selectedElement.type === 'image' && (
        <>
          <Divider sx={{ my: 2 }} />
          {renderImageProperties()}
        </>
      )}
      
      {selectedElement.type === 'line' && (
        <>
          <Divider sx={{ my: 2 }} />
          {renderLineProperties()}
        </>
      )}
    </Paper>
  );
};

export default PropertiesPanel;