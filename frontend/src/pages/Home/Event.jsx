import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getEventos } from '../../services/eventos.service';

const Event = () => {
    const [eventos, setEventos] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedEvento, setSelectedEvento] = useState(null);

    const handleMenuOpen = (event, evento) => {
        setAnchorEl(event.currentTarget);
        setSelectedEvento(evento);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedEvento(null);
    };

    const handleMenuAction = (type) => {
        console.log(`Descargar ${type} del evento ID: ${selectedEvento.id}`);
        handleMenuClose();
        // Aquí puedes agregar la lógica para descargar PNG o PDF
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
                                backgroundColor: evento.config_diseno.colores.secondary,
                                position: 'relative'
                            }}
                            elevation={4}
                        >
                            {/* Botón de Opciones */}
                            <IconButton
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                onClick={(e) => handleMenuOpen(e, evento)}
                            >
                                <MoreVertIcon />
                            </IconButton>

                            <Box>
                                <Typography
                                    variant="h5"
                                    gutterBottom
                                    sx={{
                                        color: evento.config_diseno.colores.primary,
                                        fontFamily: evento.config_diseno.fuentes.titulo
                                    }}
                                >
                                    {evento.titulo}
                                </Typography>
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{ color: evento.config_diseno.colores.text }}
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

                            <Box sx={{ mt: 1, overflow: 'hidden' }}>
                                {evento.config_diseno.elementos.map((elemento, index) => (
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
                                                    fontFamily: evento.config_diseno.fuentes.titulo,
                                                    color: evento.config_diseno.colores.primary
                                                }}
                                            >
                                                {elemento.content}
                                            </Typography>
                                        )}
                                        {elemento.type === 'image' && elemento.content && (
                                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                                <img
                                                    src={`data:image/jpeg;base64,${elemento.content}`}
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

            {/* Menu Desplegable */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleMenuAction('PNG')}>PNG</MenuItem>
                <MenuItem onClick={() => handleMenuAction('PDF')}>PDF</MenuItem>
            </Menu>
        </Box>
    );
};

export default Event;
