// frontend/src/components/Toolbar.jsx
import React from 'react';
import {
  Paper,
  Grid,
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  TextFields as TextIcon,
  CropSquare as SquareIcon,
  Circle as CircleIcon,
  HorizontalRule as LineIcon,
  ChangeHistory as TriangleIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';

const Toolbar = ({
  onAddElement,
  onImageUpload,
  onDelete,
  onUndo,
  onRedo,
  onCancel,
  hasSelection,
  canUndo,
  canRedo,
}) => {
  const [shapeMenuAnchor, setShapeMenuAnchor] = React.useState(null);

  const handleShapeMenuOpen = (event) => {
    setShapeMenuAnchor(event.currentTarget);
  };

  const handleShapeMenuClose = () => {
    setShapeMenuAnchor(null);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <Tooltip title="Añadir texto">
            <IconButton onClick={() => onAddElement('text')}>
              <TextIcon />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item>
          <Tooltip title="Añadir imagen">
            <IconButton component="label">
              <AddPhotoIcon />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={onImageUpload}
              />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item>
          <Tooltip title="Más formas">
            <IconButton onClick={handleShapeMenuOpen}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={shapeMenuAnchor}
            open={Boolean(shapeMenuAnchor)}
            onClose={handleShapeMenuClose}
          >
            <MenuItem
              onClick={() => {
                onAddElement('rect');
                handleShapeMenuClose();
              }}
            >
              <SquareIcon sx={{ mr: 1 }} /> Rectángulo
            </MenuItem>
            <MenuItem
              onClick={() => {
                onAddElement('circle');
                handleShapeMenuClose();
              }}
            >
              <CircleIcon sx={{ mr: 1 }} /> Círculo
            </MenuItem>
            <MenuItem
              onClick={() => {
                onAddElement('line');
                handleShapeMenuClose();
              }}
            >
              <LineIcon sx={{ mr: 1 }} /> Línea
            </MenuItem>
            <MenuItem
              onClick={() => {
                onAddElement('triangle');
                handleShapeMenuClose();
              }}
            >
              <TriangleIcon sx={{ mr: 1 }} /> Triángulo
            </MenuItem>
            <MenuItem
              onClick={() => {
                onAddElement('star');
                handleShapeMenuClose();
              }}
            >
              <StarIcon sx={{ mr: 1 }} /> Estrella
            </MenuItem>
          </Menu>
        </Grid>

        <Grid item>
          <Tooltip title="Eliminar elemento seleccionado">
            <IconButton onClick={onDelete} disabled={!hasSelection}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item>
          <Tooltip title="Deshacer">
            <IconButton onClick={onUndo} disabled={!canUndo}>
              <UndoIcon />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item>
          <Tooltip title="Rehacer">
            <IconButton onClick={onRedo} disabled={!canRedo}>
              <RedoIcon />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item sx={{ flexGrow: 1 }} />

      
      </Grid>
    </Paper>
  );
};

export default Toolbar;
