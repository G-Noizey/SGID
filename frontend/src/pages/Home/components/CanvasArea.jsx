import React from 'react';
import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Rect,
  Circle,
  Line,
  Star,
  Transformer,
} from 'react-konva';
import { Paper } from '@mui/material';

const CanvasArea = ({
  canvasSize,
  elements,
  selectedId,
  setSelectedId,
  updateHistory,
  setElements,
  stageRef,
  transformerRef,
}) => {
  const handleDragEnd = (e, id) => {
    const newElements = elements.map((el) =>
      el.id === id
        ? { ...el, x: e.target.x(), y: e.target.y() }
        : el
    );
    setElements(newElements);
    updateHistory(newElements);
  };

  const handleTransformEnd = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale para la siguiente transformación
    node.scaleX(1);
    node.scaleY(1);
    
    const newElements = elements.map((el) => {
      if (el.id === id) {
        let updatedElement = { ...el };
        
        if (el.type === 'text') {
          updatedElement = {
            ...updatedElement,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: Math.max(5, el.fontSize * scaleX),
          };
        } else if (el.type === 'image' || el.type === 'rect' || el.type === 'triangle') {
          updatedElement = {
            ...updatedElement,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, el.width * scaleX),
            height: Math.max(5, el.height * scaleY),
          };
        } else if (el.type === 'circle') {
          updatedElement = {
            ...updatedElement,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            radius: Math.max(5, el.radius * scaleX),
          };
        } else if (el.type === 'star') {
          updatedElement = {
            ...updatedElement,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            innerRadius: Math.max(5, el.innerRadius * scaleX),
            outerRadius: Math.max(5, el.outerRadius * scaleX),
          };
        } else if (el.type === 'line') {
          // Para líneas normales
          const oldPoints = el.points;
          const newPoints = [
            oldPoints[0] * scaleX,
            oldPoints[1] * scaleY,
            oldPoints[2] * scaleX,
            oldPoints[3] * scaleY
          ];
          
          updatedElement = {
            ...updatedElement,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            points: newPoints,
          };
        }
        
        return updatedElement;
      }
      return el;
    });
    
    setElements(newElements);
    updateHistory(newElements);
  };

  const renderElement = (element) => {
    const commonProps = {
      key: element.id,
      id: element.id,
      x: element.x,
      y: element.y,
      rotation: element.rotation || 0,
      opacity: element.opacity !== undefined ? element.opacity : 1,
      draggable: true,
      onDragEnd: (e) => handleDragEnd(e, element.id),
      onTransformEnd: (e) => handleTransformEnd(e, element.id),
      onClick: () => setSelectedId(element.id),
      onTap: () => setSelectedId(element.id),
    };

    switch (element.type) {
      case 'text':
        return (
          <Text
            {...commonProps}
            text={element.text}
            fontSize={element.fontSize}
            fontFamily={element.fontFamily}
            fill={element.fill}
            align={element.align}
            fontStyle={element.fontStyle}
          />
        );
      case 'image':
        return element.imageObject ? (
          <KonvaImage
            {...commonProps}
            image={element.imageObject}
            width={element.width}
            height={element.height}
          />
        ) : null;
      case 'rect':
        return (
          <Rect
            {...commonProps}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            cornerRadius={element.cornerRadius || 0}
          />
        );
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      case 'line':
        return (
          <Line
            {...commonProps}
            points={element.points}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      case 'triangle':
        return (
          <Line
            {...commonProps}
            points={[
              0, element.height,                // esquina inferior izquierda
              element.width / 2, 0,             // punta arriba
              element.width, element.height     // esquina inferior derecha
            ]}
            closed={true}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      case 'star':
        return (
          <Star
            {...commonProps}
            numPoints={element.numPoints || 5}
            innerRadius={element.innerRadius || 40}
            outerRadius={element.outerRadius || 70}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        ref={stageRef}
        style={{ border: '1px solid #ccc', backgroundColor: '#f8f9fa' }}
        onMouseDown={(e) => {
          // Deseleccionar si se hace clic en un área vacía
          if (e.target === e.target.getStage()) {
            setSelectedId(null);
          }
        }}
      >
        <Layer>
          {elements.map((element) => renderElement(element))}
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
    </Paper>
  );
};

export default CanvasArea;
