import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, IconButton, Menu, MenuItem, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, useMediaQuery
} from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import { useTheme } from '@mui/material/styles';
import { getEventos } from '../../services/eventos.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Event = () => {
  const [eventos, setEventos] = useState([]);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState({
    PDF: false,
    PNG: false
  });
  const [imageErrors, setImageErrors] = useState({});
  
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const previewRef = useRef(null);

  const handleOpenPreview = (evento) => {
    setSelectedEvento(evento);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setImageErrors({});
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  // Función para generar y descargar PNG
  const handleDownloadPNG = async () => {
    if (!previewRef.current || !selectedEvento) return;
    
    setLoading(prev => ({ ...prev, PNG: true }));
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: selectedEvento.config_diseno?.colores?.secondary || '#ffffff',
        logging: false,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `invitacion_${selectedEvento.titulo.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al generar PNG:', error);
    } finally {
      setLoading(prev => ({ ...prev, PNG: false }));
    }
  };

  // Función para generar y descargar PDF
  const handleDownloadPDF = async () => {
    if (!previewRef.current || !selectedEvento) return;
    
    setLoading(prev => ({ ...prev, PDF: true }));
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: selectedEvento.config_diseno?.colores?.secondary || '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invitacion_${selectedEvento.titulo.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      setLoading(prev => ({ ...prev, PDF: false }));
    }
  };

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await getEventos();
        setEventos(response.data.results);
      } catch (error) {
        console.error('Error fetching eventos:', error);
      }
    };

    fetchEventos();
  }, []);

  // Componente de Preview
  const EventPreview = () => {
    if (!selectedEvento) return null;
    
    const { config_diseno } = selectedEvento;
    const colores = config_diseno?.colores || {};
    const fuentes = config_diseno?.fuentes || {};
    const elementos = config_diseno?.elementos || [];

    return (
      <Dialog
        fullScreen={fullScreen}
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colores.primary || theme.palette.primary.main,
          color: '#fff',
        }}>
          Vista Previa: {selectedEvento.titulo}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClosePreview}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ backgroundColor: '#f5f5f5' }}>
          {/* Contenedor que será capturado para exportación */}
          <div ref={previewRef}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                minHeight: '70vh',
                backgroundColor: colores.secondary || '#ffffff',
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                gap: 3
              }}
            >
              {/* Título principal */}
              <Typography
                variant="h2"
                sx={{
                  color: colores.primary || theme.palette.primary.main,
                  fontFamily: fuentes.titulo || 'inherit',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {selectedEvento.titulo}
              </Typography>
              
              {/* Elementos de diseño */}
              {elementos.map((elemento, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: elemento.type === 'header' ? 'center' : 'left',
                    my: 2,
                    color: colores.text || '#000000',
                    fontFamily: elemento.type === 'header' 
                      ? fuentes.titulo 
                      : fuentes.cuerpo || 'inherit'
                  }}
                >
                  {elemento.type === 'image' && elemento.content ? (
                    imageErrors[index] ? (
                      <Box sx={{
                        height: 200,
                        bgcolor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px dashed #ccc',
                        borderRadius: 1
                      }}>
                        <Typography variant="body2" color="textSecondary">
                          Error al cargar la imagen
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <img
                          src={`data:image/jpeg;base64,${elemento.content}`}
                          alt={`Elemento visual ${index}`}
                          onError={() => handleImageError(index)}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                      </Box>
                    )
                  ) : (
                    <Typography
                      variant={elemento.type === 'header' ? 'h3' : 'body1'}
                      sx={{
                        fontFamily: elemento.type === 'header' 
                          ? fuentes.titulo 
                          : fuentes.cuerpo || 'inherit',
                        color: colores.text || '#000000',
                        lineHeight: 1.6
                      }}
                    >
                      {elemento.content}
                    </Typography>
                  )}
                </Box>
              ))}
              
              {/* Información del evento */}
              <Box sx={{ 
                mt: 'auto', 
                pt: 3, 
                borderTop: '1px solid #eeeeee',
                backgroundColor: colores.background || 'transparent',
                borderRadius: 2,
                p: 3,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h5" sx={{ 
                  color: colores.primary || theme.palette.primary.main,
                  fontFamily: fuentes.titulo || 'inherit',
                  mb: 2
                }}>
                  Detalles del Evento
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  {selectedEvento.descripcion}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Fecha:
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedEvento.fecha_evento).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Hora:
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedEvento.fecha_evento).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Ubicación:
                      </Typography>
                      <Typography variant="body1">
                        {selectedEvento.ubicacion}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </div>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', py: 2, backgroundColor: '#f5f5f5' }}>
          <Button 
            variant="outlined" 
            onClick={handleClosePreview}
            sx={{ mr: 2, minWidth: 120 }}
          >
            Cerrar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading.PNG ? <CircularProgress size={20} /> : <ImageIcon />}
            onClick={handleDownloadPNG}
            disabled={loading.PNG || loading.PDF}
            sx={{ mr: 2, minWidth: 180 }}
          >
            {loading.PNG ? 'Generando PNG...' : 'Descargar PNG'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={loading.PDF ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
            onClick={handleDownloadPDF}
            disabled={loading.PDF || loading.PNG}
            sx={{ minWidth: 180 }}
          >
            {loading.PDF ? 'Generando PDF...' : 'Descargar PDF'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        Eventos
      </Typography>

      {eventos.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          {eventos.map((evento) => (
            <Grid item xs={12} sm={6} md={4} key={evento.id}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: evento.config_diseno?.colores?.secondary || '#f5f5f5',
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
                elevation={4}
              >
                {/* Contenido del evento */}
                <Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      color: evento.config_diseno?.colores?.primary || '#1976d2',
                      fontFamily: evento.config_diseno?.fuentes?.titulo || 'inherit',
                      fontWeight: 'bold',
                      pr: 4,
                      minHeight: '3em'
                    }}
                  >
                    {evento.titulo}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ 
                      color: evento.config_diseno?.colores?.text || '#333',
                      minHeight: '4em',
                      mb: 2
                    }}
                  >
                    {evento.descripcion}
                  </Typography>
                  
                  <Box sx={{ 
                    backgroundColor: 'rgba(0,0,0,0.05)', 
                    p: 1, 
                    borderRadius: 1,
                    mb: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Fecha:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(evento.fecha_evento).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Hora:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(evento.fecha_evento).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Ubicación:
                      </Typography>
                      <Typography variant="body2">
                        {evento.ubicacion}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Elementos de diseño */}
                <Box sx={{ mt: 2, overflow: 'hidden' }}>
                  {evento.config_diseno?.elementos?.slice(0, 2).map((elemento, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 1,
                        textAlign: elemento.type === 'header' ? 'center' : 'left'
                      }}
                    >
                      {elemento.type === 'image' && elemento.content && (
                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                          <img
                            src={`data:image/jpeg;base64,${elemento.content}`}
                            alt="Elemento visual"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100px',
                              objectFit: 'contain',
                              borderRadius: '8px'
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
                
                {/* Botón de Vista Previa en la parte inferior */}
                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<PreviewIcon />}
                    onClick={() => handleOpenPreview(evento)}
                    sx={{
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      letterSpacing: 0.5,
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        backgroundColor: theme.palette.primary.dark
                      }
                    }}
                  >
                    Ver Vista Previa
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de Vista Previa */}
      <EventPreview />
    </Box>
  );
};

export default Event;