import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid,
    IconButton, Menu, MenuItem, CircularProgress
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getEventos } from '../../services/eventos.service';
import { descargarPDF, descargarPNG } from '../../services/api';

const Event = () => {
    const [eventos, setEventos] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedEvento, setSelectedEvento] = useState(null);
    const [loading, setLoading] = useState({
        PDF: false,
        PNG: false
    });

    const handleMenuOpen = (event, evento) => {
        setAnchorEl(event.currentTarget);
        setSelectedEvento(evento);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedEvento(null);
    };

    const handleDescargar = async (type) => {
        if (!selectedEvento) return;

        setLoading(prev => ({ ...prev, [type]: true }));
        try {
            console.log("Preparando datos para:", type, selectedEvento); // Debug
            const fileData = type === 'PDF'
                ? await descargarPDF(selectedEvento)
                : await descargarPNG(selectedEvento);

            const blob = new Blob([fileData], {
                type: type === 'PDF' ? 'application/pdf' : 'image/png'
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invitacion_${selectedEvento.titulo.replace(/\s+/g, '_')}.${type.toLowerCase()}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(`Error al descargar ${type}:`, error.response || error);
            toast.error(`Error al generar ${type}: ${error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
            handleMenuClose();
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

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Eventos
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {eventos.map((evento) => (
                    <Grid item xs={4} sm={4} md={4} key={evento.id}>
                        <Paper
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                height: '300px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                backgroundColor: evento.config_diseno?.colores?.secondary || '#f5f5f5',
                                position: 'relative'
                            }}
                            elevation={4}
                        >
                            <IconButton
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                onClick={(e) => handleMenuOpen(e, evento)}
                            >
                                <MoreVertIcon />
                            </IconButton>

                            {/* Contenido del evento */}
                            <Box>
                                <Typography
                                    variant="h5"
                                    gutterBottom
                                    sx={{
                                        color: evento.config_diseno?.colores?.primary || '#1976d2',
                                        fontFamily: evento.config_diseno?.fuentes?.titulo || 'inherit'
                                    }}
                                >
                                    {evento.titulo}
                                </Typography>
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{ color: evento.config_diseno?.colores?.text || '#333' }}
                                >
                                    {evento.descripcion}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    Fecha: {new Date(evento.fecha_evento).toLocaleString()}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    Ubicación: {evento.ubicacion}
                                </Typography>
                            </Box>

                            {/* Elementos de diseño */}
                            <Box sx={{ mt: 1, overflow: 'hidden' }}>
                                {evento.config_diseno?.elementos?.map((elemento, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            mb: 1,
                                            textAlign: elemento.type === 'header' ? 'center' : 'left'
                                        }}
                                    >
                                        {elemento.type === 'header' && (
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontFamily: evento.config_diseno?.fuentes?.titulo || 'inherit',
                                                    color: evento.config_diseno?.colores?.primary || '#1976d2'
                                                }}
                                            >
                                                {elemento.content}
                                            </Typography>
                                        )}
                                        {elemento.type === 'image' && elemento.content && (
                                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                                <img
                                                    src={`data:image/jpeg;base64,${typeof elemento.content === 'string' ? elemento.content : elemento.content.data}`}
                                                    alt="Elemento visual"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '120px',
                                                        objectFit: 'contain',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Menú de descarga */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem
                    onClick={() => handleDescargar('PNG')}
                    disabled={loading.PNG}
                >
                    {loading.PNG ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Generando PNG...
                        </Box>
                    ) : 'Descargar PNG'}
                </MenuItem>
                <MenuItem
                    onClick={() => handleDescargar('PDF')}
                    disabled={loading.PDF}
                >
                    {loading.PDF ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Generando PDF...
                        </Box>
                    ) : 'Descargar PDF'}
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default Event;