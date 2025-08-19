import React, { useState, useRef, useEffect} from 'react';
import { 
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress
} from '@mui/material';
import { 
  ColorLens as ColorIcon,
  Title as TitleIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  DragIndicator as DragHandleIcon,
  AddPhotoAlternate as AddPhotoIcon,
  TextFields as TextIcon
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente SortableItem
const SortableItem = ({ 
  id, 
  element, 
  colors, 
  onEditContent,
  onRemove,
  editingElementId,
  setEditingElementId,
  onImageChange
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    if (element.type === 'image') {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(id, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{ 
        p: 2, 
        mb: 1, 
        display: 'flex', 
        alignItems: 'center',
        bgcolor: element.type === 'header' ? colors.primary : colors.secondary,
        color: colors.text,
        position: 'relative'
      }}
    >
      <DragHandleIcon 
        {...attributes}
        {...listeners}
        sx={{ mr: 1, cursor: 'grab' }} 
      />
      {element.type === 'header' ? <TitleIcon sx={{ mr: 1 }} /> : 
       element.type === 'image' ? <ImageIcon sx={{ mr: 1 }} /> : 
       <TextIcon sx={{ mr: 1 }} />}
      
      {editingElementId === id ? (
        <TextField
          autoFocus
          fullWidth
          value={element.content}
          onChange={(e) => onEditContent(id, e.target.value)}
          onBlur={() => setEditingElementId(null)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              setEditingElementId(null);
            }
          }}
        />
      ) : element.type === 'image' ? (
        <Box 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={handleImageClick}
        >
          {element.content ? (
            <img 
              src={element.content} 
              alt="Previsualización" 
              style={{ maxWidth: '100%', maxHeight: 100 }} 
            />
          ) : (
            <Typography>Haz clic para subir una imagen</Typography>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </Box>
      ) : (
        <Typography 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => setEditingElementId(id)}
        >
          {element.content}
        </Typography>
      )}
      
      <IconButton size="small" onClick={() => onRemove(id)}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};

// Colores predefinidos
const predefinedColors = [
  { name: 'Morado', value: '#4a2c82' },
  { name: 'Rosa', value: '#ff6b93' },
  { name: 'Azul', value: '#1e88e5' },
  { name: 'Verde', value: '#43a047' },
  { name: 'Amarillo', value: '#fdd835' },
  { name: 'Naranja', value: '#fb8c00' },
];

// Fuentes disponibles
const fontOptions = [
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Lucida Sans Unicode',
  'Palatino Linotype'
];

const defaultElements = [
  { id: 'header', type: 'header', content: 'Título del Evento' },
  { id: 'date', type: 'text', content: 'Fecha: [Fecha]' },
  { id: 'location', type: 'text', content: 'Lugar: [Ubicación]' }
];

const CreateTemplateForm = ({ onSubmit, onCancel, initialData }) => {
  const [templateName, setTemplateName] = useState('');
  const [elements, setElements] = useState(defaultElements);
  const [editingElementId, setEditingElementId] = useState(null);

  useEffect(() => {
  if (initialData) {
    setTemplateName(initialData.nombre || '');

    const restoredElements = (initialData.config_diseno?.elementos || []).map(el => {
      if (el.type === "image" && el.content) {
        if (typeof el.content === "string") {
          // Si ya viene con dataURL, lo dejamos
          if (el.content.startsWith("data:image")) {
            return el;
          }
          // Si solo viene el base64 pelón, le ponemos prefijo
          return { ...el, content: `data:image/png;base64,${el.content}`};
        } else {
          // Si por error viene como objeto, lo ignoramos o lo vaciamos
          return { ...el, content: "" };
        }
      }
      return el;
    });

    setElements(restoredElements);
    setColors(initialData.config_diseno?.colores || defaultColors);
    setFonts(initialData.config_diseno?.fuentes || defaultFonts);
  }
}, [initialData]);

  const defaultColors = {
  primary: '#4a2c82',
  secondary: '#f8e5ff',
  text: '#333333'
};
const defaultFonts = {
  titulo: 'Georgia',
  cuerpo: 'Arial'
};
  const [colors, setColors] = useState({
    primary: '#4a2c82',
    secondary: '#f8e5ff',
    text: '#333333'
  });
  const [fonts, setFonts] = useState({
    titulo: 'Georgia',
    cuerpo: 'Arial'
  });
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setElements((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const processImageElements = (elements) => {
    return elements.map(element => {
      if (element.type === 'image' && element.content && element.content.startsWith('data:image')) {
        // Extraer solo el base64 sin el prefijo
        const base64Data = element.content.split(',')[1];
        return {
          ...element,
          content: base64Data
        };
      }
      return element;
    });
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const processedElements = processImageElements(elements);
    
    const newTemplate = {
      nombre: templateName || 'Mi Diseño Personalizado',
      config_diseno: {
        colores: colors,
        elementos: processedElements,
        fuentes: fonts
      },
      es_temporal: true
    };
    
    onSubmit(newTemplate);
  };

  const handleEditContent = (id, content) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, content } : el
    ));
  };

  const handleRemoveElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
  };

  const handleImageChange = (id, imageData) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, content: imageData } : el
    ));
  };

  const addImageElement = () => {
    const newId = `image-${Date.now()}`;
    setElements([...elements, { 
      id: newId, 
      type: 'image', 
      content: '' 
    }]);
  };

  const addTextElement = () => {
    const newId = `text-${Date.now()}`;
    setElements([...elements, { 
      id: newId, 
      type: 'text', 
      content: 'Nuevo texto...' 
    }]);
  };

  const handleColorChange = (name, value) => {
    setColors({
      ...colors,
      [name]: value
    });
  };

  const handleFontChange = (type, value) => {
    setFonts({
      ...fonts,
      [type]: value
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        label="Nombre de la Plantilla"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Typography variant="h6" gutterBottom>Paleta de Colores</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(colors).map(([name, color]) => (
          <Grid item xs={12} key={name}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(name, e.target.value)}
                style={{ width: 50, height: 50 }}
              />
              <TextField
                fullWidth
                value={color}
                onChange={(e) => handleColorChange(name, e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box 
                      sx={{ 
                        width: 20, 
                        height: 20, 
                        bgcolor: color, 
                        mr: 1,
                        border: '1px solid #ddd'
                      }} 
                    />
                  ),
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
              Colores predefinidos:
            </Typography>
            <RadioGroup
              row
              value={color}
              onChange={(e) => handleColorChange(name, e.target.value)}
            >
              {predefinedColors.map((c) => (
                <FormControlLabel
                  key={c.value}
                  value={c.value}
                  control={<Radio sx={{ color: c.value }} />}
                  label={c.name}
                  sx={{
                    '& .MuiRadio-root': {
                      color: c.value,
                      '&.Mui-checked': {
                        color: c.value,
                      },
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" gutterBottom>Fuentes</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Fuente para Títulos</InputLabel>
            <Select
              value={fonts.titulo}
              label="Fuente para Títulos"
              onChange={(e) => handleFontChange('titulo', e.target.value)}
            >
              {fontOptions.map(font => (
                <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Fuente para Cuerpo</InputLabel>
            <Select
              value={fonts.cuerpo}
              label="Fuente para Cuerpo"
              onChange={(e) => handleFontChange('cuerpo', e.target.value)}
            >
              {fontOptions.map(font => (
                <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Elementos de Diseño</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<TextIcon />}
          onClick={addTextElement}
        >
          Agregar Texto
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<AddPhotoIcon />}
          onClick={addImageElement}
        >
          Agregar Imagen
        </Button>
      </Box>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={elements.map(el => el.id)}
          strategy={verticalListSortingStrategy}
        >
          <Box sx={{ mb: 3 }}>
            {elements.map((element) => (
              <SortableItem 
                key={element.id} 
                id={element.id} 
                element={element} 
                colors={colors} 
                onEditContent={handleEditContent}
                onRemove={handleRemoveElement}
                editingElementId={editingElementId}
                setEditingElementId={setEditingElementId}
                onImageChange={handleImageChange}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>

      <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 2 }} disabled={submitting}>
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={submitting || !templateName}
        >
          {submitting ? <CircularProgress size={24} /> : 'Guardar Plantilla'}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateTemplateForm;