import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import CanvasArea from './CanvasArea';
import { uploadAsset } from '../../../services/assets.service';

const TemplateEditor = ({
  initialConfig = { width: 1200, height: 800, elements: [] },
  onChange, // función para pasar el diseño actualizado al formulario
  onCancel,
}) => {
  const stageRef = useRef();
  const transformerRef = useRef();
  const [elements, setElements] = useState(initialConfig.elements || []);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([initialConfig.elements || []]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canvasSize = { width: 1200, height: 800 };

  // 🔹 Reconstruir imágenes al cargar plantilla existente
  useEffect(() => {
    if (initialConfig?.elements?.length > 0) {
      const newElements = initialConfig.elements.map((el) => {
        if (el.type === 'image' && el.src) {
          const img = new window.Image();
          img.crossOrigin = 'Anonymous';
          img.src = el.src;
          return { ...el, imageObject: img };
        }
        return el;
      });
      setElements(newElements);
    } else {
      setElements([]);
    }
  }, [initialConfig]);

  // Actualiza el transformer según el elemento seleccionado
  useEffect(() => {
    if (transformerRef.current && selectedId) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  // Actualiza historial
  const updateHistory = useCallback(
    (newElements) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Función central para actualizar elementos y notificar al formulario
  const updateElements = (newElements) => {
    setElements(newElements);
    updateHistory(newElements);
    if (onChange) {
      // 🔹 eliminar imageObject antes de enviar
      const cleanElements = newElements.map(({ imageObject, ...el }) => el);
      onChange({
        width: canvasSize.width,
        height: canvasSize.height,
        elements: cleanElements,
      });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const asset = await uploadAsset(file);
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.src = asset.file;

      img.onload = () => {
        const maxWidth = 300;
        const scale = maxWidth / img.width;
        const newWidth = maxWidth;
        const newHeight = img.height * scale;

        const newElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          x: 100,
          y: 100,
          width: newWidth,
          height: newHeight,
          src: asset.file,
          assetId: asset.id,
          imageObject: img, // interno para canvas
          rotation: 0,
          opacity: 1,
        };

        updateElements([...elements, newElement]);
        setSelectedId(newElement.id);
      };
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const addElement = (type, config = {}) => {
    const defaultConfigs = {
      text: { id: `text-${Date.now()}`, type: 'text', x: 100, y: 100, text: 'Texto de ejemplo', fontSize: 20, fontFamily: 'Arial', fill: '#000', align: 'left', fontStyle: 'normal', rotation: 0, opacity: 1 },
      rect: { id: `rect-${Date.now()}`, type: 'rect', x: 100, y: 100, width: 100, height: 70, fill: '#3498db', stroke: '#000', strokeWidth: 1, cornerRadius: 0, rotation: 0, opacity: 1 },
      circle: { id: `circle-${Date.now()}`, type: 'circle', x: 150, y: 150, radius: 50, fill: '#e74c3c', stroke: '#000', strokeWidth: 1, rotation: 0, opacity: 1 },
      line: { id: `line-${Date.now()}`, type: 'line', points: [100, 100, 200, 100], stroke: '#000', strokeWidth: 2, rotation: 0, opacity: 1 },
      triangle: { id: `triangle-${Date.now()}`, type: 'triangle', x: 100, y: 100, width: 100, height: 87, fill: '#9b59b6', stroke: '#000', strokeWidth: 1, rotation: 0, opacity: 1 },
      star: { id: `star-${Date.now()}`, type: 'star', x: 150, y: 150, numPoints: 5, innerRadius: 40, outerRadius: 70, fill: '#f1c40f', stroke: '#000', strokeWidth: 1, rotation: 0, opacity: 1 },
    };

    const newElement = { ...defaultConfigs[type], ...config };
    updateElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const newElements = elements.filter((el) => el.id !== selectedId);
    updateElements(newElements);
    setSelectedId(null);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      updateElements(history[prevIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      updateElements(history[nextIndex]);
    }
  };

  const handlePropertyChange = (property, value) => {
    if (!selectedId) return;
    const newElements = elements.map(el =>
      el.id === selectedId ? { ...el, [property]: value } : el
    );
    updateElements(newElements);
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <Box sx={{ p: 2 }}>
      <Toolbar
        onAddElement={addElement}
        onImageUpload={handleImageUpload}
        onDelete={deleteSelected}
        onUndo={undo}
        onRedo={redo}
        onCancel={onCancel}
        hasSelection={!!selectedId}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <PropertiesPanel
          selectedElement={selectedElement}
          onPropertyChange={handlePropertyChange}
          canvasSize={canvasSize}
        />
        <CanvasArea
          canvasSize={canvasSize}
          elements={elements}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          updateHistory={updateHistory}
          setElements={updateElements}
          stageRef={stageRef}
          transformerRef={transformerRef}
        />
      </Box>
    </Box>
  );
};

export default TemplateEditor;
